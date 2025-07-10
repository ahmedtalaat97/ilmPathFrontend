import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Course } from '../../../shared/models/course.model';
import { CourseService } from '../../courses/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-teacher-courses',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    LoaderComponent
  ],
  templateUrl: './teacher-courses.component.html',
  styleUrls: ['./teacher-courses.component.css']
})
export class TeacherCoursesComponent implements OnInit {

  courses: Course[] = [];
  loading = true;

  // Quick stats
  totalCourses = 0;
  publishedCourses = 0;
  draftCourses = 0;
  totalEnrollments = 0;

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Get current user
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) {
      console.error('No current user found');
      this.loading = false;
      return;
    }

    // Load both courses and student count in parallel
    forkJoin({
      courses: this.courseService.getCoursesByInstructor(),
      studentsCount: this.courseService.getInstructorStudentsCount(currentUser.id)
    }).subscribe({
      next: (result) => {
        this.courses = result.courses.items;
        this.totalEnrollments = result.studentsCount;
        this.calculateStats();
        this.loading = false;
        console.log('Dashboard data loaded:', {
          coursesCount: this.courses.length,
          studentsCount: this.totalEnrollments
        });
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  loadCourses(): void {
    this.loading = true;
    
    // Get current user
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) {
      console.error('No current user found');
      this.loading = false;
      return;
    }

    // Load courses for the current instructor
    this.courseService.getCoursesByInstructor().subscribe({
      next: (response) => {
        this.courses = response.items;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading instructor courses:', error);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalCourses = this.courses.length;
    this.publishedCourses = this.courses.filter(c => c.isPublished).length;
    this.draftCourses = this.courses.filter(c => !c.isPublished).length;
    // totalEnrollments is now loaded from the API, no need to calculate here
  }

  createCourse(): void {
    this.router.navigate(['/teacher/courses/new']);
  }

  editCourse(courseId: string): void {
    this.router.navigate(['/teacher/courses', courseId, 'edit']);
  }

  togglePublish(course: Course): void {
    // TODO: Implement publish/unpublish functionality
    console.log('Toggle publish for course:', course.id);
  }

  deleteCourse(courseId: string): void {
    // TODO: Implement delete functionality with confirmation dialog
    console.log('Delete course:', courseId);
  }

  duplicateCourse(course: Course): void {
    // TODO: Implement course duplication
    console.log('Duplicate course:', course.id);
  }
} 