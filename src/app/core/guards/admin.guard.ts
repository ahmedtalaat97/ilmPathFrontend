import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    const user = this.authService.getCurrentUserValue();
    if (user && user.roles) {
      // If roles is a string, check it (case-insensitive)
      if (typeof user.roles === 'string' && (user.roles as string).toLowerCase() === 'admin') {
        return true;
      }
      // If roles is an array, cast and check if it contains 'admin' (case-insensitive)
      if (Array.isArray(user.roles) && (user.roles as string[]).some(role => typeof role === 'string' && role.toLowerCase() === 'admin')) {
        return true;
      }
    }
    this.router.navigate(['/courses']);
    return false;
  }
}