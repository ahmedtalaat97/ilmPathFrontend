import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { InstructorPayoutService } from '../../../../core/services/instructor-payout.service';
import { WithdrawalRequestDetails } from '../../../../shared/models/instructor-payout.model';

@Component({
  selector: 'app-withdrawal-request-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatDividerModule,
    MatChipsModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './withdrawal-request-details-dialog.component.html',
  styleUrls: ['./withdrawal-request-details-dialog.component.css']
})
export class WithdrawalRequestDetailsDialogComponent implements OnInit {
  requestDetails: WithdrawalRequestDetails | null = null;
  adminNotes = '';
  rejectionReason = '';
  loading = false;
  
  displayedColumns: string[] = ['student', 'course', 'amount', 'instructorShare', 'enrollmentDate'];

  constructor(
    public dialogRef: MatDialogRef<WithdrawalRequestDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { requestId: number },
    private payoutService: InstructorPayoutService
  ) {}

  ngOnInit(): void {
    this.loadRequestDetails();
  }

  loadRequestDetails(): void {
    this.loading = true;
    this.payoutService.getWithdrawalRequestById(this.data.requestId).subscribe({
      next: (details) => {
        this.requestDetails = details;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load request details:', error);
        this.loading = false;
      }
    });
  }

  approve(): void {
    if (!this.requestDetails) return;
    
    this.payoutService.approveWithdrawalRequest(this.requestDetails.id, {
      adminNotes: this.adminNotes
    }).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Failed to approve request:', error);
      }
    });
  }

  reject(): void {
    if (!this.requestDetails || !this.rejectionReason.trim()) return;
    
    this.payoutService.rejectWithdrawalRequest(this.requestDetails.id, {
      reason: this.rejectionReason
    }).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Failed to reject request:', error);
      }
    });
  }

  close(): void {
    this.dialogRef.close();
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

  canApprove(): boolean {
    return this.requestDetails?.status === 'Pending';
  }

  canReject(): boolean {
    return this.requestDetails?.status === 'Pending' && this.rejectionReason.trim().length > 0;
  }
} 