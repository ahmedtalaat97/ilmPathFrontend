import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EnrollmentAnalytics {
  id: number;
  userId: string;
  courseId: number;
  enrollmentDate: Date;
  pricePaid: number;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
  course?: {
    id: number;
    title: string;
    thumbnailImageUrl?: string;
  };
}

export interface RevenueAnalytics {
  month: string;
  revenue: number;
  enrollments: number;
  courses: number;
}

export interface StudentAnalytics {
  totalUniqueStudents: number;
  activeStudents: number;
  newStudentsThisMonth: number;
  studentsByMonth: { month: string; count: number }[];
}

export interface InstructorRevenueSummary {
  totalRevenue: number;
  revenueInPeriod: number;
  totalStudents: number;
  studentsInPeriod: number;
  totalEnrollments: number;
  enrollmentsInPeriod: number;
  period: string;
}

export interface CoursePerformanceAnalytics {
  courseId: number;
  courseTitle: string;
  totalEnrollments: number;
  totalRevenue: number;
  averageRating: number;
  completionRate: number;
  isPublished: boolean;
  price: number;
  thumbnailImageUrl?: string;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  enrollments: number;
  uniqueStudents: number;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherAnalyticsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get enrollment data for instructor using the new Analytics API
  getInstructorEnrollments(instructorId: string, pageNumber: number = 1, pageSize: number = 1000): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Analytics/instructor/enrollments?pageNumber=${pageNumber}&pageSize=${pageSize}&instructorId=${instructorId}`);
  }

  // Get revenue analytics data using the new Analytics API
  getRevenueAnalytics(instructorId: string, dateRange: string): Observable<InstructorRevenueSummary> {
    return this.http.get<InstructorRevenueSummary>(`${this.apiUrl}/Analytics/instructor/revenue-summary?days=${dateRange}`);
  }

  // Get student analytics
  getStudentAnalytics(instructorId: string): Observable<StudentAnalytics> {
    // This would use revenue summary data to calculate student analytics
    return this.http.get<StudentAnalytics>(`${this.apiUrl}/Analytics/instructor/revenue-summary?days=365`);
  }

  // Get course performance data using the new Analytics API
  getCoursePerformance(instructorId: string): Observable<CoursePerformanceAnalytics[]> {
    return this.http.get<CoursePerformanceAnalytics[]>(`${this.apiUrl}/Analytics/instructor/course-performance`);
  }

  // Get monthly trends using the new Analytics API
  getMonthlyTrends(instructorId: string, months: number = 6): Observable<MonthlyTrend[]> {
    return this.http.get<MonthlyTrend[]>(`${this.apiUrl}/Analytics/instructor/monthly-trends?months=${months}`);
  }
} 