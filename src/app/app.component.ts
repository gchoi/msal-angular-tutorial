import { Component, OnInit, Inject } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import axios from 'axios';
import { OAuthSettings, ApiSettings, Config, ReqBaseURl } from 'src/oauth';
import { AuthService } from './service/auth.service';

type UserProfileType = {
  userName?: string,
  userId?: string
};

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	title = 'Modular Cloud DL Demo (Developed by Alex Choi)';
	isIframe = false;
	loginDisplay = false;

  userProfile!: UserProfileType;
  userName: string = '';
  userId: string = '';

	projectList: any;
  speakerList: any;
	projectInfo: any[];

	projectId: number = 0;
	projectIdToDelete: number = 0;

	newProjectName: string = "";

  private readonly _destroying$ = new Subject<void>();

	constructor(
		@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
		private broadcastService: MsalBroadcastService,
		private msalService: MsalService,
		private httpClient: HttpClient,
    private authService: AuthService
	) { }

	ngOnInit() {
		this.isIframe = window !== window.parent && !window.opener;

		this.broadcastService.inProgress$
			.pipe(
				filter((status: InteractionStatus) => status === InteractionStatus.None),
				takeUntil(this._destroying$)
			)
			.subscribe(() => {
				this.setLoginDisplay();
			});
	}

	login() {
		if (this.msalGuardConfig.authRequest) {
			this.msalService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
		} else {
			this.msalService.loginRedirect();
		}
	}

	logout() { // Add log out function here
    this.authService.deleteAllCookies();
		this.msalService.logoutPopup({
			mainWindowRedirectUri: "/"
		});
	}

	setLoginDisplay() {
		this.loginDisplay = this.msalService.instance.getAllAccounts().length > 0;

    if (this.loginDisplay) {
      console.log('User Info: ');
      console.log(this.msalService.instance.getAllAccounts()[0]);
    } else {
      console.log('User not logged in');
    }

    if (this.loginDisplay) {
      this.authService.getAccessToken()
        .then(accessToken => {
          //console.log(accessToken);
          this.setUserProfile(accessToken);
        })
        .catch(err => console.log(err));
    }
	}

	setUserProfile(token: string) {
    const userInfo = this.msalService.instance.getAllAccounts()[0];

    this.userProfile = {
      userName: userInfo.name,
      userId: userInfo.homeAccountId
    }

    this.userName = userInfo.name;
    this.userId = userInfo.localAccountId;

    console.log('User Name: ', this.userName);
    console.log('User ID: ', this.userId);
	}

  getSpeakers() {
    this.httpClient.get(`${ReqBaseURl}/speakers`)
      .subscribe(
        data => {
          this.speakerList = data;
          console.log(JSON.stringify(this.speakerList));
        },
        error => console.log(error)
      );
  }

	getProjects() {
    this.httpClient.get(`${ReqBaseURl}/projects`)
      .subscribe(
        data => {
          this.projectList = data;
          console.log(this.projectList);
        },
        error => console.log(error)
      );
	}

	async getUsers() {
    this.httpClient.get(`${ReqBaseURl}/users`)
      .subscribe(
        data => {
          console.log(data);
        },
        error => console.log(error)
      );
	}

	addProject() {
    /*
    this.getAccessToken()
      .then(accessToken => {
        const data = { name: this.newProjectName };
        this.httpClient.post(ApiSettings.url, data)
          .subscribe(
            data => {
              console.log(data);
              this.projectList = data;
            },
            error => console.log(error)
          );
      })
      .catch(e => console.log(e));

     */

    /*
    this.getAccessToken()
      .then(accessToken => {
        const data = { name: this.newProjectName };

        this.getUsername(accessToken)
          .then(username => {
            axios.post(ApiSettings.url, data, {
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Authorization': `Bearer ${accessToken}`,
                'Ocp-Apim-Subscription-Key': OAuthSettings.subscription_key,
                'Content-Type': 'application/json',
                'user': username
              }
            })
              .then(res => {
                console.log("res", res.data);
              })
              .catch(err => console.log(err));
          });
      })
      .catch(e => console.log(e));

     */
	}

	deleteProjectById() {
    this.authService.getAccessToken()
      .then(accessToken => {
        axios.delete(`${ApiSettings.url}/${this.projectIdToDelete}`, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Authorization': `Bearer ${accessToken}`,
            'Ocp-Apim-Subscription-Key': OAuthSettings.subscription_key,
            'Content-Type': 'application/json'
          }
        })
          .then(res => {
            console.log("res", res.data);
          })
          .catch(err => console.log(err));
      })
      .catch(e => console.log(e));
	}

	onChangeProjectId(event: any) {
		this.projectId = event.target.value;
	};

	onChangeNewProject(event: any) {
		this.newProjectName = event.target.value;
	};

	onChangeProjectIdToDelete(event: any) {
		this.projectIdToDelete = event.target.value;
	};

	ngOnDestroy(): void {
		this._destroying$.next(undefined);
		this._destroying$.complete();
	}
}
