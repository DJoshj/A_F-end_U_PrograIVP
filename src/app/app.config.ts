import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AuthGuardGuard } from './guards/auth-guard-guard';
import { AuthorizationGuard } from './guards/authorizationGuard';
import { UsersService } from './core/services/users'; // Import UsersService

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    AuthGuardGuard,
    AuthorizationGuard,
    UsersService // Add UsersService to providers
  ]
};
