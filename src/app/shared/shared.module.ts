import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

// We will use Card, Button, Icon for a wishlist feature, and Chips for tags.


import { CourseCardComponent } from './components/course-card/course-card.component';

@NgModule({
  declarations: [
    CourseCardComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  exports: [
    CourseCardComponent
  ]
})
export class SharedModule { } 