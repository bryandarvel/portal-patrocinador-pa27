import { Routes } from '@angular/router';
import { clientPreviewRoutes } from './features/admin/client-areas/client-preview.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    title: 'Entrar | Portal do Patrocinador',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'previa/perfil',
    title: 'Prévia — Perfil do cliente | Portal do Patrocinador',
    loadComponent: () => import('./features/partnership/profile/profile').then(m => m.PartnershipProfile)
  },
  {
    path: 'previa/aplicacoes-de-marca',
    title: 'Prévia — Aplicações de marca | Portal do Patrocinador',
    loadComponent: () => import('./features/partnership/brand/brand').then(m => m.BrandApplications)
  },
  {
    path: 'previa/midia-e-conteudo',
    title: 'Prévia — Mídia e conteúdo | Portal do Patrocinador',
    loadComponent: () => import('./features/partnership/media/media').then(m => m.PartnershipMedia)
  },
  {
    path: 'previa/cortesias',
    title: 'Prévia — Cortesias | Portal do Patrocinador',
    loadComponent: () => import('./features/partnership/tickets/tickets').then(m => m.PartnershipTickets)
  },
  {
    path: 'previa/credenciamento',
    title: 'Prévia — Credenciamento | Portal do Patrocinador',
    loadComponent: () => import('./features/partnership/staff/staff').then(m => m.PartnershipStaff)
  },
  {
    path: 'previa/pesquisa-da-ativacao',
    title: 'Prévia — Pesquisa da ativação | Portal do Patrocinador',
    loadComponent: () => import('./features/partnership/survey/survey').then(m => m.PartnershipSurvey)
  },
  {
    path: 'previa/entregas/logo-no-telao',
    title: 'Prévia — Logo no telão | Portal do Patrocinador',
    loadComponent: () => import('./features/partnership/delivery-detail/delivery-detail').then(m => m.DeliveryDetail)
  },
  {
    path: 'previa/entregas',
    title: 'Prévia — Entregas da parceria | Portal do Patrocinador',
    loadComponent: () => import('./features/partnership/deliveries/deliveries').then(m => m.PartnershipDeliveries)
  },
  {
    path: 'previa/rbs/amarelo/entregas/logo-no-telao',
    title: 'Prévia — Logo no telão RBS | Portal do Patrocinador',
    loadComponent: () => import('./features/admin/delivery-detail/delivery-detail').then(m => m.RbsLogoDelivery)
  },
  {
    path: 'previa/rbs/amarelo/entregas',
    title: 'Prévia — Entregas RBS | Portal do Patrocinador',
    loadComponent: () => import('./features/admin/deliveries/deliveries').then(m => m.RbsDeliveries)
  },
  {
    path: 'previa/rbs/amarelo/contrato',
    title: 'Prévia — Contrato RBS | Portal do Patrocinador',
    loadComponent: () => import('./features/admin/contract/contract').then(m => m.RbsContract)
  },
  {
    path: 'previa/rbs/amarelo/pesquisa-da-ativacao',
    title: 'Prévia — Pesquisa da ativação RBS | Portal do Patrocinador',
    loadComponent: () => import('./features/admin/survey/survey').then(m => m.RbsSurvey)
  },
  {
    path: 'previa/rbs/amarelo/credenciamento',
    title: 'Prévia — Credenciamento RBS | Portal do Patrocinador',
    loadComponent: () => import('./features/admin/staff/staff').then(m => m.RbsStaff)
  },
  {
    path: 'previa/rbs/amarelo/cortesias',
    title: 'Prévia — Cortesias RBS | Portal do Patrocinador',
    loadComponent: () => import('./features/admin/tickets/tickets').then(m => m.RbsTickets)
  },
  {
    path: 'previa/rbs/amarelo/midia-e-conteudo',
    title: 'Prévia — Mídia e conteúdo RBS | Portal do Patrocinador',
    loadComponent: () => import('./features/admin/media/media').then(m => m.RbsMedia)
  },
  {
    path: 'previa/rbs/amarelo/aplicacoes-de-marca',
    title: 'Prévia — Aplicações de marca RBS | Portal do Patrocinador',
    loadComponent: () => import('./features/admin/brand/brand').then(m => m.RbsBrandApplications)
  },
  {
    path: 'previa/rbs/amarelo/perfil',
    title: 'Prévia — Perfil do cliente RBS | Portal do Patrocinador',
    loadComponent: () => import('./features/admin/profile/profile').then(m => m.RbsProfile)
  },
  {
    path: 'previa/rbs/patrocinadores',
    title: 'Prévia — Patrocinadores RBS | Portal do Patrocinador',
    loadComponent: () => import('./features/admin/sponsors/sponsors').then(m => m.RbsSponsors)
  },
  ...clientPreviewRoutes('roxo'),
  ...clientPreviewRoutes('verde'),
  {
    path: 'previa/rbs/amarelo/duvidas-frequentes',
    title: 'Prévia — Dúvidas frequentes RBS | Portal do Patrocinador',
    loadComponent: () => import('./features/admin/faq/faq').then(m => m.RbsFaq)
  },
  {
    path: 'previa/rbs/amarelo/relatorio-da-parceria',
    title: 'Prévia — Relatório da parceria RBS | Portal do Patrocinador',
    loadComponent: () => import('./features/admin/report/report').then(m => m.RbsReport)
  },
  {
    path: 'previa/duvidas-frequentes',
    title: 'Prévia — Dúvidas frequentes | Portal do Patrocinador',
    loadComponent: () => import('./features/partnership/faq/faq').then(m => m.PartnershipFaq)
  },
  {
    path: 'previa/contrato',
    title: 'Prévia — Contrato | Portal do Patrocinador',
    loadComponent: () => import('./features/partnership/contract/contract').then(m => m.PartnershipContract)
  }
];
