import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  profilePictureUrl: string;
}

export interface UpdateProfileImageResponse {
  profileImageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/profile`);
  }

  updateProfileImage(userId: string, file: File): Observable<UpdateProfileImageResponse> {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    return this.http.post<UpdateProfileImageResponse>(
      `${this.apiUrl}/users/${userId}/profile-image`,
      formData
    );
  }
} 