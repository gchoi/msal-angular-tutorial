export const OAuthSettings = {
    clientId: '{YOUR_CLIENT_ID}',
    authority: 'https://login.microsoftonline.com/{YOUR_TENANT_ID}',
    redirectUri: 'http://localhost:4200',
    scopes: ['user.read', '{API}'],
    subscription_key: '{YOUR_SUBSCRIPTION_KEY}'
}

export const ApiSettings = {
  url: 'https://graph.microsoft.com/v1.0/me',
  scopes: ['user.read']
}

export const ReqBaseURl = 'https://mdl-apim.azure-api.net/conference';

export interface Config {
  id: string;
  name: string;
  owner: string;
  date_created: string;
}
