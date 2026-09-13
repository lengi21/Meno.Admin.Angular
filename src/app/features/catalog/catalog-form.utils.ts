import { CatalogTranslations } from '../../core/api/admin-api.service';
export const emptyTranslations = (): CatalogTranslations => ({ ka:{name:''}, en:{name:''}, ru:{name:''} });
export const categoryName = (item:{translations:{languageCode:string;name:string}[]}) => item.translations.find((translation)=>translation.languageCode==='ka')?.name ?? item.translations[0]?.name ?? '';
