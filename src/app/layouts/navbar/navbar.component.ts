import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/models/user.model';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isLoggedIn = false;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.userSubscription = this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      console.log('Navbar - User state changed:', user);
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserDisplayName(): string {
    if (this.currentUser?.firstName && this.currentUser?.lastName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return this.currentUser?.userName || this.currentUser?.email || 'User';
  }
}
