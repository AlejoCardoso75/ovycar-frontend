import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { SpanishPaginatorIntl } from './config/material-i18n.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimations(),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    {
      provide: MatPaginatorIntl,
      useClass: SpanishPaginatorIntl
    }
  ]
};
