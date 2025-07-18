import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EnrollmentCheckResponse {
  isEnrolled: boolean;
  enrollmentDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  checkEnrollment(courseId: number): Observable<EnrollmentCheckResponse> {
    return this.http.get<EnrollmentCheckResponse>(`${this.apiUrl}/enrollments/check/${courseId}`);
  }

  getMyEnrollments(pageNumber: number = 1, pageSize: number = 10) {
    return this.http.get<any>(`${this.apiUrl}/enrollments/user`, {
      params: { pageNumber: pageNumber, pageSize: pageSize }
    });
  }
} 