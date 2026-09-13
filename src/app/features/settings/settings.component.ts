import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, PosSettings } from '../../core/api/admin-api.service';
import { AdminAuthService } from '../../core/auth/admin-auth.service';

@Component({ selector:'app-settings', imports:[FormsModule], template:`<main class="page"><p class="eyebrow">Configuration</p><h1>POS settings</h1><p>Restaurant-wide settings for {{ auth.session()?.user?.restaurantName }}.</p><section><label>Business day starts <input type="time" [(ngModel)]="settings.businessDayStart" /></label><label>Business day ends <input type="time" [(ngModel)]="settings.businessDayEnd" /></label><label>Service fee (%) <input type="number" [(ngModel)]="settings.serviceFeePercent" min="0" max="100" /></label><button type="button" (click)="save()">{{saved() ? 'Saved' : 'Save settings'}}</button></section></main>`, styles:`.page{padding:28px;max-width:900px}.eyebrow{color:var(--olive);font-weight:800}h1{margin:4px 0 8px}section{display:grid;gap:14px;margin-top:22px;padding:20px;border:1px solid var(--border);border-radius:14px;background:var(--surface-card)}label{display:grid;gap:7px;color:var(--text-muted);font-size:13px;font-weight:700}input{min-height:42px;border:1px solid var(--border);border-radius:8px;padding:0 10px;background:var(--surface-muted);color:var(--text-primary)}button{min-height:44px;border:0;border-radius:8px;background:var(--olive);color:#fff;font-weight:800}`})
export class SettingsComponent {
  readonly auth=inject(AdminAuthService); private readonly api=inject(AdminApiService); readonly saved=signal(false);
  readonly restaurantId=this.auth.session()?.user.restaurantId ?? '';
  settings:PosSettings={restaurantId:this.restaurantId,serviceFeePercent:0,defaultLanguage:'ka',businessDayStart:'09:00',businessDayEnd:'23:00'};
  constructor(){ if(this.restaurantId) this.api.getSettings(this.restaurantId).subscribe({ next: value=>this.settings=value }); }
  save(){ this.api.updateSettings(this.restaurantId,this.settings).subscribe({next:value=>{this.settings=value;this.saved.set(true);},error:()=>this.saved.set(false)}); }
}
