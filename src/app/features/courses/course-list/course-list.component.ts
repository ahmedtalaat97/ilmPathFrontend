import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../course.service';
import { Course } from '../../../shared/models/course.model';
import { CourseCardComponent } from '../../../shared/components/course-card/course-card.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EnrollmentService } from '../../enrollment/enrollment.service';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CommonModule,
    CourseCardComponent,
    LoaderComponent,
    MatPaginatorModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('350ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('350ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class CourseListComponent implements OnInit {

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router,
    private enrollmentService: EnrollmentService
  ) {
    console.log('CourseListComponent initialized');
  }

  courses: Course[] = [];
  loading = true;
  pageIndex = 0;
  pageSize = 8;
  totalCourses = 0;
  selectedCategoryId: number | null = null;
  enrolledCourseIds = new Set<number | string>();
  
  ngOnInit(): void {
    console.log('CourseListComponent ngOnInit called');
    this.enrollmentService.getMyEnrollments().subscribe({
      next: (res) => {
        for (const enrollment of res.items || []) {
          this.enrolledCourseIds.add(enrollment.courseId);
        }
      }
    });
    
    // Subscribe to query parameters for category filtering
    this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['category'] ? +params['category'] : null;
      this.pageIndex = 0; // Reset to first page when category changes
      this.loadCourses();
    });
  }

  loadCourses() {
    this.loading = true;
    this.courseService.getCourses(this.pageIndex + 1, this.pageSize, this.selectedCategoryId).subscribe({
      next: (response) => {
        console.log("API Response Received:", response);
        this.courses = response.items;
        this.totalCourses = response.totalCount || 0;
        console.log("Courses loaded:", this.courses.length);
        this.loading = false;
      },
      error: (err) => {
        console.error("API Error:", err);
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCourses();
  }

  clearCategoryFilter() {
    this.router.navigate(['/courses']);
  }

  isUserEnrolled(courseId: number | string): boolean {
    return this.enrolledCourseIds.has(courseId);
  }
}   
