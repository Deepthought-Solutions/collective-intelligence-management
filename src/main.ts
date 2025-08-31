import { createApp } from "vue";
import App from "./App.vue";

import { getCurrent, onOpenUrl } from '@tauri-apps/plugin-deep-link';
// when using `"withGlobalTauri": true`, you may use
// const { getCurrent, onOpenUrl } = window.__TAURI__.deepLink;

const startUrls = await getCurrent();
if (startUrls) {
  // App was likely started via a deep link
  // Note that getCurrent's return value will also get updated every time onOpenUrl gets triggered.
}

await onOpenUrl((urls) => {
  console.log('deep link:', urls);
});

createApp(App).mount("#app");
