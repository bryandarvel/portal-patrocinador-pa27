import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  CanActivateFn,
  Router,
} from '@angular/router';
import { AuthService } from './session.service';
import { PortalContext } from './portal-context.service';

export const sessionGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService),
    router = inject(Router);
  const user = await auth.restore();
  if (!user) return router.createUrlTree(['/login'], { queryParams: { retorno: state.url } });
  return !route.data['admin'] || user.role === 'ADMIN_RBS' ? true : router.parseUrl('/sem-acesso');
};

export const partnershipGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService),
    context = inject(PortalContext),
    router = inject(Router);
  const user = await auth.restore();
  if (!user) return router.createUrlTree(['/login'], { queryParams: { retorno: state.url } });
  if (route.data['admin'] && user.role !== 'ADMIN_RBS') return router.parseUrl('/sem-acesso');
  const id = route.paramMap.get('parceriaId');
  if (!id || !/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id)) return router.parseUrl('/sem-acesso');
  try {
    if (context.id() !== id) context.clear();
    await context.load(id);
    if (route.data['area'] && !context.enabled(route.data['area']))
      return router.parseUrl('/sem-acesso');
    return true;
  } catch (error) {
    if (error instanceof HttpErrorResponse && [403, 404].includes(error.status))
      return router.parseUrl('/sem-acesso');
    if (error instanceof HttpErrorResponse && error.status === 401)
      return router.createUrlTree(['/login'], {
        queryParams: { retorno: state.url, sessao: 'expirada' },
      });
    return router.createUrlTree(['/sem-acesso'], { queryParams: { retorno: state.url } });
  }
};

export const homeGuard: CanActivateFn = async () => {
  const auth = inject(AuthService),
    router = inject(Router);
  await auth.restore();
  return router.parseUrl(auth.session.user() ? auth.home() : '/login');
};

@Injectable()
export class PartnershipRouteReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    current: ActivatedRouteSnapshot,
  ): boolean {
    return (
      super.shouldReuseRoute(future, current) &&
      future.paramMap.get('parceriaId') === current.paramMap.get('parceriaId') &&
      future.paramMap.get('entregaId') === current.paramMap.get('entregaId')
    );
  }
}
