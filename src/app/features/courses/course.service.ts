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
  categoryId?: number;
  thumbnailImageUrl?: string;
  isPublished?: boolean;
}

// New interface for course creation with file
export interface CreateCourseWithFileRequest {
  title: string;
  description: string;
  price: number;
  categoryId?: number;
  thumbnailFile?: File;
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

// New interfaces for course player
export interface CourseWithContent {
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
  totalDurationMinutes: number;
  totalLecturesCount: number;
  sectionsCount: number;
  sections: SectionWithLectures[];
}

export interface SectionWithLectures {
  id: number;
  courseId: number;
  title: string;
  description: string;
  order: number;
  durationMinutes: number;
  lecturesCount: number;
  lectures: LessonResponse[];
}

export interface UploadResponse {
  url: string;
  fileName: string;
  size: number;
}

// Add new interface for video upload response
export interface VideoUploadResponse {
  videoUrl: string;
  message: string;
  durationInMinutes: number;
  durationInSeconds: number;
}

// New interface for course update with file
export interface UpdateCourseWithFileRequest {
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
  categoryId?: number;
  thumbnailImageUrl?: string;
  thumbnailFile?: File;
}

// Add new interface for regular course update (without file)
export interface UpdateCourseRequest {
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
  categoryId?: number;
  thumbnailImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(private http: HttpClient) { 
    console.log('CourseService initialized with API URL:', environment.apiUrl);
  }

  private apiUrl = environment.apiUrl; 

  getCourses(pageNumber: number = 1, pageSize: number = 10, categoryId?: number | null, searchQuery?: string | null): Observable<PagedResult<Course>> {
    let url: string;
    let params = new URLSearchParams();
    
    params.append('PageNumber', pageNumber.toString());
    params.append('PageSize', pageSize.toString());
    
    if (searchQuery && searchQuery.trim()) {
      params.append('SearchQuery', searchQuery.trim());
    }
    
    if (categoryId) {
      url = `${this.apiUrl}/Courses/category?CategoryId=${categoryId}&${params.toString()}`;
    } else {
      url = `${this.apiUrl}/Courses?${params.toString()}`;
    }
    
    console.log('Making API request to:', url);
    return this.http.get<PagedResult<Course>>(url);
  }

  getCoursesByInstructor(pageNumber: number = 1, pageSize: number = 10): Observable<PagedResult<Course>> {
    const url = `${this.apiUrl}/Courses/instructor?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    console.log('Making API request to get instructor courses:', url);
    return this.http.get<PagedResult<Course>>(url);
  }

  // Get total students count for an instructor
  getInstructorStudentsCount(instructorId: string): Observable<number> {
    const url = `${this.apiUrl}/Enrollments/instructor/${instructorId}/students-count`;
    console.log('Making API request to get instructor students count:', url);
    return this.http.get<number>(url);
  }

  // Create a new course with optional thumbnail file
  createCourse(courseData: CreateCourseWithFileRequest): Observable<CourseCreationResponse> {
    const url = `${this.apiUrl}/Courses`;
    
    // Create FormData for multipart request
    const formData = new FormData();
    formData.append('title', courseData.title);
    formData.append('description', courseData.description);
    formData.append('price', courseData.price.toString());
    
    if (courseData.categoryId) {
      formData.append('categoryId', courseData.categoryId.toString());
    }
    
    if (courseData.thumbnailFile) {
      formData.append('thumbnailFile', courseData.thumbnailFile);
    }

    if (courseData.isPublished !== undefined) {
      formData.append('isPublished', courseData.isPublished.toString());
    }

    console.log('Creating course with FormData:', courseData);
    return this.http.post<CourseCreationResponse>(url, formData);
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

  // Get course with all content for learning (NEW METHOD)
  getCourseWithContent(id: number): Observable<CourseWithContent> {
    const url = `${this.apiUrl}/Courses/${id}/learn`;
    console.log('Getting course with content for learning:', id);
    return this.http.get<CourseWithContent>(url);
  }

  // Update course
  updateCourse(id: number, courseData: UpdateCourseRequest): Observable<void> {
    const url = `${this.apiUrl}/Courses/${id}`;
    
    // Create FormData since backend expects FormData
    const formData = new FormData();
    formData.append('title', courseData.title);
    formData.append('description', courseData.description);
    formData.append('price', courseData.price.toString());
    formData.append('isPublished', courseData.isPublished.toString());
    
    if (courseData.categoryId) {
      formData.append('categoryId', courseData.categoryId.toString());
    }
    
    if (courseData.thumbnailImageUrl) {
      formData.append('thumbnailImageUrl', courseData.thumbnailImageUrl);
    }

    console.log('Updating course with FormData:', courseData);
    return this.http.put<void>(url, formData);
  }

  // Update course with optional thumbnail file
  updateCourseWithFile(id: number, courseData: UpdateCourseWithFileRequest): Observable<void> {
    const url = `${this.apiUrl}/Courses/${id}`;
    
    // Create FormData for multipart request
    const formData = new FormData();
    formData.append('title', courseData.title);
    formData.append('description', courseData.description);
    formData.append('price', courseData.price.toString());
    formData.append('isPublished', courseData.isPublished.toString());
    
    if (courseData.categoryId) {
      formData.append('categoryId', courseData.categoryId.toString());
    }
    
    if (courseData.thumbnailImageUrl) {
      formData.append('thumbnailImageUrl', courseData.thumbnailImageUrl);
    }
    
    if (courseData.thumbnailFile) {
      formData.append('thumbnailFile', courseData.thumbnailFile);
    }

    console.log('Updating course with FormData:', courseData);
    return this.http.put<void>(url, formData);
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

  // Upload video for a lecture
  uploadLessonVideo(lectureId: number, videoFile: File): Observable<VideoUploadResponse> {
    const formData = new FormData();
    formData.append('videoFile', videoFile);
    
    const url = `${this.apiUrl}/lectures/${lectureId}/video`;
    console.log('Uploading video for lecture:', lectureId);
    return this.http.post<VideoUploadResponse>(url, formData);
  }

  // Delete a course
  deleteCourse(courseId: string): Observable<void> {
    const url = `${this.apiUrl}/Courses/${courseId}`;
    return this.http.delete<void>(url);
  }
}
