import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { concatMap, delay, retry, retryWhen } from 'rxjs/operators';

export const retryCount = 3;
export const retryWaitMilliSeconds = 500;

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {
  public constructor(
    @Optional() private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(req, next));
  }

  private async handleAccess(req: HttpRequest<any>, next: HttpHandler):Promise<HttpEvent<any>> {
    const authToken = await this.authService?.getAccessToken();

    console.log(authToken);

    const changedReq = req.clone({
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${authToken}`,
        /* 'Ocp-Apim-Subscription-Key': OAuthSettings.subscription_key */
      })
    });

    //return next.handle(changedReq).pipe(retry(5)).toPromise();

    // error status 401 : Unauthorized error
    return next.handle(changedReq).pipe(
      retryWhen(error =>
        error.pipe(
          concatMap((err, count) => {
            //console.log("Retry Count: ", count);
            if (count <= retryCount && err.status == 401) {
              return of(err);
            }
            return throwError(err);
          }),
          delay(retryWaitMilliSeconds)
        )
      )
    ).toPromise();
  }
}
