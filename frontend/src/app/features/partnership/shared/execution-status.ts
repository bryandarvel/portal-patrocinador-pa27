import { Component, input } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { reportExecutionLabel } from './report-format';

@Component({
  selector: 'app-execution-status',
  imports: [NzIconModule],
  template: `<span class="execution-status" [class.done]="state() === 'REALIZADA'">
    <nz-icon
      [nzType]="state() === 'REALIZADA' ? 'check-circle' : 'clock-circle'"
      aria-hidden="true"
    />
    {{ label(state()) }}
  </span>`,
  styles: `
    .execution-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 999px;
      color: var(--tone-yellow);
      background: var(--tone-yellow-soft);
      font: 500 13px/20px var(--font-body);
    }
    .done {
      color: var(--color-success);
      background: var(--color-success-soft);
    }
    nz-icon {
      font-size: 16px;
    }
  `,
})
export class ExecutionStatus {
  readonly state = input.required<string>();
  readonly label = reportExecutionLabel;
}
