import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import {
  CLIENT_NAMES,
  ClientPreviewService,
  previewClientId,
} from '../shared/client-preview.service';

const AREAS = {
  brand: {
    title: 'Aplicações de marca',
    number: '02',
    empty: 'Os materiais da marca ainda não foram recebidos.',
  },
  media: {
    title: 'Mídia e conteúdo',
    number: '03',
    empty: 'Nenhum material ou link foi disponibilizado.',
  },
  research: {
    title: 'Pesquisa da ativação',
    number: '06',
    empty: 'Os resultados desta parceria ainda não foram disponibilizados.',
  },
} as const;
type MaterialArea = keyof typeof AREAS;

@Component({
  selector: 'app-client-material',
  imports: [AdminPartnershipShell, NzButtonModule, NzModalModule],
  templateUrl: './client-material.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/profile/profile.css',
    '../../partnership/shared/material-ui.css',
    './client-areas.css',
  ],
})
export class ClientMaterial {
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  readonly sponsorId = previewClientId(this.route.snapshot.data['sponsorId']);
  readonly clientName = CLIENT_NAMES[this.sponsorId];
  readonly area: MaterialArea = this.route.snapshot.data['area'];
  readonly config = AREAS[this.area];
  readonly preview = inject(ClientPreviewService);
  readonly profile = computed(() => this.preview.profile(this.sponsorId));
  readonly published = computed(() => this.preview.published(this.sponsorId, this.area));
  readonly exampleName = `${this.sponsorId}_${this.area}.pdf`;
  readonly dialog = signal<'publish' | 'saved' | 'view' | null>(null);
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('heading');
  readonly title = computed(() =>
    this.dialog() === 'publish'
      ? 'Disponibilizar material'
      : this.dialog() === 'view'
        ? `Documento de ${this.clientName}`
        : 'Informações salvas',
  );

  publish(): void {
    if (this.dialog() !== 'publish') return;
    this.preview.publish(this.sponsorId, this.area);
    this.dialog.set('saved');
    afterNextRender(
      { write: () => this.heading()?.nativeElement.focus() },
      { injector: this.injector },
    );
  }
  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'client-material-title');
  }
}
