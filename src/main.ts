import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
}).catch(err => console.error(err));
