import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService } from '../../rating.service';
import { AddCourseRatingRequest } from '../../../../shared/models/rating.model';
import { RatingDisplayComponent } from '../../../../shared/components/rating-display/rating-display.component';

@Component({
  selector: 'app-add-rating',
  standalone: true,
  imports: [CommonModule, FormsModule, RatingDisplayComponent],
  template: `
    <div class="add-rating">
      <div class="rating-form" *ngIf="!submitted">
        <h4>Rate this course</h4>
        
        <div class="rating-input">
          <label>Your rating:</label>
          <app-rating-display 
            [rating]="newRating.ratingValue" 
            [interactive]="true"
            (ratingChange)="onRatingChange($event)">
          </app-rating-display>
          <span class="rating-label" *ngIf="newRating.ratingValue > 0">
            {{ getRatingLabel(newRating.ratingValue) }}
          </span>
        </div>

        <div class="review-input">
          <label for="reviewText">Write a review (optional):</label>
          <textarea 
            id="reviewText"
            [(ngModel)]="newRating.reviewText"
            placeholder="Share your experience with this course..."
            rows="4"
            maxlength="1000"
            class="review-textarea"
          ></textarea>
          <div class="character-count">
            {{ (newRating.reviewText || '').length }}/1000
          </div>
        </div>

        <div class="form-actions">
          <button 
            (click)="submitRating()" 
            [disabled]="!canSubmit || submitting"
            class="submit-btn"
          >
            {{ submitting ? 'Submitting...' : 'Submit Rating' }}
          </button>
          <button 
            (click)="cancel()" 
            [disabled]="submitting"
            class="cancel-btn"
          >
            Cancel
          </button>
        </div>

        <div class="error-message" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>
      </div>

      <div class="success-message" *ngIf="submitted">
        <div class="success-icon">✓</div>
        <h4>Thank you for your review!</h4>
        <p>Your rating has been submitted successfully.</p>
        <button (click)="resetForm()" class="reset-btn">
          Add Another Review
        </button>
      </div>
    </div>
  `,
  styles: [`
    .add-rating {
      background: #333;
      border: 1px solid #555;
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1rem 0;
      color: #f1f1f1;
    }

    .rating-form h4 {
      margin: 0 0 1.5rem 0;
      color: #fff;
      font-weight: 600;
    }

    .rating-input {
      margin-bottom: 1.5rem;
    }

    .rating-input label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #fff;
    }

    .rating-label {
      margin-left: 1rem;
      color: #b0b0b0;
      font-style: italic;
    }

    .review-input {
      margin-bottom: 1.5rem;
    }

    .review-input label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #fff;
    }

    .review-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #555;
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.5;
      resize: vertical;
      min-height: 100px;
      background: #2a2a2a;
      color: #f1f1f1;
      transition: border-color 0.3s ease;
    }

    .review-textarea:focus {
      outline: none;
      border-color: #ff6b35;
      box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.25);
    }

    .review-textarea::placeholder {
      color: #888;
    }

    .character-count {
      text-align: right;
      font-size: 12px;
      color: #b0b0b0;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .submit-btn {
      background: linear-gradient(45deg, #ff6b35, #ff8c42);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
    }

    .submit-btn:disabled {
      background: #555;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .cancel-btn {
      background: #555;
      color: white;
      border: 1px solid #666;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .cancel-btn:hover:not(:disabled) {
      background: #666;
      border-color: #777;
    }

    .cancel-btn:disabled {
      background: #444;
      cursor: not-allowed;
      border-color: #555;
    }

    .error-message {
      color: #ff6b6b;
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid rgba(255, 107, 107, 0.3);
      border-radius: 8px;
      padding: 0.75rem;
      margin-top: 1rem;
    }

    .success-message {
      text-align: center;
      padding: 2rem;
      background: #333;
      border-radius: 12px;
      color: #f1f1f1;
    }

    .success-icon {
      font-size: 3rem;
      color: #4caf50;
      margin-bottom: 1rem;
    }

    .success-message h4 {
      color: #4caf50;
      margin: 0 0 0.5rem 0;
    }

    .success-message p {
      color: #b0b0b0;
      margin: 0 0 1.5rem 0;
    }

    .reset-btn {
      background: linear-gradient(45deg, #ff6b35, #ff8c42);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
    }

    .reset-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
    }

    @media (max-width: 768px) {
      .form-actions {
        flex-direction: column;
      }

      .submit-btn,
      .cancel-btn {
        width: 100%;
      }
    }
  `]
})
export class AddRatingComponent {
  @Input() courseId!: number;
  @Output() ratingAdded = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  newRating: AddCourseRatingRequest = {
    courseId: 0,
    ratingValue: 0,
    reviewText: ''
  };

  submitting = false;
  submitted = false;
  errorMessage = '';

  constructor(private ratingService: RatingService) {}

  ngOnInit() {
    this.newRating.courseId = this.courseId;
  }

  onRatingChange(rating: number) {
    this.newRating.ratingValue = rating;
    this.errorMessage = '';
  }

  get canSubmit(): boolean {
    return this.newRating.ratingValue > 0;
  }

  getRatingLabel(rating: number): string {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return labels[rating as keyof typeof labels] || '';
  }

  submitRating() {
    if (!this.canSubmit) {
      this.errorMessage = 'Please select a rating before submitting.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.ratingService.addCourseRating(this.newRating).subscribe({
      next: (response) => {
        this.submitting = false;
        this.submitted = true;
        this.ratingAdded.emit();
        console.log('Rating submitted successfully:', response);
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error submitting rating:', error);
        
        if (error.status === 400) {
          this.errorMessage = 'You have already rated this course or are not enrolled in it.';
        } else if (error.status === 401) {
          this.errorMessage = 'You must be logged in to rate a course.';
        } else {
          this.errorMessage = 'An error occurred while submitting your rating. Please try again.';
        }
      }
    });
  }

  cancel() {
    this.resetForm();
    this.cancelled.emit();
  }

  resetForm() {
    this.newRating = {
      courseId: this.courseId,
      ratingValue: 0,
      reviewText: ''
    };
    this.submitted = false;
    this.submitting = false;
    this.errorMessage = '';
  }
} 