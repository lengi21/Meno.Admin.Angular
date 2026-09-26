import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DataTableComponent } from '../../shared/data-table/data-table.component';
import { BottomSheetComponent } from '../../shared/bottom-sheet/bottom-sheet.component';
import { AdvanceChequePreviewComponent } from './advance-cheque-preview.component';
import { AdminApiService, AdvanceChequeSnapshot, ChequeAnalyticsFilters, ChequeAnalyticsPage, ChequeAnalyticsRow, ChequeAnalyticsSort, ChequeAnalyticsSortKey } from '../../core/api/admin-api.service';
import { LanguageService } from '../../core/i18n/language.service';

const EMPTY_FILTERS: ChequeAnalyticsFilters = { halls: [], staff: [], businessDays: [], defaultBusinessDayId: null };
const EMPTY_PAGE: ChequeAnalyticsPage = { items: [], page: 1, pageSize: 25, total: 0, pages: 1 };

@Component({
  selector: 'app-analytics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIconModule, RouterLink, DataTableComponent, BottomSheetComponent, AdvanceChequePreviewComponent],
  template: `
    <main class="page list-page analytics-page">
      <section class="heading"><div><p>{{ georgian() ? 'ანალიტიკა' : 'ANALYTICS' }}</p><h1>{{ georgian() ? 'ჩეკები' : 'Cheques' }}</h1><span>{{ page().total }} {{ georgian() ? 'ჩეკი' : 'cheques' }}</span></div><a routerLink="/analytics/sold-dishes"><mat-icon>table_chart</mat-icon>{{ georgian() ? 'გაყიდული კერძები' : 'Sold dishes' }}</a></section>
      <app-data-table>
        <section data-table-filters class="filters">
          <label class="search"><mat-icon>search</mat-icon><input [(ngModel)]="query" (ngModelChange)="load(1)" [placeholder]="georgian() ? 'ჩეკის, მაგიდის ან მომხმარებლის ძიება...' : 'Search cheque, table, or owner...'" /></label>
          <label><span>{{ georgian() ? 'გახსნიდან' : 'Opened from' }}</span><input type="date" [(ngModel)]="from" (ngModelChange)="load(1)" /></label>
          <label><span>{{ georgian() ? 'გახსნამდე' : 'Opened to' }}</span><input type="date" [(ngModel)]="to" (ngModelChange)="load(1)" /></label>
          <select [(ngModel)]="businessDayId" (ngModelChange)="load(1)"><option value="">{{ georgian() ? 'მიმდინარე სამუშაო დღე' : 'Current business day' }}</option>@for (day of filters().businessDays; track day.id) { <option [value]="day.id">{{ formatBusinessDay(day.businessDate) }} · {{ day.status === 'OPEN' ? (georgian() ? 'ღია' : 'Open') : (georgian() ? 'დახურული' : 'Closed') }}</option> }</select>
          <select [(ngModel)]="status" (ngModelChange)="load(1)"><option value="ALL">{{ georgian() ? 'ყველა სტატუსი' : 'All statuses' }}</option><option value="OPEN">Open</option><option value="READY_TO_CLOSE">Ready to close</option><option value="CLOSED">{{ georgian() ? 'დახურული' : 'Closed' }}</option><option value="VOIDED">Voided</option></select>
          <select [(ngModel)]="hallId" (ngModelChange)="onHallChanged()"><option value="">{{ georgian() ? 'ყველა დარბაზი' : 'All halls' }}</option>@for (hall of filters().halls; track hall.id) { <option [value]="hall.id">{{ hall.name }}</option> }</select>
          <select [(ngModel)]="tableId" (ngModelChange)="load(1)"><option value="">{{ georgian() ? 'ყველა მაგიდა' : 'All tables' }}</option>@for (table of filteredTables(); track table.id) { <option [value]="table.id">{{ table.name }}</option> }</select>
          <select [(ngModel)]="ownerId" (ngModelChange)="load(1)"><option value="">{{ georgian() ? 'ყველა გამხსნელი' : 'All owners' }}</option>@for (member of filters().staff; track member.id) { <option [value]="member.id">{{ member.name }}</option> }</select>
          <select [(ngModel)]="payment" (ngModelChange)="load(1)"><option value="">{{ georgian() ? 'ყველა გადახდა' : 'All payments' }}</option><option value="CASH">{{ georgian() ? 'ნაღდი' : 'Cash' }}</option><option value="CARD">{{ georgian() ? 'ბარათი' : 'Card' }}</option><option value="TRANSFER">{{ georgian() ? 'გადარიცხვა' : 'Transfer' }}</option><option value="SPLIT">{{ georgian() ? 'გაყოფილი' : 'Split' }}</option></select>
        </section>
        <section #tableRows data-table-rows class="table-shell">
          <div class="table-head">
            <button type="button" (click)="toggleSort('openedAt', $event.shiftKey)">{{ georgian() ? 'გახსნის დრო' : 'Opened' }} <mat-icon>{{ sortIcon('openedAt') }}</mat-icon></button>
            <button type="button" (click)="toggleSort('chequeNumber', $event.shiftKey)">{{ georgian() ? 'ჩეკი' : 'Cheque' }} <mat-icon>{{ sortIcon('chequeNumber') }}</mat-icon></button>
            <button type="button" (click)="toggleSort('owner', $event.shiftKey)">{{ georgian() ? 'გამხსნელი' : 'Owner' }} <mat-icon>{{ sortIcon('owner') }}</mat-icon></button>
            <button type="button" (click)="toggleSort('hall', $event.shiftKey)">{{ georgian() ? 'დარბაზი' : 'Hall' }} <mat-icon>{{ sortIcon('hall') }}</mat-icon></button>
            <button type="button" (click)="toggleSort('table', $event.shiftKey)">{{ georgian() ? 'მაგიდა' : 'Table' }} <mat-icon>{{ sortIcon('table') }}</mat-icon></button>
            <button type="button" (click)="toggleSort('amount', $event.shiftKey)">{{ georgian() ? 'თანხა' : 'Amount' }} <mat-icon>{{ sortIcon('amount') }}</mat-icon></button>
            <button type="button" (click)="toggleSort('discountPercent', $event.shiftKey)">{{ georgian() ? 'ფასდ.' : 'Disc.' }} <mat-icon>{{ sortIcon('discountPercent') }}</mat-icon></button>
            <button type="button" (click)="toggleSort('total', $event.shiftKey)">{{ georgian() ? 'სულ' : 'Total' }} <mat-icon>{{ sortIcon('total') }}</mat-icon></button>
            <button type="button" (click)="toggleSort('payment', $event.shiftKey)">{{ georgian() ? 'გადახდა' : 'Paid by' }} <mat-icon>{{ sortIcon('payment') }}</mat-icon></button>
            <button type="button" (click)="toggleSort('clientPaid', $event.shiftKey)">{{ georgian() ? 'მიღებული' : 'Received' }} <mat-icon>{{ sortIcon('clientPaid') }}</mat-icon></button>
            <button type="button" (click)="toggleSort('closedAt', $event.shiftKey)">{{ georgian() ? 'დახურვა' : 'Closed' }} <mat-icon>{{ sortIcon('closedAt') }}</mat-icon></button>
            <span class="status-heading">{{ georgian() ? 'სტატუსი' : 'Status' }}</span>
          </div>
          @if (loading()) { <div class="state">{{ georgian() ? 'იტვირთება...' : 'Loading...' }}</div> }
          @else if (error()) { <div class="state"><span>{{ georgian() ? 'ჩეკების ჩატვირთვა ვერ მოხერხდა' : 'Could not load cheques' }}</span><button type="button" (click)="load()">{{ georgian() ? 'თავიდან ცდა' : 'Retry' }}</button></div> }
          @else { @for (row of page().items; track row.id) {
            <article>
              <span>{{ formatDate(row.openedAt) }}</span>
              <button class="cheque-link" type="button" (click)="openReceipt(row)">#{{ row.chequeNumber.toString().padStart(6, '0') }}<mat-icon>receipt_long</mat-icon></button>
              <span>{{ row.owner.name }}</span><span>{{ row.hallName }}</span><span>{{ row.tableName }}</span>
              <b>{{ formatAmount(row.amountBeforeDiscount) }}</b><span>{{ row.discountPercent ? row.discountPercent + '%' : '—' }}</span><b>{{ formatAmount(row.totalAmount) }}</b>
              <span><i [class.split]="row.paymentMethod === 'SPLIT'" [class.cash]="row.paymentMethod === 'CASH'" [class.card]="row.paymentMethod === 'CARD'" [class.transfer]="row.paymentMethod === 'TRANSFER'">{{ paymentLabel(row.paymentMethod) }}</i></span>
              <b>{{ formatAmount(row.clientPaidAmount) }}</b><span>{{ row.closedAt ? formatDate(row.closedAt) : '—' }}</span><span><i class="status" [class.open]="row.status === 'OPEN'" [class.ready]="row.status === 'READY_TO_CLOSE'" [class.closed]="row.status === 'CLOSED'" [class.voided]="row.status === 'VOIDED'">{{ statusLabel(row.status) }}</i></span>
            </article>
          } @empty { <div class="state">{{ georgian() ? 'ჩეკები ვერ მოიძებნა' : 'No cheques found' }}</div> } }
        </section>
        <footer data-table-footer>
          <span>{{ page().total }} {{ georgian() ? 'ჩეკი' : 'cheques' }} · {{ georgian() ? 'გვერდი' : 'Page' }} {{ page().page }}/{{ page().pages }}</span>
          <div class="sorts"><span>{{ georgian() ? 'დალაგება:' : 'Sort:' }}</span>@for (sort of sorts(); track sort.key) { <button type="button" (click)="toggleSort(sort.key, true)">{{ sortLabel(sort.key) }} {{ sort.direction === 'asc' ? '↑' : '↓' }} <mat-icon (click)="$event.stopPropagation(); removeSort(sort.key)">close</mat-icon></button> }</div>
          <label class="jump">{{ georgian() ? 'გვერდი' : 'Page' }}<input type="number" [ngModel]="page().page" (ngModelChange)="goToPage($event)" min="1" [max]="page().pages" /></label>
          <button type="button" (click)="load(page().page - 1)" [disabled]="page().page === 1"><mat-icon>chevron_left</mat-icon></button><button type="button" (click)="load(page().page + 1)" [disabled]="page().page === page().pages"><mat-icon>chevron_right</mat-icon></button>
        </footer>
      </app-data-table>
    </main>
    <app-bottom-sheet [open]="receiptOpen()" [title]="receiptTitle()" eyebrow="CHEQUE ANALYTICS" (closed)="closeReceipt()">
      <section class="receipt-dialog">@if (receiptLoading()) { <p>{{ georgian() ? 'ჩეკი იტვირთება...' : 'Loading cheque...' }}</p> } @else if (snapshot()?.available) { @if (snapshot()?.isLive) { <p class="live-note"><mat-icon>sync</mat-icon>{{ georgian() ? 'ცოცხალი, მიმდინარე ჩეკი' : 'Live current cheque' }}</p> } <app-advance-cheque-preview [snapshot]="snapshot()!" /> } @else { <div class="no-receipt"><mat-icon>receipt_long</mat-icon><strong>{{ georgian() ? 'ავანსური ჩეკი არ არის დაბეჭდილი' : 'No advance cheque was printed' }}</strong><span>{{ georgian() ? 'ამ ჩეკისთვის შესანახი ავანსური ჩეკის სურათი არ არსებობს.' : 'There is no stored advance receipt snapshot for this cheque.' }}</span></div> }</section>
    </app-bottom-sheet>
  `,
  styles: `
    .page{min-height:calc(100dvh - 56px);padding:22px 28px;background:var(--color-background)}.heading{display:flex;align-items:start;justify-content:space-between;margin-bottom:16px}.heading p{margin:0;color:var(--olive);font-size:12px;font-weight:800;letter-spacing:.1em}.heading h1{margin:3px 0;color:var(--text-primary);font-size:30px;letter-spacing:-.04em}.heading span{color:var(--text-muted);font-size:14px}.heading>a{display:flex;align-items:center;gap:6px;height:34px;padding:0 12px;border:1px solid var(--border);border-radius:8px;background:var(--surface-card);color:var(--olive);font-size:13px;font-weight:800;text-decoration:none}.heading>a mat-icon{width:17px;height:17px;font-size:17px}.filters{display:flex;flex-wrap:wrap;gap:8px}.filters label,.filters select{height:34px;border:1px solid var(--border);border-radius:8px;background:var(--surface-card);color:var(--text-primary);font-size:13px}.filters label{display:flex;align-items:center;gap:5px;padding:0 9px;color:var(--text-muted)}.filters label span{font-weight:700;white-space:nowrap}.filters input{min-width:0;height:100%;border:0;background:transparent;color:var(--text-primary);outline:0}.filters select{min-width:112px;padding:0 8px}.filters .search{width:245px}.filters .search mat-icon{width:16px;height:16px;font-size:16px}.filters .search input{width:100%}.table-head,article{display:grid;grid-template-columns:1.08fr .76fr 1.06fr .78fr .68fr .82fr .6fr .72fr .78fr .8fr 1.08fr .75fr;align-items:center;min-width:1260px;min-height:54px;padding:0 14px;gap:8px}.table-head{position:sticky;top:0;z-index:2;min-height:40px;background:var(--surface-muted)}.table-head button,.status-heading{display:flex;align-items:center;gap:2px;padding:0;border:0;background:transparent;color:var(--text-muted);font-size:12px;font-weight:800;text-align:left;white-space:nowrap}.table-head mat-icon{width:14px;height:14px;font-size:14px}article{border-top:1px solid var(--border);color:var(--text-muted);font-size:13px}article b{color:var(--text-primary);font-size:14px}.cheque-link{display:flex;align-items:center;gap:3px;border:0;background:transparent;color:var(--olive);font-size:14px;font-weight:800;text-decoration:underline}.cheque-link mat-icon{width:15px;height:15px;font-size:15px}.table-shell{overflow:auto}.table-shell::-webkit-scrollbar{height:6px}.table-shell::-webkit-scrollbar-thumb{border-radius:99px;background:var(--color-secondary)}article i{display:inline-flex;padding:4px 7px;border-radius:12px;background:#7a8f85;color:#fff;font-size:12px;font-style:normal;font-weight:800}.cash{background:#3e7853!important}.card{background:#466e95!important}.transfer{background:#725a9b!important}.split{background:#b27622!important}.status{background:#6d7680!important}.status.open{background:#ae7927!important}.status.ready{background:#466e95!important}.status.closed{background:#3e7853!important}.status.voided{background:#9d4b49!important}.state{display:grid;min-height:160px;place-items:center;gap:10px;padding:24px;color:var(--text-muted);text-align:center}.state button{padding:7px 11px;border:1px solid var(--border);border-radius:7px;background:var(--surface-card);color:var(--text-primary)}footer{display:flex;align-items:center;gap:7px;min-height:38px;padding:0 14px;border-top:1px solid var(--border);color:var(--text-muted);font-size:13px}footer>span{white-space:nowrap}.sorts{display:flex;flex:1;align-items:center;gap:4px;min-width:0;overflow:hidden;white-space:nowrap}.sorts button{display:flex;align-items:center;gap:2px;padding:3px 6px;border:0;border-radius:9px;background:var(--olive-soft);color:var(--olive);font-size:12px;font-weight:800}.sorts mat-icon{width:13px;height:13px;font-size:13px}.jump{display:flex;align-items:center;gap:4px;white-space:nowrap}.jump input{width:34px;height:22px;border:1px solid var(--border);border-radius:5px;background:var(--surface-muted);color:var(--text-primary);font-size:12px;text-align:center}footer>button{display:grid;width:24px;height:24px;place-items:center;border:0;border-radius:5px;background:transparent;color:var(--text-muted)}footer>button:hover{background:var(--surface-muted)}footer mat-icon{font-size:18px}.receipt-dialog{display:grid;min-height:250px;padding-bottom:4px}.live-note{display:flex;align-items:center;justify-content:center;gap:6px;margin:0 0 12px;padding:7px;border-radius:8px;background:var(--olive-soft);color:var(--olive);font-size:13px;font-weight:800}.live-note mat-icon{width:16px;height:16px;font-size:16px}.no-receipt{display:grid;gap:9px;place-items:center;max-width:360px;margin:auto;padding:36px 12px;color:var(--text-muted);text-align:center}.no-receipt mat-icon{width:42px;height:42px;color:var(--olive);font-size:42px}.no-receipt strong{color:var(--text-primary)}@media(max-width:850px){.page{padding:16px}.filters .search{width:100%}.filters label:not(.search){flex:1}.filters select{flex:1;min-width:100px}.table-head,article{min-width:1260px}.sorts{display:none}}
  `,
})
export class AnalyticsComponent {
  private readonly api = inject(AdminApiService);
  readonly language = inject(LanguageService);
  readonly page = signal<ChequeAnalyticsPage>(EMPTY_PAGE);
  readonly filters = signal<ChequeAnalyticsFilters>(EMPTY_FILTERS);
  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly error = signal(false);
  readonly sorts = signal<readonly ChequeAnalyticsSort[]>([{ key: 'openedAt', direction: 'desc' }]);
  readonly receiptOpen = signal(false);
  readonly receiptLoading = signal(false);
  readonly snapshot = signal<AdvanceChequeSnapshot | null>(null);
  readonly receiptTitle = signal('Advance cheque');
  private readonly destroyRef = inject(DestroyRef);
  private readonly tableRows = viewChild<ElementRef<HTMLElement>>('tableRows');
  private requestSequence = 0;
  readonly georgian = computed(() => this.language.current() === 'ka');
  readonly filteredTables = computed(() => this.hallId ? this.filters().halls.find((hall) => hall.id === this.hallId)?.tables ?? [] : this.filters().halls.flatMap((hall) => hall.tables));
  query = ''; from = ''; to = ''; status = 'ALL'; businessDayId = ''; hallId = ''; tableId = ''; ownerId = ''; payment = '';

  constructor() {
    this.api.getChequeAnalyticsFilters().subscribe({
      next: (filters) => { this.filters.set(filters); this.businessDayId = filters.defaultBusinessDayId ?? ''; this.load(1); },
      error: () => this.load(1),
    });
    const timer = window.setInterval(() => this.refresh(), 15000);
    this.destroyRef.onDestroy(() => window.clearInterval(timer));
  }

  /** A user-triggered query deliberately shows loading; the background poll never replaces the current rows. */
  load(targetPage = this.page().page): void { this.fetch(targetPage, false); }

  private refresh(): void {
    if (this.loading() || this.refreshing()) return;
    this.fetch(this.page().page, true);
  }

  private fetch(targetPage: number, silent: boolean): void {
    if (targetPage < 1) return;
    const request = ++this.requestSequence;
    const scrollPosition = silent ? this.scrollPosition() : null;
    if (silent) this.refreshing.set(true);
    else { this.refreshing.set(false); this.loading.set(true); this.error.set(false); }

    this.api.getChequeAnalytics({ page: targetPage, pageSize: 25, query: this.query, status: this.status, businessDayId: this.businessDayId, from: this.from, to: this.to, hallId: this.hallId, tableId: this.tableId, ownerId: this.ownerId, payment: this.payment, sort: this.sorts() }).subscribe({
      next: (incoming) => {
        if (request !== this.requestSequence) return;
        this.page.update((current) => this.reconcilePage(current, incoming));
        this.loading.set(false); this.refreshing.set(false);
        if (scrollPosition) this.restoreScrollPosition(scrollPosition);
      },
      error: () => {
        if (request !== this.requestSequence) return;
        this.refreshing.set(false);
        if (!silent) { this.loading.set(false); this.error.set(true); }
      },
    });
  }

  /** Keeps unchanged object references, so Angular updates only cheque rows whose values actually changed. */
  private reconcilePage(current: ChequeAnalyticsPage, incoming: ChequeAnalyticsPage): ChequeAnalyticsPage {
    const existing = new Map(current.items.map((row) => [row.id, row]));
    const items = incoming.items.map((row) => {
      const prior = existing.get(row.id);
      return prior && this.sameRow(prior, row) ? prior : row;
    });
    const unchanged = current.page === incoming.page && current.pageSize === incoming.pageSize && current.total === incoming.total && current.pages === incoming.pages && current.items.length === items.length && current.items.every((row, index) => row === items[index]);
    return unchanged ? current : { ...incoming, items };
  }

  private sameRow(left: ChequeAnalyticsRow, right: ChequeAnalyticsRow): boolean {
    return left.id === right.id && left.openedAt === right.openedAt && left.chequeNumber === right.chequeNumber && left.owner.name === right.owner.name && left.hallName === right.hallName && left.tableName === right.tableName && left.amountBeforeDiscount === right.amountBeforeDiscount && left.discountPercent === right.discountPercent && left.totalAmount === right.totalAmount && left.paymentMethod === right.paymentMethod && left.clientPaidAmount === right.clientPaidAmount && left.closedAt === right.closedAt && left.status === right.status;
  }

  private scrollPosition(): { top: number; left: number } | null {
    const element = this.tableRows()?.nativeElement;
    return element ? { top: element.scrollTop, left: element.scrollLeft } : null;
  }

  private restoreScrollPosition(position: { top: number; left: number }): void {
    requestAnimationFrame(() => {
      const element = this.tableRows()?.nativeElement;
      if (element) { element.scrollTop = position.top; element.scrollLeft = position.left; }
    });
  }

  onHallChanged(): void { this.tableId = ''; this.load(1); }
  goToPage(value: number | string): void { this.load(Math.min(this.page().pages, Math.max(1, Number(value) || 1))); }
  toggleSort(key: ChequeAnalyticsSortKey, additive: boolean): void {
    const current = this.sorts(); const existing = current.find((sort) => sort.key === key);
    const next = existing ? { key, direction: existing.direction === 'asc' ? 'desc' as const : 'asc' as const } : { key, direction: 'asc' as const };
    this.sorts.set(additive ? [...current.filter((sort) => sort.key !== key), next] : [next]); this.load(1);
  }
  removeSort(key: ChequeAnalyticsSortKey): void { const next = this.sorts().filter((sort) => sort.key !== key); this.sorts.set(next.length ? next : [{ key: 'openedAt', direction: 'desc' }]); this.load(1); }
  sortIcon(key: ChequeAnalyticsSortKey): string { const sort = this.sorts().find((item) => item.key === key); return sort ? sort.direction === 'asc' ? 'arrow_upward' : 'arrow_downward' : 'unfold_more'; }
  sortLabel(key: ChequeAnalyticsSortKey): string { const labels: Record<ChequeAnalyticsSortKey, readonly [string, string]> = { openedAt: ['გახსნა', 'Opened'], chequeNumber: ['ჩეკი', 'Cheque'], owner: ['გამხსნელი', 'Owner'], hall: ['დარბაზი', 'Hall'], table: ['მაგიდა', 'Table'], amount: ['თანხა', 'Amount'], discountPercent: ['ფასდ.', 'Disc.'], total: ['სულ', 'Total'], payment: ['გადახდა', 'Payment'], clientPaid: ['მიღებული', 'Received'], closedAt: ['დახურვა', 'Closed'] }; return labels[key][this.georgian() ? 0 : 1]; }
  paymentLabel(method: ChequeAnalyticsRow['paymentMethod']): string { const labels: Record<ChequeAnalyticsRow['paymentMethod'], readonly [string, string]> = { CASH: ['ნაღდი', 'Cash'], CARD: ['ბარათი', 'Card'], TRANSFER: ['გადარიცხვა', 'Transfer'], SPLIT: ['გაყოფილი', 'Split'], '—': ['—', '—'] }; return labels[method][this.georgian() ? 0 : 1]; }
  statusLabel(status: string): string { const labels: Record<string, readonly [string, string]> = { OPEN: ['ღია', 'Open'], READY_TO_CLOSE: ['დახურვისთვის მზად', 'Ready'], CLOSED: ['დახურული', 'Closed'], VOIDED: ['გაუქმებული', 'Voided'] }; return (labels[status] ?? [status, status])[this.georgian() ? 0 : 1]; }
  formatBusinessDay(value: string): string { return new Intl.DateTimeFormat(this.georgian() ? 'ka-GE' : 'en-GB', { dateStyle: 'medium' }).format(new Date(value)); }
  formatAmount(value: number): string { return value.toFixed(2); }
  formatDate(value: string): string { return new Intl.DateTimeFormat(this.georgian() ? 'ka-GE' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)); }
  openReceipt(row: ChequeAnalyticsRow): void { this.receiptTitle.set(`${this.georgian() ? 'ავანსური ჩეკი' : 'Advance cheque'} #${row.chequeNumber.toString().padStart(6, '0')}`); this.snapshot.set(null); this.receiptLoading.set(true); this.receiptOpen.set(true); this.api.getAdvanceChequeSnapshot(row.id).subscribe({ next: (snapshot) => { this.snapshot.set(snapshot); this.receiptLoading.set(false); }, error: () => { this.snapshot.set({ available: false, chequeNumber: row.chequeNumber }); this.receiptLoading.set(false); } }); }
  closeReceipt(): void { this.receiptOpen.set(false); this.snapshot.set(null); }
}
