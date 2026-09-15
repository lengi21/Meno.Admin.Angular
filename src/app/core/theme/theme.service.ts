import { Injectable, signal } from '@angular/core';
export type Theme = 'light'|'dark';
@Injectable({providedIn:'root'})
export class ThemeService{readonly current=signal<Theme>((localStorage.getItem('meno-admin-theme') as Theme)||'light');constructor(){this.apply(this.current())}toggle(){this.apply(this.current()==='light'?'dark':'light')}private apply(theme:Theme){this.current.set(theme);localStorage.setItem('meno-admin-theme',theme);document.documentElement.dataset['theme']=theme}}
