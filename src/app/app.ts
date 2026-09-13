import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styles: [`:host{display:block;min-height:100dvh;background:var(--surface-page);color:var(--text-primary)}`],
  template: `
    <router-outlet />
  `,
})
export class App {}
