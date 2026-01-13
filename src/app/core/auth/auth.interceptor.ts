import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { TokenStorage } from './token.storage';

/**
 * Adds the `Authorization: Bearer <token>` header to requests when available.
 *
 * Also handles 401 responses by trying a refresh token flow once.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const tokenStorage = inject(TokenStorage);
  const auth = inject(AuthService);

  const accessToken = tokenStorage.getAccessToken();
  const isAuthEndpoint = req.url.includes('/auth/');

  const authReq = accessToken && !isAuthEndpoint
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: unknown): Observable<HttpEvent<unknown>> => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      // If the request is already about auth (login/refresh), don't retry.
      if (isAuthEndpoint) {
        return throwError(() => err);
      }

      // Attempt refresh once on 401.
      if (err.status === 401) {
        // IMPORTANT (typing): `refreshToken()` returns `Observable<TokenRefreshResponse | null>`.
        // We use `switchMap<HttpEvent<unknown>>` so the whole pipeline is correctly typed.
        return auth.refreshToken().pipe(
          switchMap((refreshRes): Observable<HttpEvent<unknown>> => {
            if (!refreshRes) {
              return throwError(() => err);
            }

            const newAccessToken = tokenStorage.getAccessToken();
            if (!newAccessToken) {
              return throwError(() => err);
            }

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`
              }
            });

            return next(retryReq);
          }),
          catchError((): Observable<HttpEvent<unknown>> => {
            // If refresh fails, clear local auth.
            tokenStorage.clear();
            return throwError(() => err);
          })
        );
      }

      return throwError(() => err);
    })
  );
};
