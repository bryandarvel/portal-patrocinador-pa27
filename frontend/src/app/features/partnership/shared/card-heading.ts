import { Component, ElementRef, input, viewChild } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

export type CardTone = 'blue' | 'pink' | 'green' | 'yellow';

/** Cabeçalho de cartão de seção: quadrado de ícone, título e descrição opcional. */
@Component({
  selector: 'app-card-heading',
  imports: [NzIconModule],
  template: `
    <span class="tile" [class]="'tile tone-' + tone()" aria-hidden="true"
      ><nz-icon [nzType]="icon()"
    /></span>
    <div class="copy">
      <h2 #title [id]="headingId() || null" [attr.tabindex]="focusable() ? -1 : null">
        {{ heading() }}
      </h2>
      @if (description()) {
        <p>{{ description() }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      width: 100%;
      min-width: 0;
    }
    .tile {
      flex: 0 0 56px;
      height: 56px;
      display: grid;
      place-items: center;
      border-radius: var(--radius-control);
      font-size: 28px;
    }
    .tone-blue {
      background: var(--tone-blue-soft);
      color: var(--tone-blue);
    }
    .tone-pink {
      background: var(--tone-pink-soft);
      color: var(--tone-pink);
    }
    .tone-green {
      background: var(--tone-green-soft);
      color: var(--tone-green);
    }
    .tone-yellow {
      background: var(--tone-yellow-soft);
      color: var(--tone-yellow);
    }
    .copy {
      min-width: 0;
      padding-top: 4px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    h2 {
      margin: 0;
      font-family: var(--font-display);
      font-size: 32px;
      line-height: 36px;
      font-weight: 700;
      color: var(--color-text);
      overflow-wrap: anywhere;
    }
    p {
      margin: 0;
      color: var(--color-muted);
      font-size: 15px;
      line-height: 22px;
    }
    @media (max-width: 760px) {
      :host {
        gap: 14px;
      }
      .tile {
        flex-basis: 44px;
        height: 44px;
        font-size: 22px;
      }
      h2 {
        font-size: 26px;
        line-height: 30px;
      }
    }
  `,
})
export class CardHeading {
  readonly icon = input.required<string>();
  readonly heading = input.required<string>();
  readonly headingId = input('');
  readonly tone = input<CardTone>('blue');
  readonly description = input('');
  /** Permite devolver o foco ao título depois de um diálogo. */
  readonly focusable = input(false);
  private readonly title = viewChild.required<ElementRef<HTMLElement>>('title');
  focus(): void {
    this.title().nativeElement.focus();
  }
}
