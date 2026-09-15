import { Component, effect, input, signal } from '@angular/core';

/** Shared image state for catalog cards: loading, missing, and failed images never leave an empty tile. */
@Component({
  selector: 'app-catalog-image',
  template: `@if (state() !== 'loaded') { <span class="placeholder" aria-hidden="true">⌑</span> } @if (src()) { <img [class.loaded]="state() === 'loaded'" [src]="src()!" [alt]="alt()" loading="lazy" decoding="async" (load)="loaded()" (error)="failed()"> }`,
  styles: `:host{position:relative;display:block;overflow:hidden;background:var(--surface-muted);border-radius:inherit}.placeholder{position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(135deg,var(--olive-soft),var(--surface-muted));color:var(--olive);font-size:24px}.placeholder::after{position:absolute;inset:-55%;background:linear-gradient(90deg,transparent,#fff8,transparent);content:'';animation:shine 1.25s infinite}.placeholder{z-index:1}img{display:block;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .18s ease}img.loaded{opacity:1}@keyframes shine{to{transform:translateX(130%)}}`
})
export class CatalogImageComponent {
  readonly src = input<string | null | undefined>('');
  readonly alt = input('');
  readonly state = signal<'loading' | 'loaded' | 'failed'>('loading');
  constructor() { effect(() => { this.src(); this.state.set('loading'); }); }
  protected loaded() { this.state.set('loaded'); }
  protected failed() { this.state.set('failed'); }
}
