import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StripePaymentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/Payments';

  createCheckoutSession(successUrl: string, cancelUrl: string): Observable<{ checkoutUrl: string, sessionId: string }> {
    return this.http.post<{ checkoutUrl: string, sessionId: string }>(
      `${this.apiUrl}/checkout-session`,
      { successUrl, cancelUrl }
    );
  }

  verifyPayment(sessionId: string): Observable<{ success: boolean, message: string }> {
    return this.http.post<{ success: boolean, message: string }>(
      `${this.apiUrl}/verify-payment/${sessionId}`,
      {}
    );
  }

  getMyPayments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-payments`);
  }
} 