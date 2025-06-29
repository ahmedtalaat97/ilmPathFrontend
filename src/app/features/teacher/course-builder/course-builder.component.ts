import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-course-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSlideToggleModule
  ],
  templateUrl: './course-builder.component.html',
  styleUrls: ['./course-builder.component.css']
})
export class CourseBuilderComponent implements OnInit {

  courseForm!: FormGroup;
  isEditMode = false;
  courseId: string | null = null;
  activeTab = 0;

  // Mock categories - in production, fetch from API
  categories = [
    { id: 1, name: 'Web Development' },
    { id: 2, name: 'Data Science' },
    { id: 3, name: 'Mobile Development' },
    { id: 4, name: 'Cloud Computing' },
    { id: 5, name: 'Business & Entrepreneurship' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.courseId;

    if (this.isEditMode) {
      this.loadCourse();
    }
  }

  initializeForm(): void {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      thumbnailImageUrl: [''],
      isPublished: [false]
    });
  }

  loadCourse(): void {
    // TODO: Implement course loading from API
    console.log('Loading course:', this.courseId);
    // Mock data for now
    if (this.courseId) {
      this.courseForm.patchValue({
        title: 'Sample Course',
        description: 'This is a sample course description',
        price: 99.99,
        categoryId: 1,
        isPublished: false
      });
    }
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      const courseData = this.courseForm.value;
      
      if (this.isEditMode) {
        this.updateCourse(courseData);
      } else {
        this.createCourse(courseData);
      }
    }
  }

  createCourse(courseData: any): void {
    // TODO: Implement course creation API call
    console.log('Creating course:', courseData);
    // Mock success
    this.router.navigate(['/teacher/courses']);
  }

  updateCourse(courseData: any): void {
    // TODO: Implement course update API call
    console.log('Updating course:', this.courseId, courseData);
    // Mock success
    this.router.navigate(['/teacher/courses']);
  }

  onCancel(): void {
    this.router.navigate(['/teacher/courses']);
  }

  onTabChange(index: number): void {
    this.activeTab = index;
  }

  // File upload handlers
  onThumbnailSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // TODO: Implement file upload
      console.log('Thumbnail selected:', file);
    }
  }

  // Preview mode
  previewCourse(): void {
    // TODO: Implement course preview
    console.log('Preview course');
  }
} 