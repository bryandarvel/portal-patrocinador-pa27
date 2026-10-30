import { Component, input, viewChild } from '@angular/core';
import { PartnershipShell } from '../../partnership/shared/partnership-shell';
import { registerPortalIcons } from '../../../shared/portal-icons';

@Component({
  selector: 'app-admin-partnership-shell',
  imports: [PartnershipShell],
  templateUrl: './admin-partnership-shell.html',
})
export class AdminPartnershipShell {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly logoSrc = input('/images/pa27-logo.png');
  readonly sponsorId = input<string>('');
  readonly activeArea = input<string>('01');
  readonly shell = viewChild(PartnershipShell);
  constructor() {
    registerPortalIcons();
  }
  openReport(): void {
    this.shell()?.openReport();
  }
}
