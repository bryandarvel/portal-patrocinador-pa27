import { Component, computed, ElementRef, inject, model, signal, viewChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import {
  DeliveryOwnerId,
  LogoDeliveryPreviewService,
} from '../../partnership/delivery-detail/logo-delivery-preview.service';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';

@Component({
  selector: 'app-delivery-organizer',
  imports: [NzButtonModule, NzModalModule],
  templateUrl: './delivery-organizer.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/shared/material-ui.css',
    './delivery-organizer.css',
  ],
})
export class DeliveryOrganizer {
  readonly open = model(false);
  readonly logo = inject(LogoDeliveryPreviewService);
  readonly stage = signal<'organize' | 'confirm-owner' | 'saved'>('organize');
  readonly selectedOwner = signal<DeliveryOwnerId>('ana');
  readonly selectedOwnerLabel = computed(
    () => this.logo.ownerOptions.find((owner) => owner.id === this.selectedOwner())?.label ?? '',
  );
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');

  afterOpen(modal: NzModalComponent): void {
    this.selectedOwner.set(this.logo.ownerId());
    this.stage.set('organize');
    labelPartnershipDialog(modal, 'rbs-organizer-dialog-title');
  }

  chooseOwner(id: DeliveryOwnerId): void {
    this.selectedOwner.set(id);
    this.stage.set('confirm-owner');
    this.focusTitle();
  }

  saveOwner(): void {
    if (!this.open() || this.stage() === 'saved' || !this.logo.setOwner(this.selectedOwner()))
      return;
    this.stage.set('saved');
    this.focusTitle();
  }

  close(): void {
    this.open.set(false);
  }

  private focusTitle(): void {
    requestAnimationFrame(() => {
      if (this.open()) this.heading()?.nativeElement.focus();
    });
  }
}
