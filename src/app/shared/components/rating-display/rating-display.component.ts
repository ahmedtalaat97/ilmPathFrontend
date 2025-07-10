import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rating-display" [class.interactive]="interactive">
      <div class="stars">
        <span 
          *ngFor="let star of stars; let i = index"
          class="star"
          [class.filled]="star.filled"
          [class.hover]="interactive && star.hover"
          (mouseenter)="onStarHover(i)"
          (mouseleave)="onStarLeave()"
          (click)="onStarClick(i)"
        >
          ★
        </span>
      </div>
      <span class="rating-text" *ngIf="showText">
        {{ displayText }}
      </span>
    </div>
  `,
  styles: [`
    .rating-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .star {
      font-size: 18px;
      color: #555;
      transition: color 0.2s ease;
    }

    .star.filled {
      color: #ffc107;
    }

    .interactive .star {
      cursor: pointer;
    }

    .interactive .star:hover,
    .star.hover {
      color: #ffb300;
    }

    .rating-text {
      font-size: 14px;
      color: #b0b0b0;
      margin-left: 4px;
    }

    .rating-display.interactive {
      user-select: none;
    }
  `]
})
export class RatingDisplayComponent {
  @Input() rating: number = 0;
  @Input() maxRating: number = 5;
  @Input() interactive: boolean = false;
  @Input() showText: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  stars: { filled: boolean; hover: boolean }[] = [];
  private hoverRating: number = 0;

  ngOnInit() {
    this.updateStars();
  }

  ngOnChanges() {
    this.updateStars();
  }

  private updateStars() {
    this.stars = Array.from({ length: this.maxRating }, (_, i) => ({
      filled: i < this.rating,
      hover: false
    }));
  }

  onStarHover(index: number) {
    if (!this.interactive) return;
    
    this.hoverRating = index + 1;
    this.stars.forEach((star, i) => {
      star.hover = i < this.hoverRating;
      star.filled = i < this.hoverRating;
    });
  }

  onStarLeave() {
    if (!this.interactive) return;
    
    this.hoverRating = 0;
    this.updateStars();
  }

  onStarClick(index: number) {
    if (!this.interactive) return;
    
    const newRating = index + 1;
    this.rating = newRating;
    this.ratingChange.emit(newRating);
    this.updateStars();
  }

  get displayText(): string {
    if (this.rating === 0) {
      return 'No rating';
    }
    return `${this.rating.toFixed(1)} out of ${this.maxRating}`;
  }
} 