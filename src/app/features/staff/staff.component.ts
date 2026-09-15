import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { BottomSheetComponent } from '../../shared/bottom-sheet/bottom-sheet.component';
import { AdminApiService, Staff } from '../../core/api/admin-api.service';
import { DataTableComponent } from '../../shared/data-table/data-table.component';
@Component({
  selector: 'app-staff',
  imports: [MatIconModule, FormsModule, DataTableComponent, BottomSheetComponent],
  template: `<main class="page list-page">
    <section class="heading">
      <div>
        <h1>პერსონალი & PIN-ები</h1>
        <p>{{ staff().length }} თანამშრომელი</p>
      </div>
      <button (click)="sheetOpen.set(true)"><mat-icon>add</mat-icon>თანამშრომლის დამატება</button>
    </section>
    <app-data-table
      ><section data-table-filters class="filters">
        <label><mat-icon>search</mat-icon><input placeholder="ძიება..." /></label
        ><select>
          <option>ყველა</option>
        </select>
      </section>
      <section data-table-rows class="rows">
        <div class="head">
          <span>თანამშრომელი</span><span>როლები</span><span>სტ.</span><span>უწყ.</span
          ><span>PIN</span><span></span>
        </div>
        @for (member of staff(); track member.id) {
          <article [class.inactive]="!member.isActive">
            <div class="person">
              <b>{{ member.firstName[0] }}{{ member.lastName[0] }}</b
              ><span
                ><strong>{{ member.firstName }} {{ member.lastName }}</strong
                ><small>{{ member.email || member.phone }}</small></span
              >
            </div>
            <span class="roles">
              @for (role of member.roles; track role.id) {
                <i>{{ role.name }}</i>
              }</span
            ><span
              ><em>{{ member.isActive ? 'აქტიური' : 'არააქტიური' }}</em></span
            ><span>—</span><span>—</span
            ><button (click)="reset(member.id)"><mat-icon>more_vert</mat-icon></button>
          </article>
        }
      </section></app-data-table
    >
  </main><app-bottom-sheet [open]="sheetOpen()" title="ახალი თანამშრომელი" eyebrow="MANAGEMENT" (closed)="sheetOpen.set(false)"><form class="staff-form" (ngSubmit)="create()"><label>სახელი<input name="firstName" required [(ngModel)]="form.firstName"></label><label>გვარი<input name="lastName" required [(ngModel)]="form.lastName"></label><label>ელ-ფოსტა<input name="email" [(ngModel)]="form.email"></label><label>ტელეფონი<input name="phone" [(ngModel)]="form.phone"></label><label>როლები<select name="roles" multiple [(ngModel)]="form.roleIds">@for(role of roles();track role.id){<option [value]="role.id">{{role.name}}</option>}</select></label><footer><button type="button" (click)="sheetOpen.set(false)">გაუქმება</button><button type="submit">დამატება</button></footer></form></app-bottom-sheet>`,
  styles: `
    .page {
      min-height: calc(100dvh - 56px);
      padding: 24px 30px;
      background: var(--color-background);
    }
    .heading {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .heading h1 {
      margin: 0;
      font-size: 29px;
    }
    .heading p {
      margin: 3px 0;
      color: var(--text-muted);
    }
    .heading button {
      display: flex;
      align-items: center;
      gap: 7px;
      height: 40px;
      padding: 0 18px;
      border: 0;
      border-radius: 22px;
      background: var(--color-secondary);
      color: #fff;
      font-weight: 800;
    }
    .filters {
      display: flex;
      gap: 15px;
    }
    .filters label {
      display: flex;
      align-items: center;
      width: 320px;
      height: 46px;
      padding: 0 14px;
      border: 1px solid var(--border);
      border-radius: 24px;
      background: var(--surface-card);
    }
    .filters input {
      width: 100%;
      height: 100%;
      margin-left: 7px;
      border: 0;
      outline: 0;
      background: transparent;
    }
    .filters select {
      height: 46px;
      min-width: 120px;
      padding: 0 14px;
      border: 1px solid var(--border);
      border-radius: 24px;
      background: var(--surface-card);
    }
    .head,
    article {
      display: grid;
      grid-template-columns: 2.2fr 1.4fr 0.9fr 0.6fr 0.8fr 32px;
      align-items: center;
      min-height: 76px;
      padding: 0 20px;
      gap: 12px;
    }
    .head {
      min-height: 52px;
      background: var(--surface-muted);
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 800;
    }
    .head span:first-child {
      padding-left: 58px;
    }
    article {
      border-top: 1px solid var(--border);
      color: var(--text-muted);
    }
    .person {
      display: flex;
      align-items: center;
      gap: 13px;
      color: var(--text-primary);
    }
    .person b {
      display: grid;
      width: 46px;
      height: 46px;
      place-items: center;
      border-radius: 50%;
      background: var(--surface-muted);
      color: var(--color-primary);
    }
    .person strong,
    .person small {
      display: block;
    }
    .person small {
      margin-top: 3px;
      color: var(--text-muted);
    }
    .roles {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }
    .roles i,
    article em {
      padding: 5px 10px;
      border-radius: 13px;
      background: var(--surface-muted);
      font-size: 12px;
      font-style: normal;
    }
    article em {
      background: #91aaa0;
      color: #00ae75;
    }
    article button {
      border: 0;
      background: transparent;
      color: var(--text-muted);
    }
    .staff-form{display:grid;gap:12px}.staff-form label{display:grid;gap:5px;font-size:13px;font-weight:700}.staff-form input,.staff-form select{min-height:40px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:var(--surface-muted)}.staff-form select{height:90px}.staff-form footer{display:flex;justify-content:flex-end;gap:8px}.staff-form footer button{padding:10px 14px;border:0;border-radius:8px;background:var(--olive);color:#fff;font-weight:800}.staff-form footer button:first-child{background:var(--surface-muted);color:var(--text-primary)}
    .inactive {
      opacity: 0.55;
    }
  `,
})
export class StaffComponent {
  private api = inject(AdminApiService);
  readonly staff = signal<Staff[]>([]); readonly roles = signal<any[]>([]); readonly sheetOpen = signal(false); form={firstName:'',lastName:'',email:'',phone:'',roleIds:[] as string[]};
  constructor() {
    this.load();
  }
  load() {
    this.api.getStaff().subscribe((v) => this.staff.set(v)); this.api.getRoles().subscribe((v) => this.roles.set(v));
  }
  create(){if(!this.form.firstName||!this.form.lastName||(!this.form.email&&!this.form.phone))return;this.api.createStaff(this.form).subscribe(()=>{this.sheetOpen.set(false);this.form={firstName:'',lastName:'',email:'',phone:'',roleIds:[]};this.load()});}
  reset(id: string) {
    this.api.resetPin(id).subscribe();
  }
}







