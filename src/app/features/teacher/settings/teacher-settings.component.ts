import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ImageUrlUtil } from '../../../core/utils/image-url.util';

@Component({
  selector: 'app-teacher-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-settings.component.html',
  styleUrls: ['./teacher-settings.component.css']
})
export class TeacherSettingsComponent implements OnInit {
  loading = false;
  currentUser: any = null;
  profileImageFile: File | null = null;
  profileImagePreview: string | null = null;
  uploadingImage = false;

  // Make ImageUrlUtil accessible in template
  ImageUrlUtil = ImageUrlUtil;

  // Settings form data
  settings = {
    notifications: {
      emailNotifications: true,
      newEnrollments: true,
      courseUpdates: true,
      paymentAlerts: true
    },
    profile: {
      firstName: '',
      lastName: '',
      email: '',
      bio: '',
      website: '',
      linkedin: '',
      twitter: '',
      profileImageUrl: ''
    },
    preferences: {
      timezone: 'UTC',
      currency: 'USD',
      language: 'en'
    }
  };

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserSettings();
  }

  loadUserSettings(): void {
    this.currentUser = this.authService.getCurrentUserValue();
    
    // Load fresh user data from the backend
    this.userService.getUserProfile().subscribe({
      next: (userProfile) => {
        // Update the current user with fresh data
        this.currentUser = {
          ...this.currentUser,
          ...userProfile
        };
        
        // Update the form with the fresh data
        this.settings.profile.firstName = userProfile.firstName || '';
        this.settings.profile.lastName = userProfile.lastName || '';
        this.settings.profile.email = userProfile.email || '';
        this.settings.profile.profileImageUrl = userProfile.profilePictureUrl || '';
        this.profileImagePreview = ImageUrlUtil.getFullImageUrl(userProfile.profilePictureUrl);
        
        // Update the auth service with the fresh user data
        this.authService.updateCurrentUser(this.currentUser);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        
        // Fallback to token data if API call fails
        if (this.currentUser) {
          this.settings.profile.firstName = this.currentUser.firstName || '';
          this.settings.profile.lastName = this.currentUser.lastName || '';
          this.settings.profile.email = this.currentUser.email || '';
          this.settings.profile.profileImageUrl = this.currentUser.profileImageUrl || '';
          this.profileImagePreview = ImageUrlUtil.getFullImageUrl(this.currentUser.profileImageUrl);
        }
      }
    });
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }
      
      this.profileImageFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfileImage(): void {
    if (!this.profileImageFile || !this.currentUser) {
      return;
    }
    
    this.uploadingImage = true;
    
    this.userService.updateProfileImage(this.currentUser.id, this.profileImageFile).subscribe({
      next: (response) => {
        this.settings.profile.profileImageUrl = response.profileImageUrl;
        this.profileImagePreview = ImageUrlUtil.getFullImageUrl(response.profileImageUrl);
        this.profileImageFile = null;
        this.uploadingImage = false;
        
        // Update the current user in auth service
        const updatedUser = { ...this.currentUser, profileImageUrl: response.profileImageUrl };
        this.authService.updateCurrentUser(updatedUser);
        
        alert('Profile image updated successfully!');
      },
      error: (error) => {
        console.error('Error uploading profile image:', error);
        this.uploadingImage = false;
        alert('Error uploading profile image. Please try again.');
      }
    });
  }

  removeProfileImage(): void {
    this.profileImageFile = null;
    this.profileImagePreview = null;
    this.settings.profile.profileImageUrl = '';
  }

  saveSettings(): void {
    this.loading = true;
    // Implement settings save logic here
    console.log('Saving settings:', this.settings);
    
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      alert('Settings saved successfully!');
    }, 1000);
  }

  resetSettings(): void {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      this.loadUserSettings();
    }
  }
} 