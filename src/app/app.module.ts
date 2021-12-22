import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http"; // Import

import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MsalModule, MsalRedirectComponent, MsalGuard, MsalInterceptor } from '@azure/msal-angular'; // Import MsalInterceptor
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';

import { OAuthSettings, ApiSettings } from 'src/oauth';
import { CustomHttpInterceptor } from './service/custom.http.interceptor.service';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

@NgModule({
	declarations: [
		AppComponent,
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		MatButtonModule,
		MatToolbarModule,
		MatListModule,
		HttpClientModule,
		MsalModule.forRoot(new PublicClientApplication({
			auth: {
				clientId: OAuthSettings.clientId,
				authority: OAuthSettings.authority,
				redirectUri: OAuthSettings.redirectUri
			},
			cache: {
				cacheLocation: 'sessionStorage',
				storeAuthStateInCookie: isIE,
			},
      system: {
        iframeHashTimeout: 10000,
      }
		}), {
			interactionType: InteractionType.Redirect,
			authRequest: {
				scopes: OAuthSettings.scopes
			}
		}, {
			interactionType: InteractionType.Redirect, // MSAL Interceptor Configuration
			protectedResourceMap: new Map([
				[ApiSettings.url, ApiSettings.scopes],
			])
		})
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: MsalInterceptor,
			multi: true
		},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true
    },
		MsalGuard
	],
	bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
