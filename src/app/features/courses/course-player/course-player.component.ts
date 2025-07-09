import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CourseService } from '../course.service';
import { EnrollmentService } from '../../enrollment/enrollment.service';

export interface CourseWithContent {
  id: number;
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
  thumbnailImageUrl?: string;
  categoryId?: number;
  categoryName?: string;
  instructorId: string;
  instructorName?: string;
  totalDurationMinutes: number;
  totalLecturesCount: number;
  sectionsCount: number;
  sections: SectionWithLectures[];
}

export interface SectionWithLectures {
  id: number;
  courseId: number;
  title: string;
  description: string;
  order: number;
  durationMinutes: number;
  lecturesCount: number;
  lectures: Lecture[];
}

export interface Lecture {
  id: number;
  sectionId: number;
  title: string;
  videoUrl: string;
  durationInMinutes?: number;
  order: number;
  isPreviewAllowed: boolean;
}

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './course-player.component.html',
  styleUrls: ['./course-player.component.css']
})
export class CoursePlayerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private enrollmentService = inject(EnrollmentService);

  course: CourseWithContent | null = null;
  currentLecture: Lecture | null = null;
  currentSectionIndex = 0;
  currentLectureIndex = 0;
  loading = true;
  error: string | null = null;
  isEnrolled = false;
  sidenavOpened = true;

  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('id');
    console.log(courseId);
    if (courseId) {
      this.checkEnrollmentAndLoadCourse(+courseId);
    }
  }

  private async checkEnrollmentAndLoadCourse(courseId: number) {
    try {
      // Check if user is enrolled
      const enrollmentCheck = await this.enrollmentService.checkEnrollment(courseId).toPromise();
      
      if (!enrollmentCheck?.isEnrolled) {
        this.error = 'You are not enrolled in this course.';
        this.loading = false;
        return;
      }

      this.isEnrolled = true;
      
      // Load course with content
      const courseData = await this.courseService.getCourseWithContent(courseId).toPromise();
      this.course = courseData || null;
      
      // Set first lecture as current
      if (this.course && this.course.sections.length > 0 && this.course.sections[0].lectures.length > 0) {
        this.currentLecture = this.course.sections[0].lectures[0];
        this.currentSectionIndex = 0;
        this.currentLectureIndex = 0;
      }
      
      this.loading = false;
    } catch (error) {
      console.error('Error loading course:', error);
      this.error = 'Failed to load course. Please try again.';
      this.loading = false;
    }
  }

  selectLecture(sectionIndex: number, lectureIndex: number) {
    if (this.course) {
      this.currentSectionIndex = sectionIndex;
      this.currentLectureIndex = lectureIndex;
      this.currentLecture = this.course.sections[sectionIndex].lectures[lectureIndex];
    }
  }

  goToNextLecture() {
    if (!this.course) return;

    const currentSection = this.course.sections[this.currentSectionIndex];
    
    // Check if there's a next lecture in current section
    if (this.currentLectureIndex < currentSection.lectures.length - 1) {
      this.selectLecture(this.currentSectionIndex, this.currentLectureIndex + 1);
    } 
    // Check if there's a next section
    else if (this.currentSectionIndex < this.course.sections.length - 1) {
      this.selectLecture(this.currentSectionIndex + 1, 0);
    }
  }

  goToPreviousLecture() {
    if (!this.course) return;

    // Check if there's a previous lecture in current section
    if (this.currentLectureIndex > 0) {
      this.selectLecture(this.currentSectionIndex, this.currentLectureIndex - 1);
    } 
    // Check if there's a previous section
    else if (this.currentSectionIndex > 0) {
      const previousSection = this.course.sections[this.currentSectionIndex - 1];
      this.selectLecture(this.currentSectionIndex - 1, previousSection.lectures.length - 1);
    }
  }

  canGoNext(): boolean {
    if (!this.course) return false;
    const isLastLectureInSection = this.currentLectureIndex === this.course.sections[this.currentSectionIndex].lectures.length - 1;
    const isLastSection = this.currentSectionIndex === this.course.sections.length - 1;
    return !(isLastLectureInSection && isLastSection);
  }

  canGoPrevious(): boolean {
    return this.currentSectionIndex > 0 || this.currentLectureIndex > 0;
  }

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  backToCourse() {
    console.log(this.course?.id);
    this.router.navigate(['/courses', this.course?.id]);
  }
} 