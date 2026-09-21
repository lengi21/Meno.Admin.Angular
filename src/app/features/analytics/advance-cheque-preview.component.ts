import { Component, computed, input } from '@angular/core';
import type { AdvanceChequeSnapshot } from '../../core/api/admin-api.service';

@Component({
  selector: 'app-advance-cheque-preview',
  template: `@if (snapshot().available && snapshot().receipt; as receipt) {
    <article class="receipt">
      <header><strong>● {{ receipt.restaurantName }}</strong><small>POS</small></header>
      <h1>{{ title(receipt.language) }}</h1>
      <p class="meta">{{ tableLabel(receipt.language) }}: {{ receipt.tableName }}<br>{{ chequeLabel(receipt.language) }} #{{ receipt.chequeNumber.toString().padStart(6, '0') }} · {{ date() }}</p>
      <div class="dash"></div>
      <section class="items">@for (item of receipt.items; track $index) { <div><span>{{ item.name }}<small>{{ item.quantity }} × {{ item.unitPrice.toFixed(2) }}</small></span><b>{{ (item.quantity * item.unitPrice).toFixed(2) }}</b></div> }</section>
      <div class="dash"></div>
      <section class="total"><span>{{ totalLabel(receipt.language) }}</span><strong>{{ receipt.total.toFixed(2) }}</strong></section>
      <footer>{{ receipt.restaurantName }}</footer>
    </article>
  }`,
  styles: `:host{display:block}.receipt{width:80mm;max-width:100%;margin:auto;padding:5mm 5mm 8mm;background:#fff;color:#000;font:11px/1.35 Arial,sans-serif;box-shadow:0 3px 10px #0003}.receipt header{display:grid;margin:0 0 5mm;place-items:center;text-align:center}.receipt header strong{font-size:17px;letter-spacing:1px}.receipt header small{letter-spacing:3px}.receipt h1{margin:0 0 5mm;text-align:center;font-size:15px}.meta{margin:0;text-align:center}.dash{margin:4mm 0;border-top:1px dashed #000}.items{display:grid;gap:3mm}.items div,.total{display:flex;justify-content:space-between;gap:4mm}.items span{min-width:0;font-weight:700}.items small{display:block;font-weight:400}.items b{white-space:nowrap}.total{font-size:15px;font-weight:800}.receipt footer{margin-top:7mm;text-align:center;font-size:10px}`,
})
export class AdvanceChequePreviewComponent {
  readonly snapshot = input.required<AdvanceChequeSnapshot>();
  readonly date = computed(() => this.snapshot().printedAt ? new Intl.DateTimeFormat(this.snapshot().receipt?.language === 'ka' ? 'ka-GE' : this.snapshot().receipt?.language === 'ru' ? 'ru-RU' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(this.snapshot().printedAt!)) : '');
  title(language: string) { return language === 'ka' ? 'ავანსური ჩეკი' : language === 'ru' ? 'Предварительный чек' : 'Advance cheque'; }
  tableLabel(language: string) { return language === 'ka' ? 'მაგიდა' : language === 'ru' ? 'Стол' : 'Table'; }
  chequeLabel(language: string) { return language === 'ka' ? 'ჩეკი' : language === 'ru' ? 'Чек' : 'Cheque'; }
  totalLabel(language: string) { return language === 'ka' ? 'სულ' : language === 'ru' ? 'Итого' : 'Total'; }
}