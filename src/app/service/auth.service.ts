import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { User } from '../interface/user';
import { ApiSettings } from "../../oauth";
import { MsalService } from "@azure/msal-angular";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private authService: MsalService
  ) { }

  setCookie(token: string, timeInSecs: number) {
    let now = new Date();
    let exp = new Date(now.getTime() + timeInSecs*1000);
    let status = '';
    document.cookie = `access_token=${token}; expires=${exp.toUTCString()}`;

    if (document.cookie && document.cookie.indexOf('access_token') != -1) {
      status = 'Cookie for access token successfully set. Expiration in ' + timeInSecs + ' seconds';
    } else {
      status = 'Cookie for access token NOT set. Please make sure your browser is accepting cookies';
    }

    console.log(status);
  }

  async getAccessTokenFromCookie() {
    const match = document.cookie.match(new RegExp('(^| )' + 'access_token' + '=([^;]+)'));
    if (match) {
      const accessToken = match[2];
      return accessToken;
    }

    return null;
  }

  async getAccessToken() {
    // Check if access token exists in cookie
    const accessToken = await this.getAccessTokenFromCookie();

    if (accessToken) {
      console.log('Access token already exists.');
      // If access token exists in cookie, let's return it
      return accessToken;
    }
    else {
      console.log('New access token acquired.');

      if (this.authService.instance.getAllAccounts().length > 0) {
        const response = await this.authService.instance.acquireTokenSilent({
          account: this.authService.instance.getAllAccounts()[0],
          scopes: ApiSettings.scopes
        });

        this.setCookie(response.idToken, 3600);
        return response.idToken;
      }
      else {
        return '';
      }
    }
  }

  deleteAllCookies() {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('http://jsonplaceholder.typicode.com/users');
  }

  getUser(): Observable<User> {
    return this.http.get<User>('http://jsonplaceholder.typicode.com/users/1');
  }
}
