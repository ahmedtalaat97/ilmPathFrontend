import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../shared/models/paged-result.model';
import {
  InstructorBalance,
  InstructorPayoutSummary,
  RequestWithdrawalRequest,
  UnpaidEnrollmentSummary,
  WithdrawalRequestSummary,
  WithdrawalRequestDetails,
  ApproveWithdrawalRequest,
  RejectWithdrawalRequest,
  AdminDashboardStats,
  StripeConnectStatusResponse,
  StripeConnectResponse
} from '../../shared/models/instructor-payout.model';

@Injectable({
  providedIn: 'root'
})
export class InstructorPayoutService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Instructor endpoints
  getBalance(): Observable<InstructorBalance> {
    return this.http.get<InstructorBalance>(`${this.apiUrl}/instructor/balance`);
  }

  getMyPayouts(pageNumber: number = 1, pageSize: number = 10): Observable<PagedResult<InstructorPayoutSummary>> {
    return this.http.get<PagedResult<InstructorPayoutSummary>>(
      `${this.apiUrl}/instructor/payouts?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }

  requestWithdrawal(request: RequestWithdrawalRequest): Observable<InstructorPayoutSummary> {
    return this.http.post<InstructorPayoutSummary>(`${this.apiUrl}/instructor/request-withdrawal`, request);
  }

  getUnpaidEnrollments(): Observable<UnpaidEnrollmentSummary[]> {
    return this.http.get<UnpaidEnrollmentSummary[]>(`${this.apiUrl}/instructor/unpaid-enrollments`);
  }

  // Stripe Connect endpoints
  getStripeConnectStatus(): Observable<StripeConnectStatusResponse> {
    return this.http.get<StripeConnectStatusResponse>(`${this.apiUrl}/instructor/stripe-connect-status`);
  }

  createStripeAccount(): Observable<{ stripeAccountId: string }> {
    return this.http.post<{ stripeAccountId: string }>(`${this.apiUrl}/instructor/create-stripe-account`, {});
  }

  getStripeOnboardingLink(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/instructor/stripe-onboarding-link`);
  }

  getStripeDashboardLink(): Observable<string> {
    return this.http.get(`${this.apiUrl}/instructor/stripe-dashboard`, { responseType: 'text' });
  }

  createStripeConnectAccount(): Observable<StripeConnectResponse> {
    return this.http.post<StripeConnectResponse>(`${this.apiUrl}/instructor/stripe-connect`, {});
  }

  // Admin endpoints
  getWithdrawalRequests(pageNumber: number = 1, pageSize: number = 10, status?: string): Observable<PagedResult<WithdrawalRequestSummary>> {
    let url = `${this.apiUrl}/admin/withdrawal-requests?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<PagedResult<WithdrawalRequestSummary>>(url);
  }

  getWithdrawalRequestById(id: number): Observable<WithdrawalRequestDetails> {
    return this.http.get<WithdrawalRequestDetails>(`${this.apiUrl}/admin/withdrawal-requests/${id}`);
  }

  approveWithdrawalRequest(id: number, request: ApproveWithdrawalRequest): Observable<WithdrawalRequestSummary> {
    return this.http.put<WithdrawalRequestSummary>(`${this.apiUrl}/admin/withdrawal-requests/${id}/approve`, request);
  }

  rejectWithdrawalRequest(id: number, request: RejectWithdrawalRequest): Observable<WithdrawalRequestSummary> {
    return this.http.put<WithdrawalRequestSummary>(`${this.apiUrl}/admin/withdrawal-requests/${id}/reject`, request);
  }

  getDashboardStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/admin/dashboard-stats`);
  }
} 