import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
export interface Menu { id: string; status: 'ACTIVE'|'PAUSED'|'DELETED'; purpose: 'POS'|'QR'; isSystem: boolean; isDefault: boolean; translations: { languageCode: string; name: string; description?: string }[]; _count?: { categories: number; dishes: number }; }
export interface MenuCategoryItem { categoryId: string; sortOrder: number; status: 'AVAILABLE'|'PAUSED'|'HIDDEN'; category?: Category; }
export interface MenuDishItem { dishId: string; sortOrder: number; status: 'AVAILABLE'|'PAUSED'|'HIDDEN'; priceOverride: string | number | null; dish?: Dish; }
export interface MenuStructure { id: string; categories: MenuCategoryItem[]; dishes: MenuDishItem[]; }
export interface CatalogTranslations { ka: { name: string; description?: string; recipe?: string }; en: { name: string; description?: string; recipe?: string }; ru: { name: string; description?: string; recipe?: string }; }
export interface Category { id: string; imageUrl: string | null; status: 'AVAILABLE'|'PAUSED'|'HIDDEN'; sortOrder: number; translations: { languageCode: string; name: string }[]; }
export interface Dish { id: string; categoryId: string; imageUrl: string | null; priceAmount: string|number; calories: number|null; status: 'AVAILABLE'|'PAUSED'|'HIDDEN'; translations: { languageCode: string; name: string; description: string; recipe?: string }[]; category?: Category; }
export interface DishPage { items: Dish[]; page: number; pageSize: number; total: number; }

export type ChequeAnalyticsSortKey = 'openedAt' | 'chequeNumber' | 'owner' | 'hall' | 'table' | 'amount' | 'discountPercent' | 'total' | 'payment' | 'clientPaid' | 'closedAt';
export type ChequeAnalyticsSort = { readonly key: ChequeAnalyticsSortKey; readonly direction: 'asc' | 'desc' };
export interface ChequeAnalyticsQuery { readonly page?: number; readonly pageSize?: number; readonly query?: string; readonly status?: string; readonly from?: string; readonly to?: string; readonly businessDayId?: string; readonly hallId?: string; readonly tableId?: string; readonly ownerId?: string; readonly payment?: string; readonly sort?: readonly ChequeAnalyticsSort[]; }
export interface ChequeAnalyticsRow { readonly id: string; readonly openedAt: string; readonly chequeNumber: number; readonly owner: { readonly name: string }; readonly hallName: string; readonly tableName: string; readonly amountBeforeDiscount: number; readonly discountPercent: number; readonly totalAmount: number; readonly paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'SPLIT' | '—'; readonly clientPaidAmount: number; readonly closedAt: string | null; readonly status: string; }
export interface ChequeAnalyticsPage { readonly items: readonly ChequeAnalyticsRow[]; readonly page: number; readonly pageSize: number; readonly total: number; readonly pages: number; }
export interface ChequeAnalyticsFilters { readonly halls: readonly { readonly id: string; readonly name: string; readonly tables: readonly { readonly id: string; readonly name: string }[] }[]; readonly staff: readonly { readonly id: string; readonly name: string }[]; readonly businessDays: readonly { readonly id: string; readonly businessDate: string; readonly status: 'OPEN'|'CLOSED' }[]; readonly defaultBusinessDayId: string | null; }
export interface AdvanceChequeSnapshot { readonly available: boolean; readonly chequeNumber: number; readonly printedAt?: string; readonly isLive?: boolean; readonly receipt?: { readonly restaurantName: string; readonly hallName: string; readonly tableName: string; readonly chequeNumber: number; readonly language: 'ka' | 'en' | 'ru'; readonly total: number; readonly items: readonly { readonly name: string; readonly quantity: number; readonly unitPrice: number }[]; }; }

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
  getMenuStructure(id: string): Observable<MenuStructure> { return this.http.get<MenuStructure>(`${this.baseUrl}/admin/catalog/menus/${id}/structure`, { headers: this.headers() }); }
  saveMenuCategories(id: string, items: { categoryId: string; sortOrder: number; status?: string }[]): Observable<unknown> { return this.http.put(`${this.baseUrl}/admin/catalog/menus/${id}/categories`, { items }, { headers: this.headers() }); }
  saveMenuDishes(id: string, items: { dishId: string; sortOrder: number; status?: string; priceOverride?: number | null }[]): Observable<unknown> { return this.http.put(`${this.baseUrl}/admin/catalog/menus/${id}/dishes`, { items }, { headers: this.headers() }); }
  getCategories(): Observable<Category[]> { return this.http.get<Category[]>(`${this.baseUrl}/admin/catalog/categories`, { headers: this.headers() }); }
  createCategory(value: { translations: CatalogTranslations; imageUrl?: string; status?: string }): Observable<Category> { return this.http.post<Category>(`${this.baseUrl}/admin/catalog/categories`, value, { headers: this.headers() }); }
  updateCategory(id:string,value: { translations: CatalogTranslations; imageUrl?: string; status?: string }): Observable<Category> { return this.http.patch<Category>(`${this.baseUrl}/admin/catalog/categories/${id}`, value, { headers:this.headers() }); }
  deleteCategory(id:string):Observable<void>{return this.http.delete<void>(`${this.baseUrl}/admin/catalog/categories/${id}`,{headers:this.headers()});}
  getDishes(page=1,pageSize=20,search=''):Observable<DishPage>{return this.http.get<DishPage>(`${this.baseUrl}/admin/catalog/dishes`,{headers:this.headers(),params:{page,pageSize,search}});}
  createDish(value: { categoryId:string; translations:CatalogTranslations; imageUrl?:string; priceAmount:number; calories?:number; status?:string }):Observable<Dish>{return this.http.post<Dish>(`${this.baseUrl}/admin/catalog/dishes`,value,{headers:this.headers()});}
  uploadImage(file:File):Observable<{url:string}>{const data=new FormData();data.append('file',file);return this.http.post<{url:string}>(`${this.baseUrl}/admin/uploads`,data,{headers:this.headers()});}
  getChequeAnalytics(query: ChequeAnalyticsQuery): Observable<ChequeAnalyticsPage> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (key === 'sort') continue;
      if (value !== undefined && value !== '') params = params.set(key, String(value));
    }
    if (query.sort?.length) params = params.set('sort', query.sort.map((sort) => `${sort.key}:${sort.direction}`).join(','));
    return this.http.get<ChequeAnalyticsPage>(`${this.baseUrl}/admin/analytics/cheques`, { headers: this.headers(), params });
  }
  getChequeAnalyticsFilters(): Observable<ChequeAnalyticsFilters> { return this.http.get<ChequeAnalyticsFilters>(`${this.baseUrl}/admin/analytics/cheques/filters`, { headers: this.headers() }); }
  getAdvanceChequeSnapshot(chequeId: string): Observable<AdvanceChequeSnapshot> { return this.http.get<AdvanceChequeSnapshot>(`${this.baseUrl}/admin/analytics/cheques/${chequeId}/advance-receipt`, { headers: this.headers() }); }
  private headers(): HttpHeaders { return new HttpHeaders({ Authorization: `Bearer ${this.auth.session()?.accessToken ?? ''}` }); }
}
