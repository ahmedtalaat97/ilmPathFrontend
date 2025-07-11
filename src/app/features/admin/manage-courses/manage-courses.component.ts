import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CourseService } from '../../courses/course.service';

interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  status: string;
  createdDate: string;
  price: number;
  description?: string;
}

interface CoursesResponse {
  items: Course[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-manage-courses',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatPaginatorModule
  ],
  templateUrl: './manage-courses.component.html',
  styleUrls: ['./manage-courses.component.css']
})
export class ManageCoursesComponent implements OnInit {
  courses: Course[] = [];
  displayedColumns = ['title', 'category', 'instructor', 'status', 'price', 'actions'];
  loading = false;
  error = '';
  actionLoading: { [key: string]: boolean } = {};

  // Pagination
  totalCount = 0;
  page = 1;
  pageSize = 10;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(page: number = this.page, pageSize: number = this.pageSize): void {
    this.loading = true;
    this.error = '';
    
    this.http.get<CoursesResponse>(`${environment.apiUrl}/admin/courses?page=${page}&pageSize=${pageSize}`).subscribe({
      next: (response) => {
        this.courses = response.items;
        this.totalCount = response.totalCount;
        this.page = response.page;
        this.pageSize = response.pageSize;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.error = 'Failed to load courses. Please try again.';
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadCourses(this.page, this.pageSize);
  }

  approveCourse(course: Course): void {
    if (course.status === 'Approved') return;
    
    this.actionLoading[course.id] = true;
    
    this.http.patch(`${environment.apiUrl}/admin/courses/${course.id}/approve`, {}).subscribe({
      next: () => {
        course.status = 'Approved';
        this.actionLoading[course.id] = false;
        this.snackBar.open('Course approved successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('Error approving course:', error);
        this.actionLoading[course.id] = false;
        this.snackBar.open('Failed to approve course', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  deleteCourse(course: Course): void {
    if (!confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
      return;
    }
    
    this.actionLoading[course.id] = true;
    
    this.http.delete(`${environment.apiUrl}/admin/courses/${course.id}`).subscribe({
      next: () => {
        this.courses = this.courses.filter(c => c.id !== course.id);
        this.actionLoading[course.id] = false;
        this.snackBar.open('Course deleted successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        // If the page is now empty, reload previous page if possible
        if (this.courses.length === 0 && this.page > 1) {
          this.page--;
          this.loadCourses(this.page, this.pageSize);
        } else {
          this.loadCourses(this.page, this.pageSize);
        }
      },
      error: (error) => {
        console.error('Error deleting course:', error);
        this.actionLoading[course.id] = false;
        this.snackBar.open('Failed to delete course', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }
} 