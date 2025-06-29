import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PagedResult } from '../../shared/models/paged-result.model';
import { Course } from '../../shared/models/course.model';

// Request/Response interfaces for course creation
export interface CreateCourseRequest {
  title: string;
  description: string;
  price: number;
  instructorId: string;
  categoryId?: number;
  thumbnailImageUrl?: string;
  isPublished?: boolean;
}

export interface CreateSectionRequest {
  title: string;
  description?: string;
  order: number;
}

export interface CreateLessonRequest {
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration?: number;
  content?: string;
  videoUrl?: string;
  order: number;
}

export interface CourseCreationResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
  thumbnailImageUrl?: string;
  categoryId?: number;
  categoryName?: string;
  instructorId: string;
  instructorName?: string;
}

export interface SectionResponse {
  id: number;
  title: string;
  description?: string;
  order: number;
  courseId: number;
}

export interface LessonResponse {
  id: number;
  sectionId: number;
  title: string;
  videoUrl: string;
  durationInMinutes?: number;
  order: number;
  isPreviewAllowed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(private http: HttpClient) { 
    console.log('CourseService initialized with API URL:', environment.apiUrl);
  }

  private apiUrl = environment.apiUrl; 

  getCourses(pageNumber: number = 1, pageSize: number = 10): Observable<PagedResult<Course>> {
    const url = `${this.apiUrl}/Courses?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    console.log('Making API request to:', url);
    return this.http.get<PagedResult<Course>>(url);
  }

  // Create a new course
  createCourse(courseData: CreateCourseRequest): Observable<CourseCreationResponse> {
    const url = `${this.apiUrl}/Courses`;
    console.log('Creating course:', courseData);
    return this.http.post<CourseCreationResponse>(url, courseData);
  }

  // Create a section for a course
  createSection(courseId: number, sectionData: CreateSectionRequest): Observable<SectionResponse> {
    const url = `${this.apiUrl}/courses/${courseId}/sections`;
    console.log('Creating section for course:', courseId, sectionData);
    return this.http.post<SectionResponse>(url, sectionData);
  }

  // Create a lesson for a section
  createLesson(sectionId: number, lessonData: CreateLessonRequest): Observable<LessonResponse> {
    const url = `${this.apiUrl}/sections/${sectionId}/lectures`;
    console.log('Creating lesson for section:', sectionId, lessonData);
    return this.http.post<LessonResponse>(url, lessonData);
  }

  // Get course by ID
  getCourseById(id: number): Observable<CourseCreationResponse> {
    const url = `${this.apiUrl}/Courses/${id}`;
    return this.http.get<CourseCreationResponse>(url);
  }

  // Update course
  updateCourse(id: number, courseData: Partial<CreateCourseRequest>): Observable<void> {
    const url = `${this.apiUrl}/Courses/${id}`;
    return this.http.put<void>(url, { id, ...courseData });
  }

  // Get sections by course ID
  getSectionsByCourse(courseId: number): Observable<SectionResponse[]> {
    const url = `${this.apiUrl}/courses/${courseId}/sections`;
    console.log('Getting sections for course:', courseId);
    return this.http.get<SectionResponse[]>(url);
  }

  // Get lectures by section ID
  getLecturesBySection(sectionId: number): Observable<LessonResponse[]> {
    const url = `${this.apiUrl}/sections/${sectionId}/lectures`;
    console.log('Getting lectures for section:', sectionId);
    return this.http.get<LessonResponse[]>(url);
  }
}
