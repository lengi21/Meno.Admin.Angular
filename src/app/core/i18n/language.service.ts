import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type MenoLanguage = 'ka' | 'en';
const STORAGE_KEY = 'meno-admin.language';
const translations: Record<MenoLanguage, any> = {
  ka: {
    NAV: { KITCHEN_MENU: 'სამზარეულო და მენიუ', MENUS: 'მენიუები', CATEGORIES: 'კატეგორიები', DISHES: 'კერძები', ANALYTICS: 'ანალიტიკა', AUDIT: 'აუდიტი', POS_SETTINGS: 'POS პარამეტრები', MANAGEMENT: 'მართვა', HALLS: 'დარბაზები და მაგიდები', STAFF: 'პერსონალი', ROLES: 'როლები' },
    COMMON: { OWNER: 'მფლობელი', ONLINE: 'ონლაინ', DARK_THEME: 'მუქი თემა', LIGHT_THEME: 'ღია თემა', SIGN_OUT: 'გასვლა', ADD: 'დამატება', CANCEL: 'გაუქმება', SAVE: 'შენახვა', PROTECTED: 'დაცული', ACTIVE: 'აქტიური', PAUSED: 'შეჩერებული' },
    MENU: { BREADCRUMB: 'სამზარეულო და მენიუ', TITLE: 'მენიუები', SUBTITLE: '{{count}} მენიუ · {{restaurant}}', ADD: 'მენიუს დამატება', NEW: 'ახალი მენიუ', SETUP: 'მენიუს შიგთავსი', QR_SETUP: 'QR მენიუს შიგთავსი', EMPTY: 'მენიუ ჯერ არ არის დამატებული', EMPTY_HINT: 'დაამატეთ პირველი მენიუ ამ რესტორნისთვის.', CATEGORIES: 'კატ.', DISHES: 'კერძ.', DEFAULT: 'ნაგულისხმევი', QR_NOTICE: 'ეს არის QR მენიუ. ის აქტიური და დაცულია — სტუმრებისთვის გამოჩენილ კატეგორიებსა და კერძებს აქ აკონტროლებთ.', CREATE_HINT: 'შეავსეთ მენიუს სახელები სამივე ენაზე. შემდგომ შეგიძლიათ დაამატოთ კატეგორიები და კერძები.', DEFAULT_HINT: 'გამოიყენება დარბაზში, რომელსაც მენიუ არ აქვს მინიჭებული.', SAVE_CONTENT: 'ცვლილებების შენახვა', SAVING: 'ინახება…', GEORGIAN: 'ქართული', ENGLISH: 'English', RUSSIAN: 'Русский' }
  },
  en: {
    NAV: { KITCHEN_MENU: 'KITCHEN & MENU', MENUS: 'Menus', CATEGORIES: 'Categories', DISHES: 'Dishes', ANALYTICS: 'Analytics', AUDIT: 'Audit', POS_SETTINGS: 'POS settings', MANAGEMENT: 'MANAGEMENT', HALLS: 'Halls & tables', STAFF: 'Staff', ROLES: 'Roles' },
    COMMON: { OWNER: 'Owner', ONLINE: 'Online', DARK_THEME: 'Dark theme', LIGHT_THEME: 'Light theme', SIGN_OUT: 'Sign out', ADD: 'Add', CANCEL: 'Cancel', SAVE: 'Save', PROTECTED: 'Protected', ACTIVE: 'Active', PAUSED: 'Paused' },
    MENU: { BREADCRUMB: 'Kitchen & Menu', TITLE: 'Menus', SUBTITLE: '{{count}} menus · {{restaurant}}', ADD: 'Add menu', NEW: 'New menu', SETUP: 'Menu content', QR_SETUP: 'QR menu content', EMPTY: 'No menus yet', EMPTY_HINT: 'Add the first menu for this restaurant.', CATEGORIES: 'categories', DISHES: 'dishes', DEFAULT: 'Default', QR_NOTICE: 'This is the QR menu. It remains active and protected — control which categories and dishes are visible to guests here.', CREATE_HINT: 'Fill in the menu names in all three languages. You can add categories and dishes afterwards.', DEFAULT_HINT: 'Used by a hall that does not have its own assigned menu.', SAVE_CONTENT: 'Save changes', SAVING: 'Saving…', GEORGIAN: 'Georgian', ENGLISH: 'English', RUSSIAN: 'Russian' }
  }
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  readonly current = signal<MenoLanguage>((localStorage.getItem(STORAGE_KEY) as MenoLanguage) || 'ka');
  constructor() { this.translate.addLangs(['ka', 'en']); this.translate.setTranslation('ka', translations.ka); this.translate.setTranslation('en', translations.en); this.change(this.current()); }
  change(language: MenoLanguage) { this.current.set(language); localStorage.setItem(STORAGE_KEY, language); this.translate.use(language).subscribe(); }
  toggle() { this.change(this.current() === 'ka' ? 'en' : 'ka'); }
}

