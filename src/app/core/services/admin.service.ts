import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}`;
  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/dashboard-stats`);
  }

  getUserRolesDistribution(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/user-roles-distribution`);
  }

  getCourseCategoriesDistribution(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/course-categories-distribution`);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`);
  }

  banUser(userId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/users/${userId}/ban`, {});
  }

  unbanUser(userId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/users/${userId}/unban`, {});
  }
} 