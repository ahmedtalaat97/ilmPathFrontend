import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { TeacherAnalyticsService } from '../analytics/teacher-analytics.service';

interface StudentEnrollment {
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

interface StudentSummary {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  totalCourses: number;
  totalSpent: number;
  firstEnrollmentDate: Date;
  lastEnrollmentDate: Date;
  courses: {
    id: number;
    title: string;
    enrollmentDate: Date;
    pricePaid: number;
  }[];
}

@Component({
  selector: 'app-teacher-students',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './teacher-students.component.html',
  styleUrls: ['./teacher-students.component.css']
})
export class TeacherStudentsComponent implements OnInit {
  loading = true;
  activeTab = 'overview';
  
  // Raw enrollment data
  enrollments: StudentEnrollment[] = [];
  
  // Processed student data
  students: StudentSummary[] = [];
  filteredStudents: StudentSummary[] = [];
  
  // Summary stats
  totalStudents = 0;
  totalRevenue = 0;
  averageRevenuePerStudent = 0;
  newStudentsThisMonth = 0;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  
  // Filters
  searchTerm = '';
  selectedCourse = 'all';
  dateRange = '30'; // days
  
  constructor(
    private authService: AuthService,
    private analyticsService: TeacherAnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadStudentData();
  }

  loadStudentData(): void {
    this.loading = true;
    
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) {
      console.error('No current user found');
      this.loading = false;
      return;
    }

    // Use the existing analytics service to get enrollment data
    this.analyticsService.getInstructorEnrollments(currentUser.id, 1, 1000).subscribe({
      next: (response: any) => {
        this.enrollments = response.items || [];
        this.processStudentData();
        this.calculateStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading student data:', error);
        this.loading = false;
      }
    });
  }

  private processStudentData(): void {
    // Group enrollments by student
    const studentMap = new Map<string, StudentSummary>();
    
    this.enrollments.forEach(enrollment => {
      const userId = enrollment.userId;
      
      if (!studentMap.has(userId)) {
        studentMap.set(userId, {
          userId: userId,
          firstName: enrollment.user?.firstName || '',
          lastName: enrollment.user?.lastName || '',
          email: enrollment.user?.email || '',
          profileImageUrl: enrollment.user?.profileImageUrl,
          totalCourses: 0,
          totalSpent: 0,
          firstEnrollmentDate: enrollment.enrollmentDate,
          lastEnrollmentDate: enrollment.enrollmentDate,
          courses: []
        });
      }
      
      const student = studentMap.get(userId)!;
      student.totalCourses++;
      student.totalSpent += enrollment.pricePaid;
      
      // Update enrollment dates
      if (enrollment.enrollmentDate < student.firstEnrollmentDate) {
        student.firstEnrollmentDate = enrollment.enrollmentDate;
      }
      if (enrollment.enrollmentDate > student.lastEnrollmentDate) {
        student.lastEnrollmentDate = enrollment.enrollmentDate;
      }
      
      // Add course to student's course list
      student.courses.push({
        id: enrollment.courseId,
        title: enrollment.course?.title || 'Unknown Course',
        enrollmentDate: enrollment.enrollmentDate,
        pricePaid: enrollment.pricePaid
      });
    });
    
    this.students = Array.from(studentMap.values());
  }

  private calculateStats(): void {
    this.totalStudents = this.students.length;
    this.totalRevenue = this.students.reduce((sum, student) => sum + student.totalSpent, 0);
    this.averageRevenuePerStudent = this.totalStudents > 0 ? this.totalRevenue / this.totalStudents : 0;
    
    // Calculate new students this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    this.newStudentsThisMonth = this.students.filter(student => 
      new Date(student.firstEnrollmentDate) >= oneMonthAgo
    ).length;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCourseFilterChange(): void {
    this.applyFilters();
  }

  onDateRangeChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.students];
    
    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        student.firstName.toLowerCase().includes(searchLower) ||
        student.lastName.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower)
      );
    }
    
    this.filteredStudents = filtered;
    this.totalPages = Math.ceil(this.filteredStudents.length / this.pageSize);
    this.currentPage = 1;
  }

  get paginatedStudents(): StudentSummary[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredStudents.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  exportStudentData(): void {
    if (this.students.length === 0) {
      console.warn('No student data to export');
      return;
    }

    // Create CSV headers
    const headers = [
      'Student Name',
      'Email',
      'Total Courses',
      'Total Spent',
      'First Enrollment',
      'Last Enrollment',
      'Courses Enrolled'
    ];

    // Create CSV rows
    const csvRows = this.students.map(student => {
      const studentName = this.getStudentDisplayName(student);
      const coursesEnrolled = student.courses.map(course => 
        `${course.title} (${this.formatDate(course.enrollmentDate)} - ${this.formatCurrency(course.pricePaid)})`
      ).join('; ');

      return [
        `"${studentName}"`,
        `"${student.email}"`,
        student.totalCourses,
        student.totalSpent,
        `"${this.formatDate(student.firstEnrollmentDate)}"`,
        `"${this.formatDate(student.lastEnrollmentDate)}"`,
        `"${coursesEnrolled}"`
      ].join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // Create and download the file
    this.downloadCSV(csvContent, `student-summary-${new Date().toISOString().split('T')[0]}.csv`);
    
    console.log('Student data exported successfully');
  }

  exportEnrollmentData(): void {
    if (this.enrollments.length === 0) {
      console.warn('No enrollment data to export');
      return;
    }

    // Create CSV headers for enrollments
    const headers = [
      'Student Name',
      'Student Email',
      'Course Title',
      'Enrollment Date',
      'Price Paid',
      'Course ID',
      'Student ID'
    ];

    // Create CSV rows for enrollments
    const csvRows = this.enrollments.map(enrollment => {
      const studentName = enrollment.user ? 
        `${enrollment.user.firstName} ${enrollment.user.lastName}`.trim() : 
        'Unknown Student';
      
      return [
        `"${studentName}"`,
        `"${enrollment.user?.email || 'Unknown Email'}"`,
        `"${enrollment.course?.title || 'Unknown Course'}"`,
        `"${this.formatDate(enrollment.enrollmentDate)}"`,
        enrollment.pricePaid,
        enrollment.courseId,
        `"${enrollment.userId}"`
      ].join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // Create and download the file
    this.downloadCSV(csvContent, `enrollment-details-${new Date().toISOString().split('T')[0]}.csv`);
    
    console.log('Enrollment data exported successfully');
  }

  private downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  viewStudentDetails(student: StudentSummary): void {
    // Implement student details view
    console.log('Viewing student details:', student);
  }

  contactStudent(student: StudentSummary): void {
    // Implement student contact functionality
    console.log('Contacting student:', student);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  getStudentDisplayName(student: StudentSummary): string {
    return `${student.firstName} ${student.lastName}`.trim() || student.email;
  }

  getStudentInitials(student: StudentSummary): string {
    const firstName = student.firstName || '';
    const lastName = student.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  }
} 