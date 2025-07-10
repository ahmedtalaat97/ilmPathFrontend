import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingService } from '../../rating.service';
import { CourseRating, GetCourseRatingsQuery } from '../../../../shared/models/rating.model';
import { PagedResult } from '../../../../shared/models/paged-result.model';
import { RatingDisplayComponent } from '../../../../shared/components/rating-display/rating-display.component';

interface RatingDistribution {
  star: number;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-rating-summary',
  standalone: true,
  imports: [CommonModule, RatingDisplayComponent],
  template: `
    <div class="rating-summary" *ngIf="!loading">
      <div class="average-rating">
        <div class="rating-value">{{ averageRating.toFixed(1) }}</div>
        <div class="rating-stars">
          <app-rating-display [rating]="averageRating" [interactive]="false" [showText]="false"></app-rating-display>
        </div>
        <div class="total-reviews">{{ totalReviews }} {{ totalReviews === 1 ? 'review' : 'reviews' }}</div>
      </div>

      <div class="rating-breakdown" *ngIf="showBreakdown && distribution.length > 0">
        <div class="breakdown-item" *ngFor="let item of distribution">
          <div class="star-label">{{ item.star }} ★</div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="item.percentage"></div>
          </div>
          <div class="count">{{ item.count }}</div>
        </div>
      </div>

      <div class="no-ratings" *ngIf="totalReviews === 0">
        <p>No ratings yet</p>
      </div>
    </div>

    <div class="loading" *ngIf="loading">
      <p>Loading ratings...</p>
    </div>
  `,
  styles: [`
    .rating-summary {
      padding: 1.5rem;
      background: #333;
      border-radius: 12px;
      border: 1px solid #555;
      color: #f1f1f1;
    }

    .average-rating {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .rating-value {
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
    }

    .rating-stars {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .total-reviews {
      font-size: 0.9rem;
      color: #b0b0b0;
      margin-left: auto;
    }

    .rating-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .breakdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9rem;
    }

    .star-label {
      min-width: 40px;
      color: #e0e0e0;
      font-weight: 500;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: #555;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(45deg, #ffc107, #ffb300);
      transition: width 0.3s ease;
    }

    .count {
      min-width: 30px;
      text-align: right;
      color: #b0b0b0;
      font-size: 0.85rem;
    }

    .no-ratings {
      text-align: center;
      color: #888;
      font-style: italic;
      padding: 1rem;
    }

    .loading {
      text-align: center;
      color: #b0b0b0;
      padding: 1rem;
    }

    /* Compact version for course cards */
    .rating-summary.compact {
      padding: 0.5rem 0;
      border: none;
      background: transparent;
    }

    .rating-summary.compact .average-rating {
      margin-bottom: 0;
      gap: 0.5rem;
    }

    .rating-summary.compact .rating-value {
      font-size: 1.2rem;
    }

    .rating-summary.compact .total-reviews {
      font-size: 0.8rem;
    }

    .rating-summary.compact .rating-breakdown {
      display: none;
    }

    @media (max-width: 768px) {
      .rating-summary {
        padding: 1rem;
      }

      .average-rating {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .total-reviews {
        margin-left: 0;
      }

      .breakdown-item {
        font-size: 0.85rem;
      }

      .star-label {
        min-width: 35px;
      }
    }
  `]
})
export class RatingSummaryComponent implements OnInit {
  @Input() courseId!: number;
  @Input() showBreakdown: boolean = true;
  @Input() compact: boolean = false;

  averageRating: number = 0;
  totalReviews: number = 0;
  distribution: RatingDistribution[] = [];
  loading = false;

  constructor(private ratingService: RatingService) {}

  ngOnInit() {
    this.loadRatingSummary();
  }

  loadRatingSummary() {
    if (!this.courseId) return;

    this.loading = true;

    // Load all ratings to calculate summary (we'll make multiple calls to get complete data)
    this.loadAllRatings();
  }

  private async loadAllRatings() {
    try {
      // Load first page to get total count
      const firstPage = await this.getRatingsPage(1, 100);
      
      if (firstPage.totalCount === 0) {
        this.averageRating = 0;
        this.totalReviews = 0;
        this.distribution = [];
        this.loading = false;
        return;
      }

      // For simplicity, we'll work with the first 100 ratings
      // In a real app, you might want to have a separate API endpoint for rating statistics
      const ratings = firstPage.items;
      this.totalReviews = firstPage.totalCount;

      // Calculate average rating
      const totalStars = ratings.reduce((sum, rating) => sum + rating.ratingValue, 0);
      this.averageRating = totalStars / ratings.length;

      // Calculate distribution
      this.calculateDistribution(ratings);

      this.loading = false;
    } catch (error) {
      console.error('Error loading rating summary:', error);
      this.loading = false;
    }
  }

  private getRatingsPage(pageNumber: number, pageSize: number): Promise<PagedResult<CourseRating>> {
    const query: GetCourseRatingsQuery = {
      pageNumber,
      pageSize
    };

    return this.ratingService.getCourseRatings(this.courseId, query).toPromise() as Promise<PagedResult<CourseRating>>;
  }

  private calculateDistribution(ratings: CourseRating[]) {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    ratings.forEach(rating => {
      counts[rating.ratingValue as keyof typeof counts]++;
    });

    const total = ratings.length;
    
    this.distribution = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: counts[star as keyof typeof counts],
      percentage: total > 0 ? (counts[star as keyof typeof counts] / total) * 100 : 0
    }));
  }
} 