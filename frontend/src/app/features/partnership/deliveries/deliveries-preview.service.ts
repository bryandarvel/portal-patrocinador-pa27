import { inject, Injectable } from '@angular/core';
import { LogoDeliveryPreviewService } from '../delivery-detail/logo-delivery-preview.service';

interface DeliveryAreaPreview {
  readonly id: string;
  readonly title: string;
  readonly status: 'Realizada' | 'Em andamento';
  readonly description: string;
  readonly path: string;
}

/** Exemplos do frame 11:658; não representam acompanhamento real pela RBS. */
@Injectable({ providedIn: 'root' })
export class DeliveriesPreviewService {
  readonly featured = inject(LogoDeliveryPreviewService).summary;

  readonly totals = [
    { label: 'Pendentes', value: 1, state: 'pending' },
    { label: 'Em curso', value: 1, state: 'progress' },
    { label: 'Realizadas', value: 1, state: 'done' }
  ] as const;

  readonly areas: readonly DeliveryAreaPreview[] = [
    { id: 'media', title: 'Post carrossel', status: 'Realizada', description: 'Comprovação disponível', path: '/previa/midia-e-conteudo' },
    { id: 'survey', title: 'Pesquisa da ativação', status: 'Em andamento', description: 'Aguardando resultados', path: '/previa/pesquisa-da-ativacao' }
  ];
}
