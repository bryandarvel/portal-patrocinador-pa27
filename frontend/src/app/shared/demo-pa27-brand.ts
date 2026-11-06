import { Component, input } from '@angular/core';
import demo from './demo-pa27-brands.json';

export function demoBrand(id: string, name: string, edition: string) {
  if (edition !== demo.edition) return undefined;
  const brand =
    demo.brands.find((item) => item.localPartnershipId === id) ??
    demo.brands.find((item) => name === `${item.name} (demo)`);
  if (!brand) return undefined;
  return { ...brand, displayName: name === `${brand.name} (demo)` ? brand.name : name };
}

@Component({
  selector: 'app-demo-pa27-brand',
  template: `
    @for (logo of logos(); track logo) {
      <img
        [src]="'/images/demo-pa27/' + logo + '.png'"
        [attr.data-logo]="logo"
        alt=""
        width="56"
        height="56"
      />
    }
  `,
  host: {
    'aria-hidden': 'true',
    '[class.monster]': "logos()[0] === 'monster'",
    '[class.banrisul]': "logos()[0] === 'banrisul'",
    '[class.combined]': 'logos().length > 1',
  },
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 64px;
      height: 56px;
      padding: 6px;
      border-radius: var(--radius-control);
      background: var(--color-surface);
      overflow: hidden;
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    /* Compensa as margens transparentes presentes nos PNGs fornecidos. */
    img[data-logo='absolut-sprite'] {
      transform: scale(1.85);
    }
    img[data-logo='aperol'] {
      transform: scale(1.5);
    }
    img[data-logo='mastercard'],
    img[data-logo='monster'] {
      transform: scale(1.3);
    }
    :host(.monster) {
      background: #000;
    }
    :host(.banrisul) {
      width: 56px;
      padding: 0;
    }
    :host(.combined) {
      width: 76px;
      gap: 4px;
    }
    :host(.combined) img {
      width: calc((100% - 4px) / 2);
    }
  `,
})
export class DemoPa27Brand {
  readonly logos = input.required<readonly string[]>();
}
