import { computed, inject, Injectable, signal } from '@angular/core';
import { PartnershipPreviewService } from '../../partnership/shared/partnership-preview.service';
import { RbsProfilePreviewService } from '../profile/profile-preview.service';
import { RbsRoxoProfilePreviewService } from '../profile/roxo-profile-preview.service';
import { ClientPreviewService } from '../shared/client-preview.service';

export interface SponsorPreview {
  readonly id: string;
  readonly name: string;
  readonly initial: string;
  readonly quota: string;
  readonly email?: string;
  readonly color: 'yellow' | 'pink' | 'green';
  readonly createdLocally: boolean;
}

export interface SponsorRegistration {
  readonly name: string;
  readonly quota: string;
  readonly email: string;
}

@Injectable({ providedIn: 'root' })
export class SponsorsPreviewService {
  private readonly partnership = inject(PartnershipPreviewService);
  private readonly amarelo = inject(RbsProfilePreviewService).profile;
  private readonly roxo = inject(RbsRoxoProfilePreviewService);
  readonly roxoDocumentPublished = this.roxo.publicationConfirmed;
  private readonly clients = inject(ClientPreviewService);
  readonly verdeDocumentPublished = computed(() => this.clients.published('verde', 'profile'));
  readonly mivReceived = computed(() => this.partnership.currentMiv() !== null);
  private readonly records = signal<readonly SponsorPreview[]>([
    { id: 'amarelo', name: 'Cliente Amarelo', initial: 'A', quota: 'Master', color: 'yellow', createdLocally: false },
    { id: 'roxo', name: 'Cliente Roxo', initial: 'R', quota: 'Subcota G', color: 'pink', createdLocally: false },
    { id: 'verde', name: 'Cliente Verde', initial: 'V', quota: 'Subcota', color: 'green', createdLocally: false }
  ]);
  readonly sponsors = computed(() => this.records().map(sponsor => {
    if (sponsor.id === 'amarelo') return { ...sponsor, ...this.amarelo() };
    if (sponsor.id === 'roxo') return { ...sponsor, ...this.roxo.profile() };
    if (sponsor.id === 'verde') return { ...sponsor, ...this.clients.profile('verde') };
    return sponsor;
  }));

  search(query: string): readonly SponsorPreview[] {
    const terms = this.normalize(query).split(/\s+/).filter(Boolean);
    return this.sponsors().filter(sponsor => {
      const text = this.normalize(`${sponsor.name} ${sponsor.quota}`);
      return terms.every(term => text.includes(term));
    });
  }

  // Recebe apenas dados de apresentação: senha nunca entra neste serviço.
  register(registration: SponsorRegistration): SponsorPreview | null {
    const name = registration.name.trim();
    const quota = registration.quota.trim();
    const email = registration.email.trim();
    if (!name || !quota || !email) return null;
    const sponsor: SponsorPreview = {
      id: `local-${this.sponsors().length + 1}`, name, initial: name.charAt(0).toLocaleUpperCase('pt-BR'), quota, email,
      color: 'green', createdLocally: true
    };
    this.records.update(records => [...records, sponsor]);
    return sponsor;
  }

  private normalize(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  }
}
