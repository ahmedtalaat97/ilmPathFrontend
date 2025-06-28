import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/courses']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    if (confirmPassword?.hasError('mismatch')) {
      delete confirmPassword.errors!['mismatch'];
      if (Object.keys(confirmPassword.errors!).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Remove confirmPassword from the data sent to backend
      const { confirmPassword, ...registerData } = this.registerForm.value;
      console.log('registerData', registerData);
      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.successMessage = 'Account created successfully! You can now sign in.';
          this.isLoading = false;
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          console.error('Registration failed:', error);
          this.isLoading = false;
          
          // Handle different error types
          if (error.status === 400) {
            this.errorMessage = error.error?.detail || 'Invalid registration data. Please check your inputs.';
          } else if (error.status === 0) {
            this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else {
            this.errorMessage = error.error?.detail || 'An error occurred during registration. Please try again.';
          }
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.registerForm.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.capitalizeFirst(fieldName)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('minlength')) {
      return `${this.capitalizeFirst(fieldName)} must be at least ${field.errors?.['minlength'].requiredLength} characters`;
    }
    if (fieldName === 'confirmPassword' && field?.hasError('mismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  private capitalizeFirst(str: string): string {
    // Handle camelCase field names
    const result = str.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }
} 