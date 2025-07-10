import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Course {
  id: number;
  title: string;
  instructor: string;
  rating: number;
  students: number;
  image: string;
  price: number;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeInUp', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger('200ms', [
            animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate('700ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('700ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class LandingComponent implements OnInit {
  
  features: Feature[] = [
    {
      icon: 'smart_toy',
      title: 'AI-Powered Learning Assistant',
      description: 'Get personalized help and guidance from our intelligent AI chat system that understands your learning needs.'
    },
    {
      icon: 'play_circle',
      title: 'Interactive Video Learning',
      description: 'High-quality video lectures with progress tracking and seamless streaming for the best learning experience.'
    },
    {
      icon: 'dashboard',
      title: 'Teacher Dashboard',
      description: 'Comprehensive tools for instructors to create, manage, and track their courses with detailed analytics.'
    },
    {
      icon: 'analytics',
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed progress reports and achievement milestones.'
    },
    {
      icon: 'shopping_cart',
      title: 'Seamless Course Purchase',
      description: 'Easy course enrollment with secure payment processing and instant access to your content.'
    },
    {
      icon: 'school',
      title: 'Expert Instructors',
      description: 'Learn from industry experts and experienced educators who are passionate about sharing knowledge.'
    }
  ];

  featuredCourses: Course[] = [
    {
      id: 1,
      title: 'Complete Web Development Bootcamp',
      instructor: 'Sarah Johnson',
      rating: 4.8,
      students: 15420,
      image: '/api/placeholder/300/200',
      price: 89.99
    },
    {
      id: 2,
      title: 'Machine Learning Fundamentals',
      instructor: 'Dr. Ahmed Hassan',
      rating: 4.9,
      students: 8750,
      image: '/api/placeholder/300/200',
      price: 129.99
    },
    {
      id: 3,
      title: 'Digital Marketing Mastery',
      instructor: 'Emily Chen',
      rating: 4.7,
      students: 12300,
      image: '/api/placeholder/300/200',
      price: 79.99
    }
  ];

  testimonials = [
    {
      name: 'Ahmed Mostafa',
      role: 'Software Developer',
      content: 'IlmPath transformed my career! The AI assistant helped me understand complex topics, and the quality of courses is outstanding.',
      rating: 5
    },
    {
      name: 'Fatima Al-Zahra',
      role: 'Data Scientist',
      content: 'The interactive learning experience and progress tracking kept me motivated throughout my learning journey.',
      rating: 5
    },
    {
      name: 'Omar Khalil',
      role: 'Digital Marketer',
      content: 'As an instructor, the teacher dashboard gives me everything I need to create engaging courses and track student progress.',
      rating: 5
    }
  ];

  stats = [
    { number: '50,000+', label: 'Students' },
    { number: '500+', label: 'Courses' },
    { number: '100+', label: 'Expert Instructors' },
    { number: '4.8', label: 'Average Rating' }
  ];

  ngOnInit(): void {
    // Component initialization
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}
