import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from '../../core/services/admin.service';
import { InstructorPayoutService } from '../../core/services/instructor-payout.service';
import { WithdrawalRequestSummary } from '../../shared/models/instructor-payout.model';
import { WithdrawalRequestDetailsDialogComponent } from './withdrawal-requests/withdrawal-request-details-dialog/withdrawal-request-details-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AdminWithdrawalRequestsComponent } from './withdrawal-requests/admin-withdrawal-requests.component';
import { RouterModule ,RouterLink} from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatDialogModule,
    BaseChartDirective,
    AdminWithdrawalRequestsComponent,
    RouterModule,
    RouterLink
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  dashboardStats: any = {};
  withdrawalRequests: WithdrawalRequestSummary[] = [];
  withdrawalRequestsTotal = 0;
  withdrawalRequestsPage = 1;
  withdrawalRequestsPageSize = 10;
  selectedStatus: string = '';
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Completed', label: 'Completed' }
  ];
  loading = false;

  pieChartLabels: string[] = ['Admin', 'Instructor', 'Student'];
  pieChartData = {
    labels: ['Admin', 'Instructor', 'Student'],
    datasets: [{
      data: [2, 10, 88],
      backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe']
    }]
  };
  pieChartType: any = 'pie';
  pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  doughnutChartLabels: string[] = ['Programming', 'Design', 'Business', 'Other'];
  doughnutChartData = {
    labels: ['Programming', 'Design', 'Business', 'Other'],
    datasets: [{
      data: [12, 7, 5, 3],
      backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56']
    }]
  };
  doughnutChartType: any = 'doughnut';
  doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  constructor(
    private adminService: AdminService,
    private payoutService: InstructorPayoutService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.adminService.getDashboardStats().subscribe((stats) => {
      this.dashboardStats = stats;
    });
    this.fetchWithdrawalRequests();

    // Fetch real user roles distribution
    this.adminService.getUserRolesDistribution().subscribe((roles) => {
      const labels = Object.keys(roles);
      const data = Object.values(roles) as number[];
      this.pieChartData = {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4caf50', '#f44336']
        }]
      };
      // Set totalAdmins and totalTeachers from roles
      this.dashboardStats = {
        ...this.dashboardStats,
        totalAdmins: roles['Admin'] || 0,
        totalTeachers: roles['Instructor'] || roles['Teacher'] || 0
      };
    });

    // Fetch real course categories distribution
    this.adminService.getCourseCategoriesDistribution().subscribe((categories) => {
      const labels = Object.keys(categories);
      const data = Object.values(categories) as number[];
      this.doughnutChartData = {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4caf50', '#f44336', '#9c27b0', '#00bcd4']
        }]
      };
    });
  }

  fetchWithdrawalRequests(page: number = 1): void {
    this.payoutService.getWithdrawalRequests(page, this.withdrawalRequestsPageSize).subscribe(result => {
      this.withdrawalRequests = result.items;
      this.withdrawalRequestsTotal = result.totalCount;
      this.withdrawalRequestsPage = page;
    });
  }

  openWithdrawalDetails(req: WithdrawalRequestSummary): void {
    const dialogRef = this.dialog.open(WithdrawalRequestDetailsDialogComponent, {
      width: '700px',
      data: { requestId: req.id }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchWithdrawalRequests(this.withdrawalRequestsPage);
      }
    });
  }

  onStatusFilterChange(): void {
    this.withdrawalRequestsPage = 1;
    this.fetchWithdrawalRequests();
  }

  getStatusColor(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'pending': return 'accent';
      case 'approved': return 'primary';
      case 'completed': return 'primary';
      case 'rejected': return 'warn';
      default: return '';
    }
  }

  quickApprove(request: WithdrawalRequestSummary): void {
    if (request.status !== 'Pending') return;
    this.loading = true;
    this.payoutService.approveWithdrawalRequest(request.id, {}).subscribe({
      next: () => {
        this.fetchWithdrawalRequests(this.withdrawalRequestsPage);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.withdrawalRequestsPage = event.pageIndex + 1;
    this.withdrawalRequestsPageSize = event.pageSize;
    this.fetchWithdrawalRequests(this.withdrawalRequestsPage);
  }

  get summaryStats() {
    return [
      { label: 'Total Users', value: this.dashboardStats.totalUsers || 0 },
      { label: 'Total Courses', value: this.dashboardStats.totalCourses || 0 },
      { label: 'Total Revenue', value: '$' + (this.dashboardStats.totalRevenue || 0) },
      { label: 'Pending Withdrawals', value: this.dashboardStats.pendingWithdrawals || 0 }
    ];
  }

  get summaryCardConfig() {
    return [
      {
        label: 'Pending Requests',
        value: this.dashboardStats.pendingRequestsCount || 0,
        amount: '$' + (this.dashboardStats.totalPendingAmount || 0),
        color: '#ff9800',
        icon: 'hourglass_empty'
      },
      {
        label: 'Approved Requests',
        value: this.dashboardStats.approvedRequestsCount || 0,
        amount: '$' + (this.dashboardStats.totalApprovedAmount || 0),
        color: '#2196f3',
        icon: 'check_circle_outline'
      },
      {
        label: 'Completed Payouts',
        value: this.dashboardStats.completedRequestsCount || 0,
        amount: '$' + (this.dashboardStats.totalCompletedAmount || 0),
        color: '#4caf50',
        icon: 'account_balance_wallet'
      },
      {
        label: 'Rejected Requests',
        value: this.dashboardStats.rejectedRequestsCount || 0,
        amount: '$0.00',
        color: '#f44336',
        icon: 'cancel'
      }
    ];
  }
} 