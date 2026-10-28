import { Route, Routes } from '@angular/router';
import { homeGuard, partnershipGuard, sessionGuard } from './core/portal-guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [homeGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'login',
    title: 'Entrar | Portal do Patrocinador',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'verificar',
    title: 'Ativar conta | Portal do Patrocinador',
    loadComponent: () => import('./features/auth/account/account').then((m) => m.VerifyAccount),
  },
  {
    path: 'conta',
    title: 'Minha conta | Portal do Patrocinador',
    canActivate: [sessionGuard],
    loadComponent: () => import('./features/auth/account/account').then((m) => m.Account),
  },
  {
    path: 'sem-acesso',
    title: 'Acesso indisponível',
    loadComponent: () => import('./features/auth/account/account').then((m) => m.AccessUnavailable),
  },
  {
    path: 'parcerias',
    title: 'Suas parcerias',
    canActivate: [sessionGuard],
    loadComponent: () => import('./features/admin/sponsors/sponsors').then((m) => m.RbsSponsors),
  },
  {
    path: 'rbs/patrocinadores',
    title: 'Patrocinadores RBS',
    data: { admin: true },
    canActivate: [sessionGuard],
    loadComponent: () => import('./features/admin/sponsors/sponsors').then((m) => m.RbsSponsors),
  },
  ...partnershipRoutes(false),
  ...partnershipRoutes(true),
  {
    path: '**',
    canActivate: [homeGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
];

function partnershipRoutes(admin: boolean): Routes {
  const base = admin ? 'rbs/parcerias/:parceriaId/' : 'parcerias/:parceriaId/';
  const pages: Routes = [
    {
      path: 'perfil',
      data: { area: 'perfil' },
      loadComponent: admin
        ? () => import('./features/admin/profile/profile').then((m) => m.RbsProfile)
        : () => import('./features/partnership/profile/profile').then((m) => m.PartnershipProfile),
    },
    {
      path: 'aplicacoes-de-marca',
      data: { area: 'marca' },
      loadComponent: admin
        ? () => import('./features/admin/brand/brand').then((m) => m.RbsBrandApplications)
        : () => import('./features/partnership/brand/brand').then((m) => m.BrandApplications),
    },
    {
      path: 'midia-e-conteudo',
      data: { area: 'midia' },
      loadComponent: admin
        ? () => import('./features/admin/media/media').then((m) => m.RbsMedia)
        : () => import('./features/partnership/media/media').then((m) => m.PartnershipMedia),
    },
    {
      path: 'cortesias',
      data: { area: 'cortesias' },
      loadComponent: admin
        ? () => import('./features/admin/tickets/tickets').then((m) => m.RbsTickets)
        : () => import('./features/partnership/tickets/tickets').then((m) => m.PartnershipTickets),
    },
    {
      path: 'credenciamento',
      data: { area: 'credenciamento' },
      loadComponent: admin
        ? () => import('./features/admin/staff/staff').then((m) => m.RbsStaff)
        : () => import('./features/partnership/staff/staff').then((m) => m.PartnershipStaff),
    },
    {
      path: 'pesquisa-da-ativacao',
      data: { area: 'pesquisa' },
      loadComponent: admin
        ? () => import('./features/admin/survey/survey').then((m) => m.RbsSurvey)
        : () => import('./features/partnership/survey/survey').then((m) => m.PartnershipSurvey),
    },
    {
      path: 'contrato',
      data: { area: 'contrato' },
      loadComponent: admin
        ? () => import('./features/admin/contract/contract').then((m) => m.RbsContract)
        : () =>
            import('./features/partnership/contract/contract').then((m) => m.PartnershipContract),
    },
    {
      path: 'entregas',
      loadComponent: admin
        ? () => import('./features/admin/deliveries/deliveries').then((m) => m.RbsDeliveries)
        : () =>
            import('./features/partnership/deliveries/deliveries').then(
              (m) => m.PartnershipDeliveries,
            ),
    },
    {
      path: 'entregas/:entregaId',
      loadComponent: admin
        ? () =>
            import('./features/admin/delivery-detail/delivery-detail').then(
              (m) => m.RbsLogoDelivery,
            )
        : () =>
            import('./features/partnership/delivery-detail/delivery-detail').then(
              (m) => m.DeliveryDetail,
            ),
    },
    {
      path: 'duvidas-frequentes',
      loadComponent: admin
        ? () => import('./features/admin/faq/faq').then((m) => m.RbsFaq)
        : () => import('./features/partnership/faq/faq').then((m) => m.PartnershipFaq),
    },
    ...(admin
      ? [
          {
            path: 'relatorio-da-parceria',
            loadComponent: () => import('./features/admin/report/report').then((m) => m.RbsReport),
          },
        ]
      : []),
  ];
  return pages.map((route): Route => ({
    ...route,
    path: base + route.path,
    data: { ...route.data, admin },
    canActivate: [partnershipGuard],
    runGuardsAndResolvers: 'always',
    title: 'Parceria | Portal do Patrocinador',
  }));
}
