import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminAuthService } from '../auth/admin-auth.service';

export interface PosSettings { restaurantId: string; serviceFeePercent: number; defaultLanguage: 'ka' | 'en' | 'ru'; businessDayStart: string; businessDayEnd: string; }
export interface Permission { code: string; description: string; }
export interface Role { id: string; name: string; description: string | null; isOwnerRole: boolean; isActive: boolean; permissions: { permission: Permission }[]; }
export interface Staff { id: string; firstName: string; lastName: string; email: string | null; phone: string | null; isActive: boolean; roles: { id: string; name: string }[]; directPermissions: { code: string; isGranted: boolean }[]; }
export interface PinDelivery { type: 'email' | 'sms'; destination: string; }
export interface PinResult { staff?: Staff; staffId?: string; generatedPin: string; mockDelivery: PinDelivery; }

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);
  private readonly baseUrl = environment.apiBaseUrl;
  getSettings(restaurantId: string): Observable<PosSettings> { return this.http.get<PosSettings>(`${this.baseUrl}/admin/settings/${restaurantId}`, { headers: this.headers() }); }
  updateSettings(restaurantId: string, value: Partial<PosSettings>): Observable<PosSettings> { return this.http.patch<PosSettings>(`${this.baseUrl}/admin/settings/${restaurantId}`, value, { headers: this.headers() }); }
  getStaff(): Observable<Staff[]> { return this.http.get<Staff[]>(`${this.baseUrl}/admin/staff`, { headers: this.headers() }); }
  createStaff(value: { firstName: string; lastName: string; email?: string; phone?: string; roleIds?: string[]; permissionCodes?: string[] }): Observable<PinResult> { return this.http.post<PinResult>(`${this.baseUrl}/admin/staff`, value, { headers: this.headers() }); }
  updateStaff(staffId: string, value: Partial<Staff> & { roleIds?: string[]; permissionCodes?: string[] }): Observable<Staff> { return this.http.patch<Staff>(`${this.baseUrl}/admin/staff/${staffId}`, value, { headers: this.headers() }); }
  deleteStaff(staffId: string): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/admin/staff/${staffId}`, { headers: this.headers() }); }
  resetPin(staffId: string, resend = false): Observable<PinResult> { return this.http.post<PinResult>(`${this.baseUrl}/admin/staff/${staffId}/pin/${resend ? 'resend' : 'reset'}`, {}, { headers: this.headers() }); }
  getPermissions(): Observable<Permission[]> { return this.http.get<Permission[]>(`${this.baseUrl}/admin/permissions`, { headers: this.headers() }); }
  getRoles(): Observable<Role[]> { return this.http.get<Role[]>(`${this.baseUrl}/admin/roles`, { headers: this.headers() }); }
  createRole(value: { name: string; description?: string; permissionCodes?: string[] }): Observable<Role> { return this.http.post<Role>(`${this.baseUrl}/admin/roles`, value, { headers: this.headers() }); }
  updateRole(roleId: string, value: { name: string; description?: string; permissionCodes?: string[] }): Observable<Role> { return this.http.patch<Role>(`${this.baseUrl}/admin/roles/${roleId}`, value, { headers: this.headers() }); }
  deleteRole(roleId: string): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/admin/roles/${roleId}`, { headers: this.headers() }); }
  private headers(): HttpHeaders { return new HttpHeaders({ Authorization: `Bearer ${this.auth.session()?.accessToken ?? ''}` }); }
}
