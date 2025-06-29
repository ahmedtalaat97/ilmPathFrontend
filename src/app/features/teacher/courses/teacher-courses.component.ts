import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Course } from '../../../shared/models/course.model';
import { CourseService } from '../../courses/course.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

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
    MatDividerModule
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
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    // For now, loading all courses - in production, filter by instructor ID
    this.courseService.getCourses().subscribe({
      next: (response) => {
        this.courses = response.items;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalCourses = this.courses.length;
    this.publishedCourses = this.courses.filter(c => c.isPublished).length;
    this.draftCourses = this.courses.filter(c => !c.isPublished).length;
    // TODO: Calculate enrollments from enrollment data
    this.totalEnrollments = 0;
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