import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../models/course.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.css'
})
export class CourseCardComponent {
  isBestseller = Math.random() > 0.7; 

  @Input({ required: true }) course!: Course;
}
