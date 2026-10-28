import { inject, Injectable } from '@angular/core';
import type { RbsProfileData } from './profile-preview.service';
import { ClientPreviewService } from '../shared/client-preview.service';

/** Estado próprio do perfil Roxo, sem contas, permissões ou arquivos reais. */
@Injectable({ providedIn: 'root' })
export class RbsRoxoProfilePreviewService {
  private readonly preview = inject(ClientPreviewService).profilePreview('roxo');
  readonly profile = this.preview.profile;
  readonly exampleName = this.preview.exampleName;
  readonly publicationConfirmed = this.preview.publicationConfirmed;

  save(value: RbsProfileData): boolean {
    return this.preview.save(value);
  }

  publishExample(): void {
    this.preview.publishExample();
  }
}
