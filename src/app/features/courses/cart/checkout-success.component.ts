import { Component, inject } from '@angular/core';
// import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../cart.service';
import { StripePaymentService } from '../../../core/services/stripe-payment.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  template: `
    <div class="checkout-success-container">
      <mat-card class="success-card">
        <mat-card-header>
          <mat-card-title>Payment Successful!</mat-card-title>
          <mat-card-subtitle>Thank you for your purchase.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <ng-container *ngIf="loading">
            <p>Clearing your cart...</p>
          </ng-container>
          <ng-container *ngIf="!loading && !error">
            <p>Your payment has been processed. You now have access to your courses.</p>
          </ng-container>
          <ng-container *ngIf="error">
            <p style="color: #f44336;">Payment succeeded, but failed to clear your cart. Please refresh or contact support.</p>
          </ng-container>
        </mat-card-content>
        <mat-card-actions>
          <button mat-flat-button color="primary" (click)="goToCourses()" [disabled]="loading">Go to Courses</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .checkout-success-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .success-card {
      width: 100%;
      max-width: 400px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      text-align: center;
    }
    .success-card mat-card-title {
      font-size: 24px;
      font-weight: 600;
      color: #43a047;
      margin-bottom: 8px;
    }
    .success-card mat-card-subtitle {
      color: #666;
      font-size: 14px;
    }
    .success-card mat-card-content {
      margin: 16px 0;
      color: #333;
    }
    .success-card mat-card-actions {
      display: flex;
      justify-content: center;
      margin-top: 16px;
    }
    @media (max-width: 480px) {
      .checkout-success-container {
        padding: 10px;
        min-height: 100vh;
      }
      .success-card {
        padding: 16px;
      }
      .success-card mat-card-title {
        font-size: 20px;
      }
    }
  `]
})
export class CheckoutSuccessComponent {
  loading = true;
  error = false;
  private cartService = inject(CartService);
  private stripePaymentService = inject(StripePaymentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  ngOnInit() {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    console.log('Session ID:', sessionId);
    if (!sessionId) {
      this.error = true;
      this.loading = false;
      return;
    }
    this.stripePaymentService.verifyPayment(sessionId).subscribe({
      next: (res) => {
        console.log('Verification response:', res);
        if (res.success) {
          this.cartService.initCart(); // Refresh cart count in navbar
          this.loading = false;
        } else {
          this.error = true;
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Verification error:', err);
        this.error = true;
        this.loading = false;
      }

    });
  }
  goToCourses() {
    this.router.navigate(['/courses']);
  }
} 