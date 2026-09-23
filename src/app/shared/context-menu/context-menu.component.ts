import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface ContextMenuAction {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly danger?: boolean;
}

/** Reusable viewport-level action menu for compact list and card actions. */
@Component({
  selector: 'app-context-menu',
  imports: [MatIconModule],
  template: `@if (open) {
    <div class="backdrop" (click)="closed.emit()">
      <section class="menu" role="menu" [style.left.px]="left" [style.top.px]="top" (click)="$event.stopPropagation()">
        @for (action of actions; track action.id) {
          <button type="button" role="menuitem" [class.danger]="action.danger" (click)="select(action.id)">
            <mat-icon>{{ action.icon }}</mat-icon><span>{{ action.label }}</span>
          </button>
        }
      </section>
    </div>
  }`,
  styles: `:host{display:contents}.backdrop{position:fixed;z-index:950;inset:0}.menu{position:fixed;z-index:951;display:grid;min-width:176px;padding:5px;border:1px solid var(--border);border-radius:10px;background:var(--surface-card);box-shadow:0 12px 30px #1018102b}.menu button{display:flex;min-height:34px;align-items:center;gap:9px;padding:0 9px;border:0;border-radius:7px;background:transparent;color:var(--text-primary);font:inherit;font-size:12px;font-weight:700;text-align:left;cursor:pointer}.menu button:hover{background:var(--olive-soft);color:var(--olive)}.menu mat-icon{width:17px;height:17px;font-size:17px}.menu .danger{color:var(--danger)}.menu .danger:hover{background:#f9e1df;color:var(--danger)}`,
})
export class ContextMenuComponent {
  @Input() open = false;
  @Input() left = 0;
  @Input() top = 0;
  @Input() actions: readonly ContextMenuAction[] = [];
  @Output() readonly selected = new EventEmitter<string>();
  @Output() readonly closed = new EventEmitter<void>();

  select(id: string): void { this.selected.emit(id); this.closed.emit(); }
}
