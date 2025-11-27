import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AuthGuardGuard } from './guards/auth-guard-guard';
import { AuthorizationGuard } from './guards/authorizationGuard';
import { UsersService } from './core/services/users';
import { TeacherService } from './core/services/teacher-service';
import { ScheduleService } from './core/services/schedule-service';
import { ClassroomService } from './core/services/classroom-service';
import { PeriodService } from './core/services/period-service';
import { AssigenedSubjectService } from './core/services/Assignedsubject-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    AuthGuardGuard,
    AuthorizationGuard,
    UsersService,
    TeacherService,
    ScheduleService,
    ClassroomService,
    PeriodService,
    AssigenedSubjectService
  ]
};
