import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Section {
  id: number;
  courseId: number;
  title: string;
  order: number;
}

export interface SectionRequest {
  title: string;
  order: number;
}

@Injectable({ providedIn: 'root' })
export class SectionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createSection(courseId: number, section: SectionRequest): Observable<Section> {
    return this.http.post<Section>(`${this.apiUrl}/courses/${courseId}/sections`, section);
  }

  getSectionsByCourse(courseId: number): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/courses/${courseId}/sections`);
  }

  getSectionById(sectionId: number): Observable<Section> {
    return this.http.get<Section>(`${this.apiUrl}/sections/${sectionId}`);
  }

  updateSection(sectionId: number, section: SectionRequest): Observable<Section> {
    return this.http.put<Section>(`${this.apiUrl}/sections/${sectionId}`, section);
  }

  deleteSection(sectionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sections/${sectionId}`);
  }
} 