import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, Permission, Role } from '../../core/api/admin-api.service';

@Component({
  selector: 'app-roles', imports: [FormsModule],
  template: `<main class="page"><header><div><p>ACCESS CONTROL</p><h1>Roles & permissions</h1></div><button (click)="create()">Create role</button></header><section class="form"><input placeholder="Role name" [(ngModel)]="name"><input placeholder="Description" [(ngModel)]="description"><label>Permissions<select multiple [(ngModel)]="permissionCodes">@for(permission of permissions();track permission.code){<option [value]="permission.code">{{permission.code}}</option>}</select></label></section><section class="list">@for(role of roles();track role.id){<article [class.protected]="role.isOwnerRole" [class.inactive]="!role.isActive"><div><strong>{{role.name}}</strong><span>{{role.description || 'No description'}}</span><small>{{role.permissions.length}} permissions</small></div><div><button (click)="disable(role.id)" [disabled]="role.isOwnerRole || !role.isActive">{{role.isOwnerRole ? 'Protected' : 'Disable'}}</button></div></article>}@empty{<p>No roles found.</p>}</section></main>`,
  styles: `.page{padding:28px;max-width:1100px}header{display:flex;align-items:center;justify-content:space-between}header p{margin:0;color:var(--olive);font-size:12px;font-weight:800}h1{margin:4px 0 20px}button{border:0;border-radius:8px;padding:10px 14px;background:var(--olive);color:#fff;font-weight:800}.form{display:grid;grid-template-columns:1fr 1fr 2fr;gap:10px;padding:16px;border:1px solid var(--border);border-radius:13px;background:var(--surface-card)}input,select{box-sizing:border-box;width:100%;min-height:42px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:var(--surface-muted);color:var(--text-primary)}select{height:110px;margin-top:6px}.list{display:grid;gap:10px;margin-top:18px}article{display:flex;justify-content:space-between;padding:15px;border:1px solid var(--border);border-radius:12px;background:var(--surface-card)}article div:first-child{display:grid;gap:4px}span,small{color:var(--text-muted)}article button{background:var(--surface-muted);color:var(--text-primary);border:1px solid var(--border)}.protected{border-color:var(--olive)}.inactive{opacity:.55}@media(max-width:700px){.page{padding:18px}.form{grid-template-columns:1fr}}`,
})
export class RolesComponent {
  private readonly api=inject(AdminApiService); readonly roles=signal<Role[]>([]); readonly permissions=signal<Permission[]>([]);
  name=''; description=''; permissionCodes:string[]=[];
  constructor(){this.load();}
  load(){this.api.getRoles().subscribe({next:value=>this.roles.set(value)});this.api.getPermissions().subscribe({next:value=>this.permissions.set(value)});}
  create(){if(!this.name.trim())return;this.api.createRole({name:this.name,description:this.description||undefined,permissionCodes:this.permissionCodes}).subscribe({next:()=>{this.name='';this.description='';this.permissionCodes=[];this.load();}});}
  disable(roleId:string){this.api.deleteRole(roleId).subscribe({next:()=>this.load()});}
}
