import { Component, Input } from '@angular/core';

/** Shared compact list frame. Each feature projects its filters, columns, rows and footer. */
@Component({
  selector: 'app-data-table',
  template: `<section class="filters"><ng-content select="[data-table-filters]"></ng-content></section><section class="table" [style.--columns]="columns"><ng-content select="[data-table-header]"></ng-content><ng-content select="[data-table-rows]"></ng-content><ng-content select="[data-table-footer]"></ng-content></section>`,
  styles: `:host{display:block}.filters{display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4)}.table{overflow:hidden;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--surface-card)}@media(max-width:850px){.filters{gap:8px;margin-bottom:14px}}`
})
export class DataTableComponent { @Input() columns = '1fr'; }




