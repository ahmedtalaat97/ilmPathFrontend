# Rating System Implementation

This document describes the complete rating system implementation for the IlmPath application, including both backend API endpoints and frontend Angular components.

## Backend API Endpoints

The rating system uses the following REST API endpoints:

### 1. Get Course Ratings
- **Endpoint**: `GET /api/CourseRatings/course/{courseId}`
- **Description**: Retrieves paginated ratings for a specific course
- **Parameters**:
  - `courseId` (path): ID of the course
  - `pageNumber` (query): Page number (default: 1)
  - `pageSize` (query): Items per page (default: 10)
  - `ratingFilter` (query, optional): Filter by rating value (1-5)
- **Authorization**: Public (no authentication required)
- **Response**: `PagedResult<CourseRatingResponse>`

### 2. Add Course Rating
- **Endpoint**: `POST /api/CourseRatings`
- **Description**: Adds a new rating for a course
- **Authorization**: Required (user must be authenticated and enrolled)
- **Request Body**: `AddCourseRatingRequest`
  ```json
  {
    "courseId": 123,
    "ratingValue": 5,
    "reviewText": "Excellent course!"
  }
  ```
- **Response**: `{ "courseRatingId": 456 }`

### 3. Delete Course Rating
- **Endpoint**: `DELETE /api/CourseRatings/{ratingId}`
- **Description**: Deletes a specific rating
- **Authorization**: Required (user must own the rating or be admin)
- **Response**: `204 No Content`

## Frontend Implementation

### Models

#### CourseRating Interface
```typescript
interface CourseRating {
  id: number;
  ratingValue: number;
  reviewText?: string;
  createdAt: Date;
  userName: string;
  userProfileImageUrl: string;
}
```

#### Request/Response Interfaces
```typescript
interface AddCourseRatingRequest {
  courseId: number;
  ratingValue: number;
  reviewText?: string;
}

interface GetCourseRatingsQuery {
  pageNumber: number;
  pageSize: number;
  ratingFilter?: number;
}
```

### Services

#### RatingService
Located at: `src/app/features/courses/rating.service.ts`

**Methods:**
- `getCourseRatings(courseId, query)`: Get paginated ratings
- `addCourseRating(request)`: Add new rating
- `deleteCourseRating(ratingId)`: Delete rating

### Components

#### 1. RatingDisplayComponent
**Location**: `src/app/shared/components/rating-display/rating-display.component.ts`

**Purpose**: Displays star ratings with optional interactivity

**Usage:**
```html
<!-- Read-only rating display -->
<app-rating-display [rating]="4.5" [interactive]="false" [showText]="true"></app-rating-display>

<!-- Interactive rating input -->
<app-rating-display 
  [rating]="userRating" 
  [interactive]="true"
  (ratingChange)="onRatingChange($event)">
</app-rating-display>
```

**Properties:**
- `rating`: Current rating value (0-5)
- `maxRating`: Maximum rating value (default: 5)
- `interactive`: Allow user interaction
- `showText`: Show rating text description

#### 2. CourseRatingsComponent
**Location**: `src/app/features/courses/components/course-ratings/course-ratings.component.ts`

**Purpose**: Displays paginated list of all ratings for a course

**Usage:**
```html
<app-course-ratings [courseId]="courseId"></app-course-ratings>
```

**Features:**
- Pagination support
- Rating filter (1-5 stars)
- User avatars and names
- Date formatting
- Responsive design

#### 3. AddRatingComponent
**Location**: `src/app/features/courses/components/add-rating/add-rating.component.ts`

**Purpose**: Form for adding new course ratings

**Usage:**
```html
<app-add-rating 
  [courseId]="courseId"
  (ratingAdded)="onRatingAdded()"
  (cancelled)="onCancel()">
</app-add-rating>
```

**Features:**
- Interactive star rating
- Optional review text
- Character counter
- Validation and error handling
- Success feedback

#### 4. RatingSummaryComponent
**Location**: `src/app/features/courses/components/rating-summary/rating-summary.component.ts`

**Purpose**: Shows average rating and distribution breakdown

**Usage:**
```html
<!-- Full summary with breakdown -->
<app-rating-summary [courseId]="courseId" [showBreakdown]="true"></app-rating-summary>

<!-- Compact version for course cards -->
<app-rating-summary [courseId]="courseId" [compact]="true" [showBreakdown]="false"></app-rating-summary>
```

**Features:**
- Average rating calculation
- Star distribution visualization
- Progress bars for each rating level
- Compact mode for course cards

#### 5. CourseDetailWithRatingsComponent
**Location**: `src/app/features/courses/components/course-detail-with-ratings/course-detail-with-ratings.component.ts`

**Purpose**: Example integration showing how to use all rating components together

**Usage:**
```html
<app-course-detail-with-ratings 
  [courseId]="courseId"
  [courseName]="course.title"
  [courseDescription]="course.description"
  [canRate]="userIsEnrolled"
  [showAllRatings]="true">
</app-course-detail-with-ratings>
```

## Integration Examples

### 1. Adding Ratings to Course Cards

```html
<!-- In your course card component -->
<div class="course-card">
  <h3>{{ course.title }}</h3>
  <p>{{ course.description }}</p>
  
  <!-- Add compact rating summary -->
  <app-rating-summary 
    [courseId]="course.id" 
    [compact]="true" 
    [showBreakdown]="false">
  </app-rating-summary>
  
  <div class="course-actions">
    <button>View Course</button>
  </div>
</div>
```

### 2. Course Detail Page Integration

```html
<!-- In your course detail component -->
<div class="course-detail">
  <!-- Course info -->
  <div class="course-header">
    <h1>{{ course.title }}</h1>
    <p>{{ course.description }}</p>
  </div>

  <!-- Rating summary -->
  <app-rating-summary [courseId]="course.id"></app-rating-summary>

  <!-- Enrollment actions -->
  <div class="course-actions" *ngIf="!isEnrolled">
    <button (click)="enrollInCourse()">Enroll Now</button>
  </div>

  <!-- Rating actions for enrolled users -->
  <div class="rating-section" *ngIf="isEnrolled">
    <app-add-rating 
      [courseId]="course.id"
      (ratingAdded)="refreshRatings()">
    </app-add-rating>
  </div>

  <!-- All ratings -->
  <app-course-ratings [courseId]="course.id"></app-course-ratings>
</div>
```

### 3. Using the Rating Service

```typescript
// In your component
export class CourseDetailComponent implements OnInit {
  courseId: number;
  ratings: CourseRating[] = [];

  constructor(private ratingService: RatingService) {}

  ngOnInit() {
    this.loadRatings();
  }

  loadRatings() {
    const query: GetCourseRatingsQuery = {
      pageNumber: 1,
      pageSize: 10
    };

    this.ratingService.getCourseRatings(this.courseId, query).subscribe({
      next: (result) => {
        this.ratings = result.items;
      },
      error: (error) => {
        console.error('Error loading ratings:', error);
      }
    });
  }

  addRating(ratingValue: number, reviewText: string) {
    const request: AddCourseRatingRequest = {
      courseId: this.courseId,
      ratingValue,
      reviewText
    };

    this.ratingService.addCourseRating(request).subscribe({
      next: (response) => {
        console.log('Rating added:', response.courseRatingId);
        this.loadRatings(); // Refresh ratings
      },
      error: (error) => {
        console.error('Error adding rating:', error);
      }
    });
  }
}
```

## Styling and Customization

All components use CSS-in-JS styling and are designed to be responsive. Key design features:

- **Star Rating**: Uses ★ unicode character with golden color (#ffc107)
- **Progress Bars**: For rating distribution with smooth animations
- **Responsive Design**: Mobile-first approach with breakpoints
- **Error Handling**: Clear error messages and validation
- **Loading States**: Loading indicators for better UX

## Authentication Requirements

- **GET ratings**: No authentication required (public)
- **POST rating**: User must be authenticated and enrolled in the course
- **DELETE rating**: User must own the rating or have admin privileges

## Error Handling

The components handle common error scenarios:

- **401 Unauthorized**: User not logged in
- **400 Bad Request**: User already rated or not enrolled
- **403 Forbidden**: User cannot delete rating
- **Network errors**: Generic error messages

## Performance Considerations

- Rating summary loads first 100 ratings for calculation
- Pagination prevents loading too many ratings at once
- Consider implementing caching for rating summaries
- For high-traffic applications, consider adding a separate rating statistics API endpoint

## Future Enhancements

Potential improvements to consider:

1. **Rating Statistics API**: Separate endpoint for average ratings and distribution
2. **Real-time Updates**: WebSocket updates when new ratings are added
3. **Rating Moderation**: Admin tools for managing inappropriate reviews
4. **Advanced Filtering**: Filter by date, verified purchases, etc.
5. **Rating Helpful Votes**: Allow users to vote on helpful reviews
6. **Image/Video Reviews**: Support for media in reviews 