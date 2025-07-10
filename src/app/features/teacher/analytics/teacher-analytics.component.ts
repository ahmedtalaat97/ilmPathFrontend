import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { forkJoin } from 'rxjs';
import { TeacherAnalyticsService } from './teacher-analytics.service';
import { CourseService } from '../../courses/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { StripePaymentService } from '../../../core/services/stripe-payment.service';
import { catchError, of } from 'rxjs';

interface AnalyticsSummary {
  totalRevenue: number;
  totalStudents: number;
  totalCourses: number;
  publishedCourses: number;
  averageRating: number;
  completionRate: number;
  revenueThisMonth: number;
  studentsThisMonth: number;
}

interface CourseAnalytics {
  id: number;
  title: string;
  enrollments: number;
  revenue: number;
  averageRating: number;
  completionRate: number;
  thumbnailImageUrl?: string;
  isPublished: boolean;
}

interface RevenueData {
  month: string;
  revenue: number;
  enrollments: number;
}

interface StudentEngagement {
  totalStudents: number;
  activeStudents: number;
  newStudentsThisMonth: number;
  retentionRate: number;
}

@Component({
  selector: 'app-teacher-analytics',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatChipsModule,
    MatMenuModule
  ],
  templateUrl: './teacher-analytics.component.html',
  styleUrls: ['./teacher-analytics.component.css']
})
export class TeacherAnalyticsComponent implements OnInit {
  loading = true;
  selectedTab = 0;
  
  // Analytics data
  summary: AnalyticsSummary = {
    totalRevenue: 0,
    totalStudents: 0,
    totalCourses: 0,
    publishedCourses: 0,
    averageRating: 0,
    completionRate: 0,
    revenueThisMonth: 0,
    studentsThisMonth: 0
  };

  courseAnalytics: CourseAnalytics[] = [];
  revenueData: RevenueData[] = [];
  studentEngagement: StudentEngagement = {
    totalStudents: 0,
    activeStudents: 0,
    newStudentsThisMonth: 0,
    retentionRate: 0
  };

  // Table columns
  courseDisplayedColumns: string[] = ['title', 'enrollments', 'revenue', 'rating', 'completion', 'status'];
  revenueDisplayedColumns: string[] = ['month', 'revenue', 'enrollments', 'growth'];

  // Filter options
  dateRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ];
  selectedDateRange = '30';

  constructor(
    private analyticsService: TeacherAnalyticsService,
    private courseService: CourseService,
    private authService: AuthService,
    private paymentService: StripePaymentService
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) {
      console.error('No current user found');
      this.loading = false;
      return;
    }

    // Load all analytics data in parallel using the new Analytics API
    forkJoin({
      courses: this.courseService.getCoursesByInstructor(),
      studentsCount: this.courseService.getInstructorStudentsCount(currentUser.id),
      revenueSummary: this.analyticsService.getRevenueAnalytics(currentUser.id, this.selectedDateRange).pipe(
        catchError(error => {
          console.warn('Revenue summary endpoint not available:', error);
          return of({
            totalRevenue: 0,
            revenueInPeriod: 0,
            totalStudents: 0,
            studentsInPeriod: 0,
            totalEnrollments: 0,
            enrollmentsInPeriod: 0,
            period: 'N/A'
          });
        })
      ),
      coursePerformance: this.analyticsService.getCoursePerformance(currentUser.id).pipe(
        catchError(error => {
          console.warn('Course performance endpoint not available:', error);
          return of([]);
        })
      ),
      monthlyTrends: this.analyticsService.getMonthlyTrends(currentUser.id, 6).pipe(
        catchError(error => {
          console.warn('Monthly trends endpoint not available:', error);
          return of([]);
        })
      )
    }).subscribe({
      next: (data) => {
        this.processAnalyticsDataFromAPI(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading analytics data:', error);
        this.loading = false;
      }
    });
  }

  private processAnalyticsDataFromAPI(data: any): void {
    const { courses, studentsCount, revenueSummary, coursePerformance, monthlyTrends } = data;
    
    // Process basic summary from API response
    this.summary.totalCourses = courses.items?.length || 0;
    this.summary.publishedCourses = courses.items?.filter((c: any) => c.isPublished).length || 0;
    this.summary.totalStudents = revenueSummary.totalStudents || studentsCount || 0;
    this.summary.totalRevenue = revenueSummary.totalRevenue || 0;
    this.summary.revenueThisMonth = revenueSummary.revenueInPeriod || 0;
    this.summary.studentsThisMonth = revenueSummary.studentsInPeriod || 0;
    
    // Calculate average rating from course performance data
    if (coursePerformance && coursePerformance.length > 0) {
      this.summary.averageRating = coursePerformance.reduce((sum: number, course: any) => sum + course.averageRating, 0) / coursePerformance.length;
    } else {
      this.summary.averageRating = 0;
    }

    // Process course analytics from API
    this.courseAnalytics = coursePerformance.map((course: any) => ({
      id: course.courseId,
      title: course.courseTitle,
      enrollments: course.totalEnrollments,
      revenue: course.totalRevenue,
      averageRating: course.averageRating,
      completionRate: course.completionRate,
      thumbnailImageUrl: course.thumbnailImageUrl,
      isPublished: course.isPublished
    })) || [];
    
    // Process revenue trends from API
    this.revenueData = monthlyTrends.map((trend: any) => ({
      month: this.formatMonthFromAPI(trend.month),
      revenue: trend.revenue,
      enrollments: trend.enrollments
    })) || [];
    
    // Process student engagement from API data
    this.studentEngagement = {
      totalStudents: revenueSummary.totalStudents || 0,
      activeStudents: revenueSummary.studentsInPeriod || 0,
      newStudentsThisMonth: revenueSummary.studentsInPeriod || 0,
      retentionRate: 85 // This would need more complex calculation with user activity data
    };
  }

  private formatMonthFromAPI(monthKey: string): string {
    // monthKey format: "2024-01"
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }

  private calculateCompletionRate(courseEnrollments: any[]): number {
    // This is a simplified calculation - in reality, you'd need progress tracking data
    return Math.random() * 40 + 60; // Placeholder: 60-100%
  }

  private formatMonth(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }

  onDateRangeChange(): void {
    this.loadAnalytics();
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
  }

  getGrowthPercentage(current: number, previous: number | undefined): number {
    if (previous === undefined || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  exportData(): void {
    // Implement data export functionality
    console.log('Exporting analytics data...');
  }
} 