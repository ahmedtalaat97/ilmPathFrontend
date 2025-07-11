import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../course.service';
import { Course } from '../../../shared/models/course.model';
import { CourseCardComponent } from '../../../shared/components/course-card/course-card.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { EnrollmentService } from '../../enrollment/enrollment.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CategoryService, Category as RealCategory } from '../category.service';

interface Category {
  id: number;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CommonModule,
    CourseCardComponent,
    LoaderComponent,
    MatPaginatorModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('350ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('350ms', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: '0px', opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ height: '0px', opacity: 0 }))
      ])
    ])
  ]
})
export class CourseListComponent implements OnInit {

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router,
    private enrollmentService: EnrollmentService,
    private categoryService: CategoryService
  ) {
    console.log('CourseListComponent initialized');
  }

  // Course data
  courses: Course[] = [];
  loading = true;
  pageIndex = 0;
  pageSize = 8;
  totalCourses = 0;
  enrolledCourseIds = new Set<number | string>();

  // Search and filtering
  searchQuery = '';
  searchSubject = new Subject<string>();
  selectedCategoryId: number | null = null;
  sortBy = 'popular';
  viewMode: 'grid' | 'list' = 'grid';
  showFilters = false;

  // Filter options
  priceRange = 500;
  selectedDifficulty: string | null = null;
  selectedDuration: string | null = null;
  difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];

  // Categories
  categories: (Category & { icon: string })[] = [];

  ngOnInit(): void {
    console.log('CourseListComponent ngOnInit called');
    
    // Load real categories
    this.loadCategories();
    // Load user enrollments
    this.loadUserEnrollments();
    
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchQuery => {
      this.searchQuery = searchQuery;
      this.pageIndex = 0;
      this.loadCourses();
    });
    
    // Subscribe to query parameters for category filtering
    this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['category'] ? +params['category'] : null;
      this.searchQuery = params['search'] || '';
      this.pageIndex = 0; // Reset to first page when category changes
      this.loadCourses();
    });
  }

  private loadUserEnrollments(): void {
    this.enrollmentService.getMyEnrollments().subscribe({
      next: (res) => {
        for (const enrollment of res.items || []) {
          this.enrolledCourseIds.add(enrollment.courseId);
        }
      },
      error: (err) => {
        console.error('Error loading enrollments:', err);
      }
    });
  }

  loadCourses() {
    this.loading = true;
    this.courseService.getCourses(this.pageIndex + 1, this.pageSize, this.selectedCategoryId, this.searchQuery).subscribe({
      next: (response) => {
        console.log("API Response Received:", response);
        this.courses = response.items;
        this.totalCourses = response.totalCount || 0;
        console.log("Courses loaded:", this.courses.length);
        this.loading = false;
      },
      error: (err) => {
        console.error("API Error:", err);
        this.loading = false;
      }
    });
  }

  // Search functionality
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  performSearch(): void {
    this.pageIndex = 0;
    this.updateUrlParams();
    this.loadCourses();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.pageIndex = 0;
    this.updateUrlParams();
    this.loadCourses();
  }

  // Category filtering
  filterByCategory(categoryId: number): void {
    this.selectedCategoryId = this.selectedCategoryId === categoryId ? null : categoryId;
    this.pageIndex = 0;
    this.updateUrlParams();
    this.loadCourses();
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  }

  // Sorting
  onSortChange(): void {
    this.pageIndex = 0;
    this.loadCourses();
    // TODO: Implement actual sorting in the backend
  }

  // View mode
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // Filters
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadCourses();
    // TODO: Implement actual filtering in the backend
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.selectedCategoryId = null;
    this.selectedDifficulty = null;
    this.selectedDuration = null;
    this.priceRange = 500;
    this.pageIndex = 0;
    this.updateUrlParams();
    this.loadCourses();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.selectedCategoryId || this.selectedDifficulty || this.selectedDuration);
  }

  removeFilter(type: string): void {
    switch (type) {
      case 'category':
        this.selectedCategoryId = null;
        break;
      case 'search':
        this.searchQuery = '';
        break;
      case 'difficulty':
        this.selectedDifficulty = null;
        break;
      case 'duration':
        this.selectedDuration = null;
        break;
    }
    this.pageIndex = 0;
    this.updateUrlParams();
    this.loadCourses();
  }

  // Pagination
  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCourses();
  }

  // Utility methods
  private updateUrlParams(): void {
    const queryParams: any = {};
    if (this.selectedCategoryId) {
      queryParams.category = this.selectedCategoryId;
    }
    if (this.searchQuery) {
      queryParams.search = this.searchQuery;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  trackByFn(index: number, course: Course): string {
    return course.id;
  }

  isUserEnrolled(courseId: number | string): boolean {
    return this.enrolledCourseIds.has(courseId);
  }

  clearCategoryFilter() {
    this.selectedCategoryId = null;
    this.updateUrlParams();
    this.loadCourses();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories: RealCategory[]) => {
        this.categories = categories.map((cat: RealCategory) => ({
          ...cat,
          icon: this.getCategoryIcon(cat.name)
        }));
      },
      error: (err: any) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  getCategoryIcon(name: string): string {
    // Map category names to Material icons (customize as needed)
    const map: { [key: string]: string } = {
      'Development': 'code',
      'Business': 'business',
      'Design': 'palette',
      'Marketing': 'campaign',
      'Photography': 'camera_alt',
      'Music': 'music_note',
      'Programming': 'terminal',
      'Other': 'category'
    };
    return map[name] || 'category';
  }
}   
