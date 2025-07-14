# IlmPath Frontend

[![Angular](https://img.shields.io/badge/Angular-19.2-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Angular Material](https://img.shields.io/badge/Angular%20Material-19.2-blue.svg)](https://material.angular.io/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)](https://getbootstrap.com/)

A modern, responsive e-learning platform frontend built with **Angular 19** and **Angular Material**. This application provides an intuitive interface for students, instructors, and administrators to manage online courses, track learning progress, and facilitate AI-powered learning experiences.

## 🔗 Related Repositories

- **Backend API**: [IlmPath Backend](https://github.com/elkhaligy/ilmPath) - .NET 9.0 API with Clean Architecture


## 🏗️ Architecture Overview

This Angular application follows a **feature-based modular architecture** with clear separation of concerns:

```
src/app/
├── core/                           # Singleton services and app-wide functionality
│   ├── services/                   # Core services (Auth, HTTP, etc.)
│   ├── guards/                     # Route guards (Auth, Admin)
│   ├── interceptors/               # HTTP interceptors
│   └── utils/                      # Utility functions
├── features/                       # Feature modules
│   ├── auth/                       # Authentication (Login, Register)
│   ├── courses/                    # Course management
│   ├── teacher/                    # Instructor dashboard
│   ├── admin/                      # Admin dashboard
│   ├── ai-chat/                    # AI chat assistant
│   ├── landing/                    # Landing page
│   └── enrollment/                 # Course enrollment
├── shared/                         # Reusable components and models
│   ├── components/                 # Shared UI components
│   └── models/                     # TypeScript interfaces/models
└── layouts/                        # Layout components (Navbar, Footer)
```

## ✨ Key Features

### 🎓 Course Management
- **Course Discovery**: Browse and search comprehensive course catalog
- **Advanced Filtering**: Filter by categories, ratings, price, and difficulty
- **Course Details**: Detailed course information with preview content
- **Video Player**: Custom video player with progress tracking
- **Course Ratings**: Star ratings and detailed reviews system
- **Bookmarking**: Save favorite courses for later

### 👨‍🏫 Instructor Dashboard
- **Course Creation**: Intuitive course builder with drag-and-drop sections
- **Content Management**: Upload videos, create lessons, and organize content
- **Student Analytics**: Track student progress and engagement
- **Revenue Tracking**: Monitor earnings and payout requests
- **Course Analytics**: Detailed insights into course performance

### 👑 Admin Panel
- **User Management**: Comprehensive user administration
- **Course Oversight**: Review and manage all courses
- **Analytics Dashboard**: Platform-wide statistics and insights
- **Category Management**: Organize courses into categories
- **Financial Reports**: Revenue and payout management
- **Withdrawal Requests**: Handle instructor payout requests

### 🛒 E-commerce Features
- **Shopping Cart**: Redis-powered cart with persistent sessions
- **Stripe Integration**: Secure payment processing
- **Coupon System**: Apply discounts and promotional codes
- **Purchase History**: Track all course purchases
- **Instant Access**: Immediate course access after purchase

### 🤖 AI-Powered Learning
- **AI Chat Assistant**: 24/7 intelligent learning support
- **Contextual Help**: AI responses tailored to course content
- **Chat Widget**: Floating chat widget available on all pages
- **Learning Recommendations**: AI-suggested learning paths

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different access levels (Student, Instructor, Admin)
- **Route Protection**: Auth guards protecting sensitive routes
- **Auto-logout**: Automatic logout on token expiration
- **Profile Management**: User profile customization with image upload

### 📱 User Experience
- **Responsive Design**: Mobile-first responsive layout
- **Material Design**: Consistent Google Material Design language
- **Smooth Animations**: Engaging page transitions and interactions
- **Loading States**: User-friendly loading indicators
- **Error Handling**: Comprehensive error messaging
- **Accessibility**: WCAG compliance for inclusive design

## 🛠️ Technology Stack

### Core Technologies
- **Framework**: Angular 19.2
- **Language**: TypeScript 5.7
- **Build Tool**: Angular CLI 19.2
- **Package Manager**: npm

### UI/UX Libraries
- **UI Components**: Angular Material 19.2
- **CSS Framework**: Bootstrap 5.3
- **Icons**: Bootstrap Icons 1.13, Material Icons
- **Animations**: Angular Animations API
- **Charts**: ng2-charts with Chart.js 4.5

### External Integrations
- **Payment Processing**: Stripe.js 7.4
- **HTTP Client**: Angular HttpClient
- **Reactive Programming**: RxJS 7.8
- **Form Handling**: Angular Reactive Forms

### Development Tools
- **Testing**: Jasmine, Karma
- **Linting**: Angular ESLint
- **Code Formatting**: Prettier (configurable)

## 📋 Prerequisites

Before running the application, ensure you have:

- **Node.js**: Version 18.x or later
- **npm**: Version 9.x or later
- **Angular CLI**: Version 19.x or later
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ilmPathFrontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create environment files in `src/environments/`:

**environment.ts** (Development):
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001/api',
  stripePublishableKey: 'pk_test_your_stripe_key_here'
};
```

**environment.production.ts** (Production):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  stripePublishableKey: 'pk_live_your_stripe_key_here'
};
```

### 4. Start Development Server
```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you make changes to source files.

### 5. Build for Production
```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## 🗺️ Application Routes

### Public Routes
```
/landing              # Landing page with platform overview
/login               # User authentication
/register            # User registration
/chat                # AI chat assistant (public access)
```

### Protected Routes (Requires Authentication)
```
/courses             # Course catalog and search
/courses/:id         # Course details page
/courses/:id/learn   # Course player for enrolled students
/my-courses          # User's enrolled courses
/cart                # Shopping cart
/checkout-success    # Payment success page
/settings            # User profile settings
```

### Instructor Routes (Requires Instructor Role)
```
/teacher             # Instructor dashboard
/teacher/courses     # Manage instructor courses
/teacher/courses/new # Create new course
/teacher/courses/:id/edit # Edit existing course
/teacher/analytics   # Course and student analytics
/teacher/payouts     # Earnings and payout requests
/teacher/students    # Student management
/teacher/settings    # Instructor profile settings
```

### Admin Routes (Requires Admin Role)
```
/admin               # Admin dashboard
/admin/users         # User management
/admin/courses       # Course oversight
/admin/categories    # Category management
/admin/reports       # Platform analytics
/admin/withdrawal-requests # Payout management
```

## 🎨 UI Components & Features

### Core Components
- **Navbar**: Responsive navigation with user menu and cart
- **Footer**: Platform information and links
- **Chat Widget**: Floating AI assistant available on all pages
- **Loader**: Consistent loading indicators
- **Error Messages**: User-friendly error handling

### Course Components
- **Course Card**: Responsive course preview cards
- **Course Player**: Custom video player with progress tracking
- **Rating System**: Star ratings with detailed reviews
- **Section Management**: Expandable course sections
- **Lecture List**: Organized lesson navigation

### Form Components
- **Reactive Forms**: Angular reactive forms with validation
- **File Upload**: Drag-and-drop file upload for images and videos
- **Form Validation**: Real-time validation with helpful error messages

### Data Visualization
- **Charts**: Interactive charts for analytics (using Chart.js)
- **Progress Bars**: Course completion tracking
- **Statistics Cards**: Dashboard metrics and KPIs

## 🔧 Configuration & Customization

### Theming
The application uses Angular Material theming. Customize colors in `src/styles.css`:

```scss
@import '@angular/material/theming';

$primary: mat-palette($mat-blue);
$accent: mat-palette($mat-pink, A200, A100, A400);
$warn: mat-palette($mat-red);

$theme: mat-light-theme($primary, $accent, $warn);
@include angular-material-theme($theme);
```

### Environment Configuration
Adjust settings in environment files:
- API endpoints
- Feature flags
- Third-party service keys
- Debug settings

### Build Configuration
Modify `angular.json` for:
- Build optimization settings
- Asset management
- Development server configuration
- Production build settings

## 🧪 Testing

### Running Unit Tests
```bash
ng test
```

### Running End-to-End Tests
```bash
ng e2e
```

### Test Coverage
```bash
ng test --code-coverage
```

Coverage reports will be generated in the `coverage/` directory.

## 📦 Building & Deployment

### Development Build
```bash
ng build
```

### Production Build
```bash
ng build --configuration production
```

### Build Optimization Features
- **Tree Shaking**: Removes unused code
- **Minification**: Compresses JavaScript and CSS
- **Bundle Splitting**: Optimizes loading performance
- **Service Worker**: PWA capabilities (configurable)

### Deployment Options
- **Static Hosting**: Deploy to GitHub Pages, Netlify, Vercel
- **CDN**: CloudFront, CloudFlare for global distribution
- **Container**: Docker deployment with Nginx
- **Traditional**: IIS, Apache web servers

## 🔒 Security Features

### Authentication Security
- JWT token storage in localStorage
- Automatic token refresh handling
- Secure logout with token cleanup
- Route guards preventing unauthorized access

### HTTP Security
- CSRF protection
- XSS prevention with Angular sanitization
- HTTP interceptors for consistent headers
- Error handling preventing information leakage

### Input Validation
- Client-side form validation
- Angular reactive forms with validators
- Sanitized user input rendering
- File upload restrictions

## 🚀 Performance Optimization

### Loading Performance
- **Lazy Loading**: Feature modules loaded on demand
- **OnPush Strategy**: Optimized change detection
- **Track By Functions**: Efficient list rendering
- **Image Optimization**: Responsive images with proper sizing

### Bundle Optimization
- **Code Splitting**: Automatic chunk splitting
- **Tree Shaking**: Dead code elimination
- **Compression**: Gzip/Brotli compression support
- **Caching**: Browser caching strategies

### User Experience
- **Loading States**: Skeleton loaders and spinners
- **Error Boundaries**: Graceful error handling
- **Smooth Animations**: CSS and Angular animations
- **Responsive Design**: Mobile-first approach

## 🐛 Troubleshooting

### Common Issues

**Node.js Version Compatibility**
```bash
# Check your Node.js version
node --version

# Update to latest LTS if needed
nvm install --lts
nvm use --lts
```

**Angular CLI Issues**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall Angular CLI
npm uninstall -g @angular/cli
npm install -g @angular/cli@latest
```

**Build Errors**
```bash
# Clear Angular cache
ng cache clean

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS Issues in Development**
- Ensure backend CORS is configured for `http://localhost:4200`
- Check environment API URL configuration
- Verify backend is running and accessible

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the style guide
4. Run tests (`ng test`)
5. Commit with conventional commits (`git commit -m 'feat: add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style Guidelines
- Follow Angular Style Guide
- Use TypeScript strict mode
- Write meaningful component and service names
- Add JSDoc comments for public methods
- Use reactive programming patterns with RxJS

### Commit Convention
```
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

## 📚 API Integration

This frontend integrates with the [IlmPath Backend API](../ilmPathServer). Key integrations include:

### Authentication Endpoints
- `POST /api/users/login` - User authentication
- `POST /api/users/register` - User registration
- `GET /api/users/profile` - Get user profile

### Course Management
- `GET /api/courses` - Get course catalog
- `GET /api/courses/{id}` - Get course details
- `POST /api/courses` - Create new course (instructors)
- `PUT /api/courses/{id}` - Update course (instructors)

### Payment Integration
- `POST /api/payments/checkout-session` - Create Stripe session
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add items to cart

### AI Chat
- `POST /api/aichat` - Send message to AI assistant

For complete API documentation, refer to the [Backend README](../ilmPathServer/README.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the [Backend Documentation](../ilmPathServer/README.md)
- Review Angular documentation at [angular.io](https://angular.io/)

## 🔄 Changelog

### Version 1.0.0
- Initial release with complete e-learning platform
- Angular 19 with Material Design
- Full authentication and authorization
- Course management with video player
- AI chat integration
- Instructor and admin dashboards
- Stripe payment integration
- Responsive design for all devices

---

**Built with ❤️ using Angular 19 and TypeScript**
