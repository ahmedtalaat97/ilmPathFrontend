import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseRatingsComponent } from '../course-ratings/course-ratings.component';
import { AddRatingComponent } from '../add-rating/add-rating.component';
import { RatingSummaryComponent } from '../rating-summary/rating-summary.component';

@Component({
  selector: 'app-course-detail-with-ratings',
  standalone: true,
  imports: [
    CommonModule,
    CourseRatingsComponent,
    AddRatingComponent,
    RatingSummaryComponent
  ],
  template: `
    <div class="course-detail-with-ratings">
      <!-- Course Basic Info (you would include your course details here) -->
      <div class="course-info">
        <h1>{{ courseName }}</h1>
        <p>{{ courseDescription }}</p>
        
        <!-- Rating Summary -->
        <div class="rating-summary-section">
          <app-rating-summary 
            [courseId]="courseId" 
            [showBreakdown]="true"
            [compact]="false">
          </app-rating-summary>
        </div>
      </div>

      <!-- Rating Actions -->
      <div class="rating-actions">
        <div class="action-buttons">
          <button 
            *ngIf="!showAddRating && canRate" 
            (click)="toggleAddRating()"
            class="rate-btn"
          >
            Rate this course
          </button>
          
          <button 
            *ngIf="showAllRatings"
            (click)="toggleRatingsView()"
            class="toggle-ratings-btn"
          >
            {{ showRatings ? 'Hide Reviews' : 'Show All Reviews' }}
          </button>
        </div>

        <!-- Add Rating Form -->
        <div *ngIf="showAddRating">
          <app-add-rating 
            [courseId]="courseId"
            (ratingAdded)="onRatingAdded()"
            (cancelled)="onAddRatingCancelled()">
          </app-add-rating>
        </div>
      </div>

      <!-- All Ratings List -->
      <div *ngIf="showRatings" class="ratings-section">
        <app-course-ratings 
          [courseId]="courseId">
        </app-course-ratings>
      </div>
    </div>
  `,
  styles: [`
    .course-detail-with-ratings {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .course-info {
      margin-bottom: 2rem;
    }

    .course-info h1 {
      color: #333;
      margin-bottom: 1rem;
    }

    .course-info p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .rating-summary-section {
      margin: 2rem 0;
    }

    .rating-actions {
      margin: 2rem 0;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .rate-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .rate-btn:hover {
      background: #0056b3;
    }

    .toggle-ratings-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .toggle-ratings-btn:hover {
      background: #545b62;
    }

    .ratings-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
    }

    @media (max-width: 768px) {
      .course-detail-with-ratings {
        padding: 1rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .rate-btn,
      .toggle-ratings-btn {
        width: 100%;
      }
    }
  `]
})
export class CourseDetailWithRatingsComponent {
  @Input() courseId!: number;
  @Input() courseName: string = 'Sample Course Name';
  @Input() courseDescription: string = 'Sample course description';
  @Input() canRate: boolean = true; // This should be determined by enrollment status
  @Input() showAllRatings: boolean = true;

  showAddRating = false;
  showRatings = false;

  toggleAddRating() {
    this.showAddRating = !this.showAddRating;
  }

  toggleRatingsView() {
    this.showRatings = !this.showRatings;
  }

  onRatingAdded() {
    this.showAddRating = false;
    // Optionally refresh the rating summary or show a success message
    console.log('Rating added successfully!');
  }

  onAddRatingCancelled() {
    this.showAddRating = false;
  }
} 