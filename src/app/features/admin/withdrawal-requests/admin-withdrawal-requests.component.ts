import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { InstructorPayoutService } from '../../../core/services/instructor-payout.service';
import {
  WithdrawalRequestSummary,
  AdminDashboardStats
} from '../../../shared/models/instructor-payout.model';
import { WithdrawalRequestDetailsDialogComponent } from './withdrawal-request-details-dialog/withdrawal-request-details-dialog.component';

@Component({
  selector: 'app-admin-withdrawal-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    FormsModule
  ],
  templateUrl: './admin-withdrawal-requests.component.html',
  styleUrls: ['./admin-withdrawal-requests.component.css']
})
export class AdminWithdrawalRequestsComponent implements OnInit {
  requests: WithdrawalRequestSummary[] = [];
  stats: AdminDashboardStats | null = null;
  
  // Table configuration
  displayedColumns: string[] = ['id', 'instructor', 'amount', 'status', 'enrollments', 'requestDate', 'actions'];
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  
  // Filters
  selectedStatus = '';
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Completed', label: 'Completed' }
  ];
  
  loading = false;

  constructor(
    private payoutService: InstructorPayoutService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadStats();
    this.loadRequests();
  }

  loadStats(): void {
    this.payoutService.getDashboardStats().subscribe({
      next: (stats) => this.stats = stats,
      error: (error) => this.showError('Failed to load dashboard stats')
    });
  }

  loadRequests(): void {
    this.loading = true;
    const status = this.selectedStatus || undefined;
    
    this.payoutService.getWithdrawalRequests(this.pageIndex + 1, this.pageSize, status).subscribe({
      next: (result) => {
        this.requests = result.items;
        this.totalItems = result.totalCount;
        this.loading = false;
      },
      error: (error) => {
        this.showError('Failed to load withdrawal requests');
        this.loading = false;
      }
    });
  }

  onStatusFilterChange(): void {
    this.pageIndex = 0;
    this.loadRequests();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadRequests();
  }

  viewDetails(request: WithdrawalRequestSummary): void {
    const dialogRef = this.dialog.open(WithdrawalRequestDetailsDialogComponent, {
      width: '800px',
      data: { requestId: request.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData(); // Refresh data if action was taken
      }
    });
  }

  quickApprove(request: WithdrawalRequestSummary): void {
    if (request.status !== 'Pending') {
      this.showError('Only pending requests can be approved');
      return;
    }

    this.payoutService.approveWithdrawalRequest(request.id, {}).subscribe({
      next: () => {
        this.showSuccess(`Request #${request.id} approved successfully`);
        this.loadData();
      },
      error: (error) => this.showError('Failed to approve request')
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

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
} 