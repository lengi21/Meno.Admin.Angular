import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, inject } from '@angular/core';

/** Shared, viewport-level editor dialog. Its host is placed under <body> so app layout transforms cannot trap the overlay below the sidebar. */
@Component({
  selector: 'app-bottom-sheet',
  template: `@if (open) {
    <div class="backdrop" (click)="closed.emit()">
      <section role="dialog" aria-modal="true" [attr.aria-label]="title" (click)="$event.stopPropagation()">
        <header>
          <div><small>{{ eyebrow }}</small><h2>{{ title }}</h2></div>
          <button type="button" aria-label="Close" (click)="closed.emit()">×</button>
        </header>
        <div class="content"><ng-content /></div>
      </section>
    </div>
  }`,
  styles: `:host{display:contents}.backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:24px;background:#08110a88;backdrop-filter:blur(3px);animation:fade .18s ease-out}.backdrop section{display:flex;flex-direction:column;width:min(680px,100%);max-height:min(82dvh,720px);overflow:hidden;border-radius:18px;background:var(--surface-card);box-shadow:0 22px 60px #0007;animation:appear .2s ease-out}header{display:flex;flex:none;align-items:flex-start;justify-content:space-between;padding:20px 22px 15px;border-bottom:1px solid var(--border)}header small{color:var(--olive);font-size:11px;font-weight:800;letter-spacing:.08em}h2{margin:5px 0 0;color:var(--text-primary);font-size:22px}header button{display:grid;width:30px;height:30px;place-items:center;border:1px solid var(--border);border-radius:50%;background:var(--surface-muted);color:var(--text-primary);font-size:23px;line-height:1}.content{min-height:0;overflow:auto;padding:18px 22px 0}.content ::ng-deep footer{position:sticky;bottom:0;z-index:2;margin:18px -22px 0;padding:13px 22px;background:var(--surface-card);border-top:1px solid var(--border)}@keyframes appear{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes fade{from{opacity:0}to{opacity:1}}@media(max-width:700px){.backdrop{place-items:end center;padding:0}.backdrop section{width:100%;max-height:88dvh;border-radius:18px 18px 0 0}}`,
})
export class BottomSheetComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private value = false;

  @Input() set open(value: boolean) {
    this.value = value;
    this.document.body.classList.toggle('sheet-open', value);
  }
  get open(): boolean { return this.value; }
  @Input() title = '';
  @Input() eyebrow = 'EDITOR';
  @Output() closed = new EventEmitter<void>();

  ngAfterViewInit(): void { this.document.body.appendChild(this.host.nativeElement); }
  ngOnDestroy(): void { this.document.body.classList.remove('sheet-open'); }
}
