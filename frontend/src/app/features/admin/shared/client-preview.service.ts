import { computed, Injectable, signal } from '@angular/core';
import type { RbsProfileData } from '../profile/profile-preview.service';

export type PreviewClientId = 'roxo' | 'verde';
export type AdminSponsorId = 'amarelo' | PreviewClientId;
export type ClientMaterialArea = 'profile' | 'brand' | 'media' | 'research' | 'report';
export interface ClientStaff {
  readonly quantity: number;
  readonly sector: string;
}
interface ClientState {
  readonly profile: RbsProfileData;
  readonly published: Readonly<Record<ClientMaterialArea, boolean>>;
  readonly staff: ClientStaff | null;
}

export const CLIENT_NAMES = { roxo: 'Roxo', verde: 'Verde' } as const;
export function previewClientId(value: unknown): PreviewClientId {
  return value === 'verde' ? 'verde' : 'roxo';
}

function initialClient(id: PreviewClientId): ClientState {
  return {
    profile: {
      name: `Cliente ${CLIENT_NAMES[id]}`,
      quota: id === 'roxo' ? 'Subcota G' : 'Subcota',
      email: `${id}@example.com`,
    },
    published: { profile: false, brand: false, media: false, research: false, report: false },
    staff: null,
  };
}

/** Exemplos do Figma separados por parceria. Não representa autorização ou persistência. */
@Injectable({ providedIn: 'root' })
export class ClientPreviewService {
  private readonly state = signal<Readonly<Record<PreviewClientId, ClientState>>>({
    roxo: initialClient('roxo'),
    verde: initialClient('verde'),
  });

  profile(id: PreviewClientId): RbsProfileData {
    return this.state()[id].profile;
  }
  published(id: PreviewClientId, area: ClientMaterialArea): boolean {
    return this.state()[id].published[area];
  }
  staff(id: PreviewClientId): ClientStaff | null {
    return this.state()[id].staff;
  }

  saveProfile(id: PreviewClientId, input: RbsProfileData): boolean {
    const profile = {
      name: input.name.trim(),
      quota: input.quota.trim(),
      email: input.email.trim(),
    };
    if (!profile.name || !profile.quota || !profile.email) return false;
    this.update(id, { profile });
    return true;
  }

  publish(id: PreviewClientId, area: ClientMaterialArea): void {
    this.update(id, { published: { ...this.state()[id].published, [area]: true } });
  }

  saveStaff(id: PreviewClientId, input: ClientStaff): boolean {
    const sector = input.sector.trim();
    if (!Number.isSafeInteger(input.quantity) || input.quantity < 0 || !sector) return false;
    this.update(id, { staff: { quantity: input.quantity, sector } });
    return true;
  }

  profilePreview(id: PreviewClientId) {
    return {
      profile: computed(() => this.profile(id)),
      exampleName: `${id}_profile.pdf`,
      publicationConfirmed: computed(() => this.published(id, 'profile')),
      save: (value: RbsProfileData) => this.saveProfile(id, value),
      publishExample: () => this.publish(id, 'profile'),
    };
  }

  private update(id: PreviewClientId, value: Partial<ClientState>): void {
    this.state.update((state) => ({ ...state, [id]: { ...state[id], ...value } }));
  }
}
