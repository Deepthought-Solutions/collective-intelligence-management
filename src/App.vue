<script setup lang="ts">
import { ref, onMounted } from "vue";
import { OidcService } from "./services/oidc";
import { listen } from "@tauri-apps/api/event";

const issuer = ref("https://accounts.google.com");
const clientId = ref("");
const clientSecret = ref("");
const token = ref("");
const error = ref("");

async function loginWithAuthorizationCode() {
  try {
    const oidcService = new OidcService(issuer.value, clientId.value);
    await oidcService.loginWithAuthorizationCode();
  } catch (e: any) {
    error.value = e.message;
  }
}

async function loginWithClientCredentials() {
  try {
    // The token endpoint is usually at a well-known URL relative to the issuer.
    const tokenEndpoint = `${issuer.value}/.well-known/openid-configuration`;
    const response = await fetch(tokenEndpoint);
    const config = await response.json();
    const tokenUrl = config.token_endpoint;

    const oidcService = new OidcService(issuer.value, clientId.value);
    const result = await oidcService.loginWithClientCredentials(tokenUrl, clientId.value, clientSecret.value);
    token.value = JSON.stringify(result, null, 2);
    error.value = "";
  } catch (e: any) {
    error.value = e.message;
    token.value = "";
  }
}

async function handleRedirect(url: string) {
  const oidcService = new OidcService(issuer.value, clientId.value);
  try {
    const user = await oidcService.handleRedirect(url);
    token.value = JSON.stringify(user, null, 2);
    error.value = "";
  } catch (e: any) {
    error.value = e.message;
    token.value = "";
  }
}

onMounted(() => {
  listen("deeplink", (event) => {
    handleRedirect(event.payload as string);
  });
});
</script>

<template>
  <main class="container">
    <h1>OIDC/OAuth2 Authentication</h1>

    <div class="form-container">
      <div class="form-group">
        <label for="issuer">Issuer URL</label>
        <input id="issuer" v-model="issuer" placeholder="https://issuer.example.com" />
      </div>
      <div class="form-group">
        <label for="clientId">Client ID</label>
        <input id="clientId" v-model="clientId" placeholder="my-client-id" />
      </div>
      <div class="form-group">
        <label for="clientSecret">Client Secret</label>
        <input id="clientSecret" v-model="clientSecret" placeholder="my-client-secret" />
      </div>
      <div class="form-group">
        <button @click="loginWithAuthorizationCode">Login with Authorization Code</button>
        <button @click="loginWithClientCredentials">Login with Client Credentials</button>
      </div>
    </div>

    <div v-if="token" class="token-container">
      <h2>Authenticated</h2>
      <pre>{{ token }}</pre>
    </div>
    <div v-if="error" class="error-container">
      <h2>Error</h2>
      <pre>{{ error }}</pre>
    </div>
  </main>
</template>

<style scoped>
.container {
  padding-top: 2rem;
}

.form-container {
  width: 100%;
  max-width: 500px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.form-group label {
  margin-bottom: 0.5rem;
}

.form-group button {
  margin-top: 1rem;
}

.token-container {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  text-align: left;
  word-wrap: break-word;
  white-space: pre-wrap;
}

@media (prefers-color-scheme: dark) {
  .token-container {
    background-color: #2f2f2f;
    border-color: #555;
  }
}

.error-container {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ff4d4d;
  border-radius: 8px;
  background-color: #fff2f2;
  color: #ff4d4d;
  text-align: left;
  word-wrap: break-word;
  white-space: pre-wrap;
}

@media (prefers-color-scheme: dark) {
  .error-container {
    background-color: #4d2626;
    border-color: #ff4d4d;
    color: #ffcccc;
  }
}
</style>

<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

.container {
  margin: 0;
  padding-top: 10vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

input,
button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  color: #0f0f0f;
  background-color: #ffffff;
  transition: border-color 0.25s;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
}

button {
  cursor: pointer;
}

button:hover {
  border-color: #396cd8;
}
button:active {
  border-color: #396cd8;
  background-color: #e8e8e8;
}

input,
button {
  outline: none;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f6f6;
    background-color: #2f2f2f;
  }

  a:hover {
    color: #24c8db;
  }

  input,
  button {
    color: #ffffff;
    background-color: #0f0f0f98;
  }
  button:active {
    background-color: #0f0f0f69;
  }
}
</style>
