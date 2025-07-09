import { Component, OnInit } from '@angular/core';
import { EnrollmentService } from '../../enrollment/enrollment.service';
import { CourseService } from '../course.service';
import { Router, RouterModule } from '@angular/router';
import { Course } from '../../../shared/models/course.model';
import { CommonModule } from '@angular/common';
import { CourseCardComponent } from '../../../shared/components/course-card/course-card.component';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css'],
  imports: [CommonModule, RouterModule, CourseCardComponent]
})
export class MyCoursesComponent implements OnInit {
  courseCards: { enrollment: any, course: Course }[] = [];
  loading = true;
  error = false;

  constructor(
    private enrollmentService: EnrollmentService,
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.enrollmentService.getMyEnrollments().subscribe({
      next: (res) => {
        const enrollments = res.items || [];
        if (enrollments.length === 0) {
          this.loading = false;
          return;
        }
        let loaded = 0;
        enrollments.forEach((enrollment: any) => {
          this.courseService.getCourseById(enrollment.courseId).subscribe({
            next: (course) => {
              const mappedCourse = { ...course, id: course.id.toString() };
              this.courseCards.push({ enrollment, course: mappedCourse });
              loaded++;
              if (loaded === enrollments.length) this.loading = false;
            },
            error: () => {
              loaded++;
              if (loaded === enrollments.length) this.loading = false;
            }
          });
        });
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  goToLearn(courseId: number | string) {
    this.router.navigate([`/courses/${courseId}/learn`]);
  }
} 