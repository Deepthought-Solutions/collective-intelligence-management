import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import { open } from "@tauri-apps/plugin-opener";

export class OidcService {
  private userManager: UserManager;

  constructor(issuer: string, clientId: string) {
    this.userManager = new UserManager({
      authority: issuer,
      client_id: clientId,
      redirect_uri: "tst-app://auth", // This will be configured in tauri.conf.json
      response_type: "code",
      scope: "openid profile email",
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      extraQueryParams: {
        prompt: "login",
      },
    });
  }

  public async loginWithAuthorizationCode() {
    const req = await this.userManager.createSigninRequest();
    open(req.url);
  }

  public async handleRedirect(url: string): Promise<any> {
    const user = await this.userManager.signinRedirectCallback(url);
    return user;
  }

  public async loginWithClientCredentials(
    tokenEndpoint: string,
    clientId: string,
    clientSecret: string
  ) {
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get token from client credentials flow");
    }

    const data = await response.json();
    return data;
  }
}
