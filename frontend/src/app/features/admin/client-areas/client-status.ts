import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { CLIENT_NAMES, previewClientId } from '../shared/client-preview.service';

@Component({
  selector: 'app-client-status',
  imports: [AdminPartnershipShell, RouterLink, NzButtonModule],
  templateUrl: './client-status.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/profile/profile.css',
    './client-areas.css',
  ],
})
export class ClientStatus {
  private readonly route = inject(ActivatedRoute);
  readonly sponsorId = previewClientId(this.route.snapshot.data['sponsorId']);
  readonly isContract = this.route.snapshot.data['area'] === 'contract';
  readonly title = this.isContract ? 'Contrato' : 'Entregas da parceria';
  readonly description = `Cliente ${CLIENT_NAMES[this.sponsorId]} · ${this.isContract ? 'Informações e materiais desta parceria.' : 'Acompanhamento das entregas previstas.'}`;
}
