import { OidcClient, WebStorageStateStore } from "oidc-client-ts";
import { openUrl } from "@tauri-apps/plugin-opener";

export class OidcService {
  private oidcClient: OidcClient;

  constructor(issuer: string, clientId: string) {
    this.oidcClient = new OidcClient({
      authority: issuer,
      client_id: clientId,
      redirect_uri: "org.collintl.app://auth", 
      // https://v2.tauri.app/plugin/deep-linking/#listening-to-deep-links
      response_type: "code",
      scope: "openid profile email",
      extraQueryParams: {
        prompt: "login",
      },
    });
  }

  public async loginWithAuthorizationCode() {
    const req = await this.oidcClient.createSigninRequest({});
    openUrl(req.url);
  }

  public async handleRedirect(url: string): Promise<any> {
    const user = await this.oidcClient.processSigninResponse(url);
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
