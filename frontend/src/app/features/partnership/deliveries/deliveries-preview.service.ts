import { computed, inject, Injectable } from '@angular/core';
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
  private readonly logo = inject(LogoDeliveryPreviewService);
  readonly featured = this.logo.summary;

  // Apenas os três exemplos selecionados no protótipo, sem matriz de direitos.
  readonly totals = computed(() => {
    const executing = this.logo.stage() === 'executing';
    const realized = this.logo.stage() === 'realized' || this.logo.stage() === 'proof';
    return [
      { label: 'Pendentes', value: executing || realized ? 0 : 1, state: 'pending' },
      { label: 'Em curso', value: executing ? 2 : 1, state: 'progress' },
      { label: 'Realizadas', value: realized ? 2 : 1, state: 'done' }
    ] as const;
  });

  readonly areas: readonly DeliveryAreaPreview[] = [
    { id: 'media', title: 'Post carrossel', status: 'Realizada', description: 'Comprovação disponível', path: '/previa/midia-e-conteudo' },
    { id: 'survey', title: 'Pesquisa da ativação', status: 'Em andamento', description: 'Aguardando resultados', path: '/previa/pesquisa-da-ativacao' }
  ];
}
