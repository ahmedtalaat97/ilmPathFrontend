import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../models/course.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { CartService } from '../../../features/courses/cart.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.css'
})
export class CourseCardComponent {
  isBestseller = Math.random() > 0.7; 

  @Input({ required: true }) course!: Course;
  @Input() enrolled: boolean = false;
  @Input() showStartLearningBtn: boolean = false;
  @Output() startLearning = new EventEmitter<string | number>();

  constructor(private router: Router, private cartService: CartService, private snackBar: MatSnackBar) {}

  goToDetails() {
    this.router.navigate(['/courses', this.course.id]);
  }

  addToCart(event: Event) {
    event.stopPropagation();
    this.cartService.addToCart(Number(this.course.id)).subscribe({
      next: () => {
        this.snackBar.open('Course added to cart!', 'Close', { duration: 2000, panelClass: 'snackbar-success' });
      },
      error: () => {
        this.snackBar.open('Failed to add course to cart.', 'Close', { duration: 2500, panelClass: 'snackbar-error' });
      }
    });
  }

  onStartLearning(event: Event) {
    event.stopPropagation();
    this.router.navigate([`/courses/${this.course.id}/learn`]);
  }
}
