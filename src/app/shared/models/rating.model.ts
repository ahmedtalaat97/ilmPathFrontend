export interface CourseRating {
  id: number;
  ratingValue: number;
  reviewText?: string;
  createdAt: Date;
  userName: string;
  userProfileImageUrl: string;
}

export interface AddCourseRatingRequest {
  courseId: number;
  ratingValue: number;
  reviewText?: string;
}

export interface AddCourseRatingResponse {
  courseRatingId: number;
}

export interface GetCourseRatingsQuery {
  pageNumber: number;
  pageSize: number;
  ratingFilter?: number; // 1-5 star filter
} 