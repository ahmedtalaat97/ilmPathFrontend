import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PagedResult } from '../../shared/models/paged-result.model';
import { Course } from '../../shared/models/course.model';

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



}
