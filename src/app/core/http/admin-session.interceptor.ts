import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AdminAuthService } from '../auth/admin-auth.service';
export const adminSessionInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AdminAuthService); const router = inject(Router);
  if (request.url.includes('/auth/sign-in') || request.url.includes('/auth/refresh')) return next(request);
  return next(request).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status !== 401) return throwError(() => error);
    return from(auth.refresh()).pipe(
      switchMap(() => next(request.clone({ setHeaders: { Authorization: `Bearer ${auth.session()?.accessToken ?? ''}` } }))),
      catchError(refreshError => { auth.signOut(); void router.navigateByUrl('/sign-in'); return throwError(() => refreshError); }),
    );
  }));
};
