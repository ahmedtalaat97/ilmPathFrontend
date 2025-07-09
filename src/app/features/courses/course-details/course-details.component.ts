import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService, SectionResponse, LessonResponse, CourseCreationResponse } from '../course.service';
import { EnrollmentService } from '../../enrollment/enrollment.service';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../cart.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatChipsModule,
    MatExpansionModule,
    MatIconModule,
    LoaderComponent,
    MatSnackBarModule
  ],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.css',
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
export class CourseDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private enrollmentService = inject(EnrollmentService);
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);

  course: CourseCreationResponse | null = null;
  sections: SectionResponse[] = [];
  lectures: LessonResponse[] = [];
  totalDuration: number = 0; // in minutes
  loading = true;
  error: string | null = null;
  isEnrolled = false;
  checkingEnrollment = false;

  couponControl = new FormControl('');
  couponApplied: string | null = null;

  lecturesBySection: { [sectionId: number]: LessonResponse[] } = {};

  isMobile = false;

  ngOnInit() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile.bind(this));
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'No course ID provided.';
      this.loading = false;
      return;
    }
    this.fetchCourseDetails(+id);
  }

  checkMobile() {
    this.isMobile = window.matchMedia('(max-width: 900px)').matches;
  }

  fetchCourseDetails(id: number) {
    this.loading = true;
    this.courseService.getCourseById(id).subscribe({
      next: (course) => {
        this.course = course;
        this.checkEnrollmentStatus(id);
        this.courseService.getSectionsByCourse(id).subscribe({
          next: (sections) => {
            this.sections = sections;
            this.fetchAllLecturesAndDuration();
          },
          error: (err) => {
            this.error = 'Failed to load sections.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load course.';
        this.loading = false;
      }
    });
  }

  checkEnrollmentStatus(courseId: number) {
    this.checkingEnrollment = true;
    this.enrollmentService.checkEnrollment(courseId).subscribe({
      next: (enrollmentStatus) => {
        this.isEnrolled = enrollmentStatus.isEnrolled;
        this.checkingEnrollment = false;
      },
      error: (err) => {
        console.error('Error checking enrollment:', err);
        this.isEnrolled = false;
        this.checkingEnrollment = false;
      }
    });
  }

  fetchAllLecturesAndDuration() {
    if (!this.sections.length) {
      this.totalDuration = 0;
      this.loading = false;
      return;
    }
    let total = 0;
    let loaded = 0;
    this.lectures = [];
    this.lecturesBySection = {};
    for (const section of this.sections) {
      this.courseService.getLecturesBySection(section.id).subscribe({
        next: (lectures) => {
          this.lectures.push(...lectures);
          this.lecturesBySection[section.id] = lectures;
          total += lectures.reduce((sum, l) => sum + (l.durationInMinutes || 0), 0);
          loaded++;
          if (loaded === this.sections.length) {
            this.totalDuration = total;
            this.loading = false;
          }
        },
        error: () => {
          loaded++;
          if (loaded === this.sections.length) {
            this.totalDuration = total;
            this.loading = false;
          }
        }
      });
    }
  }

  applyCoupon() {
    this.couponApplied = this.couponControl.value;
    // Here you would call a coupon API if available
  }

  addToCart() {
    if (!this.course) return;
    this.cartService.addToCart(this.course.id).subscribe({
      next: (cart) => {
        this.snackBar.open('Course added to cart!', 'Close', { duration: 2000, panelClass: 'snackbar-success' });
      },
      error: (err) => {
        this.snackBar.open('Failed to add course to cart.', 'Close', { duration: 2500, panelClass: 'snackbar-error' });
      }
    });
  }

  startLearning() {
    if (this.course) {
      this.router.navigate(['/courses', this.course.id, 'learn']);
    }
  }
}
