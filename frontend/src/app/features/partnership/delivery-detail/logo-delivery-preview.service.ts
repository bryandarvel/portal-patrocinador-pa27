import { computed, Injectable, signal } from '@angular/core';
import { MaterialSelection, MaterialVersion } from '../shared/partnership-preview.service';

/** Estado local da entrega Logo no telão. Não transmite arquivos à RBS. */
@Injectable({ providedIn: 'root' })
export class LogoDeliveryPreviewService {
  private readonly versionsState = signal<readonly MaterialVersion[]>([]);
  readonly versions = this.versionsState.asReadonly();
  readonly current = computed(() => this.versions()[0] ?? null);
  readonly summary = computed(() => ({
    context: 'Aplicações de marca / Entrega 01',
    title: 'Logo no telão',
    owner: 'Ana Costa · Produção RBS',
    material: this.current() ? 'Recebido' : 'Aguardando envio',
    execution: 'Programada',
    nextStep: this.current() ? 'RBS · Confira o material recebido.' : 'Patrocinador · Envie a logo para esta entrega.'
  }));

  recordUpload(selection: MaterialSelection): boolean {
    // No protótipo, substituir exige uma solicitação de correção da RBS.
    if (this.current() || !selection.name.trim() || !Number.isFinite(selection.size) || selection.size <= 0) return false;
    this.versionsState.set([{
      name: selection.name, size: selection.size, version: 1, receivedAt: new Date()
    }]);
    return true;
  }
}
