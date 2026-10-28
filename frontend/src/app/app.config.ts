import { registerLocaleData } from '@angular/common';
import pt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/session.service';
import { PartnershipRouteReuseStrategy } from './core/portal-guards';
import { provideNzI18n, pt_BR } from 'ng-zorro-antd/i18n';
import { routes } from './app.routes';

registerLocaleData(pt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: RouteReuseStrategy, useClass: PartnershipRouteReuseStrategy },
    provideNzI18n(pt_BR),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
