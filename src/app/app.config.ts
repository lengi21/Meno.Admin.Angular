import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { adminSessionInterceptor } from './core/http/admin-session.interceptor';
import { provideTranslateService } from '@ngx-translate/core';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes), provideHttpClient(withInterceptors([adminSessionInterceptor])), provideTranslateService({ fallbackLang: 'ka', lang: 'ka' })]
};

