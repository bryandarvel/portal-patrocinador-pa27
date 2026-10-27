import { inject, Injectable, signal } from '@angular/core';
import { PartnershipPreviewService } from '../../partnership/shared/partnership-preview.service';

export interface RbsProfileData {
  readonly name: string;
  readonly quota: string;
  readonly email: string;
}

/** Estado local da prévia RBS; não altera contas, permissões ou documentos reais. */
@Injectable({ providedIn: 'root' })
export class RbsProfilePreviewService {
  private readonly original = inject(PartnershipPreviewService).partnership;
  private readonly data = signal<RbsProfileData>({
    name: this.original.sponsorName, quota: this.original.quota, email: this.original.email
  });
  readonly profile = this.data.asReadonly();
  readonly documents = this.original.documents;
  private readonly publication = signal(false);
  readonly publicationConfirmed = this.publication.asReadonly();

  save(value: RbsProfileData): void {
    this.data.set({ name: value.name.trim(), quota: value.quota.trim(), email: value.email.trim() });
  }

  saveEmail(email: string): void {
    this.data.update(profile => ({ ...profile, email: email.trim() }));
  }

  publishExample(): void {
    this.publication.set(true);
  }
}
