import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';

/**
 * Global application providers for this standalone Angular app.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimations(),
    provideRouter(routes),

    // HttpClient configured to use the Fetch backend.
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

    // Note: UI notifications are handled via Angular Material `MatSnackBar` in components.
  ]
};
