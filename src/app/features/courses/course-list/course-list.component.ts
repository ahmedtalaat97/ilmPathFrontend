import { Component, OnInit } from '@angular/core';
import { CourseService } from '../course.service';
import { Course } from '../../../shared/models/course.model';

@Component({
  selector: 'app-course-list',
  standalone: false,
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css'
})
export class CourseListComponent implements OnInit {

  constructor(private courseService: CourseService) {
    console.log('CourseListComponent initialized');
  }

  courses: Course[] = [];
  
  ngOnInit(): void {
    console.log('CourseListComponent ngOnInit called');
    this.courseService.getCourses().subscribe({
      next: (response) => {
        console.log("API Response Received:", response);
        this.courses = response.items;
        console.log("Courses loaded:", this.courses.length);
      },
      error: (err) => {
        console.error("API Error:", err);
      }
    });
  }
}   
