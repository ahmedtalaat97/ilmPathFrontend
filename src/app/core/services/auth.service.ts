import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, RegisterRequest, AuthResponse, RegisterResponse } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenKey = 'ilmpath_token';
  private tokenExpirationKey = 'ilmpath_token_expiration';

  public loginStatus$ = new Subject<boolean>();

  constructor(private http: HttpClient) {
    console.log('AuthService initialized with API URL:', this.apiUrl);
    this.checkStoredToken();
  }

  private checkStoredToken(): void {
    const token = localStorage.getItem(this.tokenKey);
    const expiration = localStorage.getItem(this.tokenExpirationKey);
    
    if (token && expiration) {
      const expirationDate = new Date(expiration);
      if (expirationDate > new Date()) {
        // Token is still valid, decode and set user
        this.setUserFromToken(token);
      } else {
        // Token expired, clear storage
        this.clearTokens();
      }
    }
  }

  private setUserFromToken(token: string): void {
    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user: User = {
        id: payload.sub || payload.nameid,
        email: payload.email,
        userName: payload.name || payload.unique_name,
        firstName: payload.given_name,
        lastName: payload.family_name,
        profileImageUrl: payload.profile_image,
        isActive: payload.is_active === 'true',
        createdAt: new Date(payload.created_at || Date.now()),
        roles: payload.role
      };
      this.currentUserSubject.next(user);
      console.log('User set in AuthService:', user);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.clearTokens();
    }
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    const url = `${this.apiUrl}/users/login`;
    console.log('Making login request to:', url);
    
    return this.http.post<AuthResponse>(url, loginData).pipe(
      tap(response => {
        console.log('Login successful:', response);
        this.storeTokens(response.token, response.expiration);
        this.setUserFromToken(response.token);
        this.loginStatus$.next(true);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(registerData: RegisterRequest): Observable<RegisterResponse> {
    const url = `${this.apiUrl}/users/register`;
    console.log('Making register request to:', url);
    
    return this.http.post<RegisterResponse>(url, registerData).pipe(
      tap(response => {
        console.log('Registration successful:', response);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    console.log('Logging out user');
    this.clearTokens();
    this.currentUserSubject.next(null);
    this.loginStatus$.next(false);
  }

  private storeTokens(token: string, expiration: Date): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.tokenExpirationKey, expiration.toString());
  }

  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenExpirationKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const expiration = localStorage.getItem(this.tokenExpirationKey);
    
    if (!token || !expiration) {
      return false;
    }
    
    return new Date(expiration) > new Date();
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  isTokenExpired(): boolean {
    const expiration = localStorage.getItem(this.tokenExpirationKey);
    if (!expiration) return true;
    
    return new Date(expiration) <= new Date();
  }
} 