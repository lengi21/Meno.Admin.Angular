import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AdminAuthService } from '../auth/admin-auth.service';
export const adminSessionInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  const isSignIn = request.url.includes('/auth/sign-in');
  const isRefresh = request.url.includes('/auth/refresh');

  // A failed sign-in should remain on the sign-in page so it can show its own
  // invalid-credentials message. Every protected request either refreshes its
  // session silently or returns the user to sign-in.
  if (isSignIn) return next(request);

  const authorizedRequest = isRefresh
    ? request
    : request.clone({ setHeaders: { Authorization: `Bearer ${auth.session()?.accessToken ?? ''}` } });

  return next(authorizedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) return throwError(() => error);

      if (isRefresh || !auth.session()?.refreshToken) {
        auth.signOut();
        void router.navigateByUrl('/sign-in');
        return throwError(() => error);
      }

      return from(auth.refresh()).pipe(
        switchMap(() => next(request.clone({ setHeaders: { Authorization: `Bearer ${auth.session()?.accessToken ?? ''}` } }))),
        catchError((refreshError) => {
          auth.signOut();
          void router.navigateByUrl('/sign-in');
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
