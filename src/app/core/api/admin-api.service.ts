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
export interface Menu { id: string; status: 'ACTIVE'|'PAUSED'|'DELETED'; isDefault: boolean; translations: { languageCode: string; name: string; description?: string }[]; _count?: { categories: number; dishes: number }; }
export interface CatalogTranslations { ka: { name: string; description?: string; recipe?: string }; en: { name: string; description?: string; recipe?: string }; ru: { name: string; description?: string; recipe?: string }; }
export interface Category { id: string; imageUrl: string | null; status: 'AVAILABLE'|'PAUSED'|'HIDDEN'; sortOrder: number; translations: { languageCode: string; name: string }[]; }
export interface Dish { id: string; categoryId: string; imageUrl: string | null; priceAmount: string|number; calories: number|null; status: 'AVAILABLE'|'PAUSED'|'HIDDEN'; translations: { languageCode: string; name: string; description: string; recipe?: string }[]; category?: Category; }
export interface DishPage { items: Dish[]; page: number; pageSize: number; total: number; }

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
  getMenus(): Observable<Menu[]> { return this.http.get<Menu[]>(`${this.baseUrl}/admin/catalog/menus`, { headers: this.headers() }); }
  createMenu(value: { translations: Record<string, { name: string; description?: string }>; status?: string; isDefault?: boolean }): Observable<Menu> { return this.http.post<Menu>(`${this.baseUrl}/admin/catalog/menus`, value, { headers: this.headers() }); }
  getCategories(): Observable<Category[]> { return this.http.get<Category[]>(`${this.baseUrl}/admin/catalog/categories`, { headers: this.headers() }); }
  createCategory(value: { translations: CatalogTranslations; imageUrl?: string; status?: string }): Observable<Category> { return this.http.post<Category>(`${this.baseUrl}/admin/catalog/categories`, value, { headers: this.headers() }); }
  updateCategory(id:string,value: { translations: CatalogTranslations; imageUrl?: string; status?: string }): Observable<Category> { return this.http.patch<Category>(`${this.baseUrl}/admin/catalog/categories/${id}`, value, { headers:this.headers() }); }
  deleteCategory(id:string):Observable<void>{return this.http.delete<void>(`${this.baseUrl}/admin/catalog/categories/${id}`,{headers:this.headers()});}
  getDishes(page=1,pageSize=20,search=''):Observable<DishPage>{return this.http.get<DishPage>(`${this.baseUrl}/admin/catalog/dishes`,{headers:this.headers(),params:{page,pageSize,search}});}
  createDish(value: { categoryId:string; translations:CatalogTranslations; imageUrl?:string; priceAmount:number; calories?:number; status?:string }):Observable<Dish>{return this.http.post<Dish>(`${this.baseUrl}/admin/catalog/dishes`,value,{headers:this.headers()});}
  uploadImage(file:File):Observable<{url:string}>{const data=new FormData();data.append('file',file);return this.http.post<{url:string}>(`${this.baseUrl}/admin/uploads`,data,{headers:this.headers()});}
  private headers(): HttpHeaders { return new HttpHeaders({ Authorization: `Bearer ${this.auth.session()?.accessToken ?? ''}` }); }
}
