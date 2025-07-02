import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getToken();

  // Skip Hugging Face API requests
  if (req.url.startsWith('https://api-inference.huggingface.co')) {
    console.log('Intercepting Hugging Face request (functional):', req.url);
    console.log('Hugging Face API Key from environment (functional):', environment.huggingFaceApiKey);

    const authReq = req.clone({
      headers: req.headers
        .set('Authorization', `Bearer ${environment.huggingFaceApiKey}`)
        .set('Content-Type', 'application/json')
    });
    console.log('Request with modified headers (functional):', authReq);
    return next(authReq);
  }

  
  // Clone the request and add Authorization header if token exists
  let authReq = req;
  if (token && !authService.isTokenExpired()) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized responses (but not for Hugging Face)
      if (error.status === 401 && !req.url.startsWith('https://api-inference.huggingface.co')) {
        console.log('Unauthorized request, redirecting to login');
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
}; 