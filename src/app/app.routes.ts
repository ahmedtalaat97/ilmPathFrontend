import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'landing', 
    loadComponent: () => import('./features/landing/landing.component').then(c => c.LandingComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register.component').then(c => c.RegisterComponent)
  },
  { 
    path: 'courses', 
    loadComponent: () => import('./features/courses/course-list/course-list.component').then(c => c.CourseListComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'courses/:id', 
    loadComponent: () => import('./features/courses/course-details/course-details.component').then(c => c.CourseDetailsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'courses/:id/learn', 
    loadComponent: () => import('./features/courses/course-player/course-player.component').then(c => c.CoursePlayerComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'teacher', 
    loadComponent: () => import('./features/teacher/dashboard/teacher-dashboard.component').then(c => c.TeacherDashboardComponent),
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'courses', pathMatch: 'full' },
      { 
        path: 'courses', 
        loadComponent: () => import('./features/teacher/courses/teacher-courses.component').then(c => c.TeacherCoursesComponent)
      },
      { 
        path: 'courses/new', 
        loadComponent: () => import('./features/teacher/course-builder/course-builder.component').then(c => c.CourseBuilderComponent)
      },
      { 
        path: 'courses/:id/edit', 
        loadComponent: () => import('./features/teacher/course-builder/course-builder.component').then(c => c.CourseBuilderComponent)
      }
    ]
  },
  { 
    path: 'cart', 
    loadComponent: () => import('./features/courses/cart/cart.component').then(c => c.CartComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'checkout-success',
    loadComponent: () => import('./features/courses/cart/checkout-success.component').then(m => m.CheckoutSuccessComponent)
  },
  { 
    path: 'chat', 
    loadComponent: () => import('./features/ai-chat/ai-chat.component').then(c => c.AiChatComponent)
   
  },
  { 
    path: 'my-courses', 
    loadComponent: () => import('./features/courses/my-courses/my-courses.component').then(c => c.MyCoursesComponent),
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: '**', redirectTo: 'landing' } // Wildcard route for 404 pages
]; 