import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../shared/models/paged-result.model';
import { 
  CourseRating, 
  AddCourseRatingRequest, 
  AddCourseRatingResponse,
  GetCourseRatingsQuery 
} from '../../shared/models/rating.model';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('RatingService initialized with API URL:', environment.apiUrl);
  }

  /**
   * Get paginated ratings for a specific course
   * @param courseId - The ID of the course
   * @param query - Pagination and filter parameters
   * @returns Observable of paginated course ratings
   */
  getCourseRatings(courseId: number, query: GetCourseRatingsQuery): Observable<PagedResult<CourseRating>> {
    const url = `${this.apiUrl}/CourseRatings/course/${courseId}`;
    
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber.toString())
      .set('pageSize', query.pageSize.toString());
    
    if (query.ratingFilter) {
      params = params.set('ratingFilter', query.ratingFilter.toString());
    }

    console.log('Getting course ratings:', url, query);
    return this.http.get<PagedResult<CourseRating>>(url, { params });
  }

  /**
   * Add a new rating for a course
   * @param request - The rating data
   * @returns Observable of the created rating response
   */
  addCourseRating(request: AddCourseRatingRequest): Observable<AddCourseRatingResponse> {
    const url = `${this.apiUrl}/CourseRatings`;
    
    console.log('Adding course rating:', url, request);
    return this.http.post<AddCourseRatingResponse>(url, request);
  }

  /**
   * Delete a course rating
   * @param ratingId - The ID of the rating to delete
   * @returns Observable of void
   */
  deleteCourseRating(ratingId: number): Observable<void> {
    const url = `${this.apiUrl}/CourseRatings/${ratingId}`;
    
    console.log('Deleting course rating:', url);
    return this.http.delete<void>(url);
  }
} 