import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InstructorPayoutService } from '../../../core/services/instructor-payout.service';
import {
  InstructorBalance,
  InstructorPayoutSummary,
  UnpaidEnrollmentSummary,
  StripeConnectStatusResponse
} from '../../../shared/models/instructor-payout.model';
import { WithdrawalRequestDialogComponent } from './withdrawal-request-dialog/withdrawal-request-dialog.component';

@Component({
  selector: 'app-instructor-payouts',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './instructor-payouts.component.html',
  styleUrls: ['./instructor-payouts.component.css']
})
export class InstructorPayoutsComponent implements OnInit {
  balance: InstructorBalance | null = null;
  payouts: InstructorPayoutSummary[] = [];
  unpaidEnrollments: UnpaidEnrollmentSummary[] = [];
  stripeConnectStatus: StripeConnectStatusResponse | null = null;
  
  // Table configuration
  displayedColumns: string[] = ['id', 'netAmount', 'status', 'enrollments', 'requestDate', 'processedDate'];
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  
  loading = false;
  creatingAccount = false;
  gettingOnboardingLink = false;

  constructor(
    private payoutService: InstructorPayoutService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.handleQueryParameters();
  }

  private handleQueryParameters(): void {
    this.route.queryParams.subscribe(params => {
      if (params['setup'] === 'complete') {
        if (params['test_mode'] === 'true') {
          this.showSuccess('Stripe Connect setup completed successfully! (Test Mode)');
        } else {
          this.showSuccess('Stripe Connect setup completed successfully!');
        }
        // Remove query parameters from URL without reloading
        window.history.replaceState({}, '', window.location.pathname);
      } else if (params['setup'] === 'refresh') {
        this.showError('Stripe Connect setup was interrupted. Please try again.');
        window.history.replaceState({}, '', window.location.pathname);
      }
    });
  }

  loadData(): void {
    this.loadStripeConnectStatus();
    this.loadBalance();
    this.loadPayouts();
    this.loadUnpaidEnrollments();
  }

  loadStripeConnectStatus(): void {
    this.payoutService.getStripeConnectStatus().subscribe({
      next: (status) => this.stripeConnectStatus = status,
      error: (error) => console.error('Failed to load Stripe Connect status:', error)
    });
  }

  loadBalance(): void {
    this.payoutService.getBalance().subscribe({
      next: (balance) => this.balance = balance,
      error: (error) => this.showError('Failed to load balance')
    });
  }

  loadPayouts(): void {
    this.loading = true;
    this.payoutService.getMyPayouts(this.pageIndex + 1, this.pageSize).subscribe({
      next: (result) => {
        this.payouts = result.items;
        this.totalItems = result.totalCount;
        this.loading = false;
      },
      error: (error) => {
        this.showError('Failed to load payouts');
        this.loading = false;
      }
    });
  }

  loadUnpaidEnrollments(): void {
    this.payoutService.getUnpaidEnrollments().subscribe({
      next: (enrollments) => this.unpaidEnrollments = enrollments,
      error: (error) => this.showError('Failed to load unpaid enrollments')
    });
  }

  createStripeAccount(): void {
    this.creatingAccount = true;
    this.payoutService.createStripeAccount().subscribe({
      next: (response) => {
        this.showSuccess('Stripe account created successfully! Now complete the onboarding process.');
        this.loadStripeConnectStatus(); // Refresh status to show the new button
        this.creatingAccount = false;
      },
      error: (error) => {
        let errorMessage = 'Failed to create Stripe account';
        
        if (error.status === 409) {
          this.showError('Stripe account already exists for this user.');
        } else if (error.status === 502) {
          this.showError(`Stripe error: ${error.error}`);
        } else {
          this.showError(errorMessage);
        }
        
        this.creatingAccount = false;
      }
    });
  }

  startOnboarding(): void {
    this.gettingOnboardingLink = true;
    this.payoutService.getStripeOnboardingLink().subscribe({
      next: (response) => {
        // Redirect to Stripe onboarding
        window.location.href = response.url;
        this.gettingOnboardingLink = false;
      },
      error: (error) => {
        let errorMessage = 'Failed to get onboarding link';
        
        if (error.status === 400 && error.error.includes('not created yet')) {
          this.showError('Please create a Stripe account first.');
        } else if (error.status === 502) {
          this.showError(`Stripe error: ${error.error}`);
        } else {
          this.showError(errorMessage);
        }
        
        this.gettingOnboardingLink = false;
      }
    });
  }

  openStripeDashboard(): void {
    this.payoutService.getStripeDashboardLink().subscribe({
      next: (dashboardUrl) => {
        // Open Stripe dashboard in new tab
        window.open(dashboardUrl, '_blank');
      },
      error: (error) => {
        if (error.status === 400) {
          this.showError('Please set up your Stripe account first.');
        } else {
          this.showError('Failed to access Stripe dashboard.');
        }
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPayouts();
  }

  requestWithdrawal(): void {
    if (!this.stripeConnectStatus?.canReceivePayouts) {
      this.showError('Please complete your Stripe account setup before requesting withdrawals');
      return;
    }

    const dialogRef = this.dialog.open(WithdrawalRequestDialogComponent, {
      width: '500px',
      data: {
        pendingBalance: this.balance?.pendingBalance || 0,
        unpaidEnrollments: this.unpaidEnrollments
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.payoutService.requestWithdrawal(result).subscribe({
          next: (payout) => {
            this.showSuccess('Withdrawal request submitted successfully');
            this.loadData(); // Refresh all data
          },
          error: (error) => this.showError('Failed to submit withdrawal request')
        });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'accent';
      case 'approved': return 'primary';
      case 'completed': return 'primary';
      case 'rejected': return 'warn';
      default: return '';
    }
  }

  getStatusDescription(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'Waiting for admin review';
      case 'approved': return 'Approved but payout failed - please contact support';
      case 'completed': return 'Funds sent to your Stripe account';
      case 'rejected': return 'Request was rejected by admin';
      default: return '';
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
} 