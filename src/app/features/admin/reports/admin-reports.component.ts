import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    FormsModule,
    BaseChartDirective,
    


  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit {
  // Date range
  fromDate: Date;
  toDate: Date;

  // Revenue
  revenueLoading = false;
  revenueError = '';
  totalRevenue = 0;
  paymentCount = 0;

  // User Growth
  userGrowthLoading = false;
  userGrowthError = '';
  newUsers = 0;

  // Top Courses
  topCoursesLoading = false;
  topCoursesError = '';
  topCourses: any[] = [];

  // Instructor Earnings
  instructorEarningsLoading = false;
  instructorEarningsError = '';
  instructorEarnings: any[] = [];

  // Withdrawals
  withdrawalsLoading = false;
  withdrawalsError = '';
  withdrawals: any[] = [];

  constructor(private http: HttpClient) {
    const today = new Date();
    this.toDate = today;
    this.fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
  }

  ngOnInit(): void {
    this.loadAllReports();
  }

  loadAllReports(): void {
    this.loadRevenue();
    this.loadUserGrowth();
    this.loadTopCourses();
    this.loadInstructorEarnings();
    this.loadWithdrawals();
  }

  get fromDateString() {
    return this.fromDate.toISOString().split('T')[0];
  }
  get toDateString() {
    return this.toDate.toISOString().split('T')[0];
  }

  loadRevenue(): void {
    this.revenueLoading = true;
    this.revenueError = '';
    this.http.get<any>(`${environment.apiUrl}/admin/reports/revenue?from=${this.fromDateString}&to=${this.toDateString}`).subscribe({
      next: (res) => {
        this.totalRevenue = res.totalRevenue;
        this.paymentCount = res.paymentCount;
        this.revenueLoading = false;
      },
      error: (err) => {
        this.revenueError = 'Failed to load revenue.';
        this.revenueLoading = false;
      }
    });
  }

  loadUserGrowth(): void {
    this.userGrowthLoading = true;
    this.userGrowthError = '';
    this.http.get<any>(`${environment.apiUrl}/admin/reports/user-growth?from=${this.fromDateString}&to=${this.toDateString}`).subscribe({
      next: (res) => {
        this.newUsers = res.newUsers;
        this.userGrowthLoading = false;
      },
      error: (err) => {
        this.userGrowthError = 'Failed to load user growth.';
        this.userGrowthLoading = false;
      }
    });
  }

  loadTopCourses(): void {
    this.topCoursesLoading = true;
    this.topCoursesError = '';
    this.http.get<any[]>(`${environment.apiUrl}/admin/reports/top-courses?from=${this.fromDateString}&to=${this.toDateString}`).subscribe({
      next: (res) => {
        this.topCourses = res;
        this.topCoursesLoading = false;
      },
      error: (err) => {
        this.topCoursesError = 'Failed to load top courses.';
        this.topCoursesLoading = false;
      }
    });
  }

  loadInstructorEarnings(): void {
    this.instructorEarningsLoading = true;
    this.instructorEarningsError = '';
    this.http.get<any[]>(`${environment.apiUrl}/admin/reports/instructor-earnings?from=${this.fromDateString}&to=${this.toDateString}`).subscribe({
      next: (res) => {
        this.instructorEarnings = res;
        this.instructorEarningsLoading = false;
      },
      error: (err) => {
        this.instructorEarningsError = 'Failed to load instructor earnings.';
        this.instructorEarningsLoading = false;
      }
    });
  }

  loadWithdrawals(): void {
    this.withdrawalsLoading = true;
    this.withdrawalsError = '';
    this.http.get<any[]>(`${environment.apiUrl}/admin/reports/withdrawals?from=${this.fromDateString}&to=${this.toDateString}`).subscribe({
      next: (res) => {
        this.withdrawals = res;
        this.withdrawalsLoading = false;
      },
      error: (err) => {
        this.withdrawalsError = 'Failed to load withdrawals.';
        this.withdrawalsLoading = false;
      }
    });
  }

  onDateRangeChange(): void {
    this.loadAllReports();
  }
} 