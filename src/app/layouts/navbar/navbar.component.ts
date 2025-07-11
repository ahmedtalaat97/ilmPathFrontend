import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../shared/models/user.model';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { CartService } from '../../features/courses/cart.service';
import { Observable } from 'rxjs';
import { CategoryService, Category } from '../../features/courses/category.service';
import { ImageUrlUtil } from '../../core/utils/image-url.util';

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
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isLoggedIn = false;
  private userSubscription?: Subscription;
  private destroy$ = new Subject<void>();
  cartCount$!: Observable<number>;
  categories: Category[] = [];
  private loadingProfile = false;

  // Make ImageUrlUtil accessible in template
  ImageUrlUtil = ImageUrlUtil;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private cartService: CartService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.userSubscription = this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      
      // If user is logged in, fetch fresh profile data
      if (user && !this.loadingProfile) {
        this.loadFreshUserProfile();
      }
    });
    
    this.cartService.initCart();
    this.cartCount$ = this.cartService.cartCount$;
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
    
    // Subscribe to login events to load fresh profile data
    this.authService.loginStatus$
      .subscribe(isLoggedIn => {
        if (isLoggedIn && !this.loadingProfile) {
          this.cartService.initCart();
          this.loadFreshUserProfile();
        }
      });
  }

  private loadFreshUserProfile(): void {
    if (this.loadingProfile) {
      return; // Prevent concurrent loads
    }
    
    this.loadingProfile = true;
    this.userService.getUserProfile().subscribe({
      next: (userProfile) => {
        // Update current user with fresh profile data, especially the profile image
        if (this.currentUser) {
          const updatedUser: User = {
            ...this.currentUser,
            profileImageUrl: userProfile.profilePictureUrl, // Map from API response
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            email: userProfile.email,
            userName: userProfile.userName
          };
          
          this.currentUser = updatedUser;
        }
        this.loadingProfile = false;
      },
      error: (error) => {
        console.error('Navbar - Error loading fresh user profile:', error);
        this.loadingProfile = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
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

  getProfileImageUrl(): string | null {
    return ImageUrlUtil.getProfileImageUrl(this.currentUser?.profileImageUrl);
  }
}
