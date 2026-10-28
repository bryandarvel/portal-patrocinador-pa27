import { Component, inject, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { CommercialDocumentPreview, PartnershipPreviewService } from '../shared/partnership-preview.service';
import { PartnershipShell } from '../shared/partnership-shell';
import { labelPartnershipDialog } from '../shared/modal-accessibility';

@Component({
  selector: 'app-partnership-profile',
  imports: [PartnershipShell, NzButtonModule, NzInputModule, NzModalModule],
  templateUrl: './profile.html',
  styleUrls: ['../shared/partnership-ui.css', './profile.css']
})
export class PartnershipProfile {
  readonly partnership = inject(PartnershipPreviewService).partnership;
  readonly documentOpen = signal(false);
  readonly selectedDocument = signal<CommercialDocumentPreview | null>(null);

  openDocument(document: CommercialDocumentPreview): void {
    this.selectedDocument.set(document);
    this.documentOpen.set(true);
  }
  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'profile-dialog-title');
  }
}
