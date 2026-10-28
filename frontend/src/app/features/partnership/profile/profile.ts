import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';
import { PartnershipPreviewService } from '../shared/partnership-preview.service';
import { PartnershipShell } from '../shared/partnership-shell';

@Component({
  selector: 'app-partnership-profile',
  imports: [PartnershipShell, NzButtonModule, NzInputModule],
  templateUrl: './profile.html',
  styleUrls: ['../shared/partnership-ui.css', './profile.css'],
})
export class PartnershipProfile {
  readonly partnership = inject(PartnershipPreviewService).profile;
  readonly ctx = inject(PortalContext);
  readonly api = inject(PortalApi);
  async download(id: string, name: string): Promise<void> {
    try {
      await this.api.download(this.ctx.url(`/arquivos/${id}`), name);
    } catch {}
  }
}
