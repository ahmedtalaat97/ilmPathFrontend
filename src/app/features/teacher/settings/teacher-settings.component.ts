import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

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
      twitter: ''
    },
    preferences: {
      timezone: 'UTC',
      currency: 'USD',
      language: 'en'
    }
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserSettings();
  }

  loadUserSettings(): void {
    this.currentUser = this.authService.getCurrentUserValue();
    if (this.currentUser) {
      this.settings.profile.firstName = this.currentUser.firstName || '';
      this.settings.profile.lastName = this.currentUser.lastName || '';
      this.settings.profile.email = this.currentUser.email || '';
    }
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