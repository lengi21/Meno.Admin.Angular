import { Component, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Cached image preview with the shared Material image placeholder for missing or failed catalog media. */
@Component({
  selector: 'app-catalog-image',
  imports: [MatIconModule],
  template: `@if (state() !== 'loaded') { <span class="placeholder" aria-hidden="true"><mat-icon>image</mat-icon></span> } @if (src()) { <img [class.loaded]="state() === 'loaded'" [src]="src()!" [alt]="alt()" loading="lazy" decoding="async" (load)="loaded()" (error)="failed()"> }`,
  styles: `:host{position:relative;display:block;overflow:hidden;background:var(--surface-muted);border-radius:inherit}.placeholder{position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(135deg,color-mix(in srgb,var(--olive) 20%,var(--surface-muted)),var(--surface-muted));color:var(--olive)}.placeholder mat-icon{width:22px;height:22px;font-size:22px}img{display:block;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .18s ease}img.loaded{opacity:1}`,
})
export class CatalogImageComponent {
  readonly src = input<string | null | undefined>();
  readonly alt = input('');
  readonly state = signal<'loading' | 'loaded' | 'failed'>('loading');
  loaded(): void { this.state.set('loaded'); }
  failed(): void { this.state.set('failed'); }
}
