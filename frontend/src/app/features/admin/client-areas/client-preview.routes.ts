import type { Routes } from '@angular/router';
import { FaqPreviewService } from '../../partnership/faq/faq-preview.service';
import {
  EMPTY_TICKETS_PREVIEW,
  TicketsPreviewService,
} from '../../partnership/tickets/tickets-preview.service';
import {
  SOURCE_SHEETS_CLIENT,
  SourceSheetsPreviewService,
} from '../report/source-sheets-preview.service';
import type { PreviewClientId } from '../shared/client-preview.service';

/** Os dois conjuntos do Figma usam os mesmos componentes com estado por parceria. */
export function clientPreviewRoutes(sponsorId: PreviewClientId): Routes {
  const base = `previa/rbs/${sponsorId}/`;
  return [
    {
      path: base + 'perfil',
      data: { sponsorId },
      loadComponent: () => import('../profile/roxo-profile').then((m) => m.RbsRoxoProfile),
    },
    ...(
      [
        ['aplicacoes-de-marca', 'brand'],
        ['midia-e-conteudo', 'media'],
        ['pesquisa-da-ativacao', 'research'],
      ] as const
    ).map(([path, area]) => ({
      path: base + path,
      data: { sponsorId, area },
      loadComponent: () => import('./client-material').then((m) => m.ClientMaterial),
    })),
    {
      path: base + 'cortesias',
      data: { sponsorId },
      providers: [TicketsPreviewService, { provide: EMPTY_TICKETS_PREVIEW, useValue: true }],
      loadComponent: () => import('../tickets/tickets').then((m) => m.RbsTickets),
    },
    {
      path: base + 'credenciamento',
      data: { sponsorId },
      loadComponent: () => import('./client-staff').then((m) => m.ClientStaff),
    },
    ...(['contrato', 'entregas'] as const).map((path) => ({
      path: base + path,
      data: { sponsorId, area: path === 'contrato' ? 'contract' : 'deliveries' },
      loadComponent: () => import('./client-status').then((m) => m.ClientStatus),
    })),
    {
      path: base + 'duvidas-frequentes',
      data: { sponsorId },
      providers: [FaqPreviewService],
      loadComponent: () => import('../faq/faq').then((m) => m.RbsFaq),
    },
    {
      path: base + 'relatorio-da-parceria',
      data: { sponsorId },
      providers: [
        SourceSheetsPreviewService,
        { provide: SOURCE_SHEETS_CLIENT, useValue: sponsorId },
      ],
      loadComponent: () => import('../report/report').then((m) => m.RbsReport),
    },
  ].map((route) => ({
    ...route,
    title: `Prévia — RBS ${sponsorId === 'roxo' ? 'Roxo' : 'Verde'} | Portal do Patrocinador`,
  }));
}
