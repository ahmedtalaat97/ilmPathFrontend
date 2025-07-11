import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RequestWithdrawalRequest, UnpaidEnrollmentSummary } from '../../../../shared/models/instructor-payout.model';

@Component({
  selector: 'app-withdrawal-request-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './withdrawal-request-dialog.component.html',
  styleUrls: ['./withdrawal-request-dialog.component.css']
})
export class WithdrawalRequestDialogComponent {
  withdrawalRequest: RequestWithdrawalRequest = {
    paymentMethod: 'Stripe',
    notes: ''
  };

  paymentMethods = [
    { value: 'Stripe', label: 'Stripe Connect' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Wire Transfer', label: 'Wire Transfer' }
  ];

  constructor(
    public dialogRef: MatDialogRef<WithdrawalRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      pendingBalance: number;
      unpaidEnrollments: UnpaidEnrollmentSummary[];
    }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.data.pendingBalance <= 0) {
      return;
    }
    this.dialogRef.close(this.withdrawalRequest);
  }

  calculateCommission(): number {
    return this.data.pendingBalance * 0.30;
  }

  calculateNetAmount(): number {
    return this.data.pendingBalance * 0.70;
  }
} 