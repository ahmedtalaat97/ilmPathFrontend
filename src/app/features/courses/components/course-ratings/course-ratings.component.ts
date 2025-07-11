import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService } from '../../rating.service';
import { CourseRating, GetCourseRatingsQuery } from '../../../../shared/models/rating.model';
import { PagedResult } from '../../../../shared/models/paged-result.model';
import { RatingDisplayComponent } from '../../../../shared/components/rating-display/rating-display.component';
import { ImageUrlUtil } from '../../../../core/utils/image-url.util';

@Component({
  selector: 'app-course-ratings',
  standalone: true,
  imports: [CommonModule, FormsModule, RatingDisplayComponent],
  template: `
    <div class="course-ratings">
      <div class="ratings-header">
        <h3>Course Reviews ({{ totalCount }})</h3>
        <div class="filter-controls">
          <select [(ngModel)]="selectedFilter" (change)="onFilterChange()" class="filter-select">
            <option [value]="null">All ratings</option>
            <option [value]="5">5 stars</option>
            <option [value]="4">4 stars</option>
            <option [value]="3">3 stars</option>
            <option [value]="2">2 stars</option>
            <option [value]="1">1 star</option>
          </select>
        </div>
      </div>

      <div class="ratings-list" *ngIf="!loading && ratings.length > 0">
        <div class="rating-item" *ngFor="let rating of ratings">
          <div class="rating-header">
            <div class="user-info">
              <img 
                [src]="ImageUrlUtil.getProfileImageUrl(rating.userProfileImageUrl)" 
                [alt]="rating.userName"
                class="user-avatar"
                (error)="onImageError($event)"
              >
              <span class="user-name">{{ rating.userName }}</span>
            </div>
            <div class="rating-meta">
              <app-rating-display [rating]="rating.ratingValue" [interactive]="false"></app-rating-display>
              <span class="rating-date">{{ formatDate(rating.createdAt) }}</span>
            </div>
          </div>
          <div class="rating-content" *ngIf="rating.reviewText">
            <p>{{ rating.reviewText }}</p>
          </div>
        </div>
      </div>

      <div class="no-ratings" *ngIf="!loading && ratings.length === 0">
        <p>No reviews yet. Be the first to review this course!</p>
      </div>

      <div class="loading" *ngIf="loading">
        <p>Loading reviews...</p>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button 
          (click)="goToPage(currentPage - 1)" 
          [disabled]="currentPage <= 1"
          class="page-btn"
        >
          Previous
        </button>
        
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button 
          (click)="goToPage(currentPage + 1)" 
          [disabled]="currentPage >= totalPages"
          class="page-btn"
        >
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    .course-ratings {
      margin-top: 2rem;
      color: #f1f1f1;
    }

    .ratings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #444;
    }

    .ratings-header h3 {
      margin: 0;
      color: #fff;
      font-weight: 600;
    }

    .filter-select {
      padding: 0.5rem;
      border: 1px solid #555;
      border-radius: 8px;
      background: #2a2a2a;
      color: #f1f1f1;
      outline: none;
    }

    .filter-select:focus {
      border-color: #ff6b35;
    }

    .ratings-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .rating-item {
      padding: 1.5rem;
      border: 1px solid #444;
      border-radius: 12px;
      background: #2a2a2a;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .rating-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    }

    .rating-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #ff6b35;
    }

    .user-name {
      font-weight: 600;
      color: #fff;
    }

    .rating-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }

    .rating-date {
      font-size: 0.85rem;
      color: #b0b0b0;
    }

    .rating-content {
      margin-top: 1rem;
    }

    .rating-content p {
      margin: 0;
      line-height: 1.6;
      color: #e0e0e0;
    }

    .no-ratings {
      text-align: center;
      padding: 2rem;
      color: #b0b0b0;
      background: #2a2a2a;
      border-radius: 12px;
      border: 1px solid #444;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #b0b0b0;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .page-btn {
      padding: 0.75rem 1.5rem;
      border: 1px solid #555;
      background: #333;
      color: #fff;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .page-btn:hover:not(:disabled) {
      background: #ff6b35;
      border-color: #ff6b35;
      transform: translateY(-2px);
    }

    .page-btn:disabled {
      background: #222;
      color: #666;
      cursor: not-allowed;
      border-color: #333;
    }

    .page-info {
      color: #b0b0b0;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .ratings-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .filter-select {
        width: 100%;
      }

      .rating-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .rating-meta {
        align-items: flex-start;
      }
    }
  `]
})
export class CourseRatingsComponent implements OnInit {
  @Input() courseId!: number;

  // Make ImageUrlUtil accessible in template
  ImageUrlUtil = ImageUrlUtil;

  ratings: CourseRating[] = [];
  loading = false;
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  selectedFilter: number | null = null;

  constructor(private ratingService: RatingService) {}

  ngOnInit() {
    this.loadRatings();
  }

  loadRatings() {
    if (!this.courseId) return;

    this.loading = true;
    
    const query: GetCourseRatingsQuery = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      ratingFilter: this.selectedFilter || undefined
    };

    this.ratingService.getCourseRatings(this.courseId, query).subscribe({
      next: (result: PagedResult<CourseRating>) => {
        this.ratings = result.items.map(rating => ({
          ...rating,
          createdAt: new Date(rating.createdAt)
        }));
        this.totalCount = result.totalCount;
        this.totalPages = result.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ratings:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadRatings();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRatings();
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  onImageError(event: any) {
    event.target.src = '/assets/default-avatar.png';
  }
} 