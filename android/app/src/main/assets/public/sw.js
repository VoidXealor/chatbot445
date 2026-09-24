/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "9af43d328df66934bd3ecb52e034cd01"
  }, {
    "url": "pwa-512x512.png",
    "revision": "9af43d328df66934bd3ecb52e034cd01"
  }, {
    "url": "pwa-192x192.png",
    "revision": "795f0ea51af2800ab2d1b835e3091487"
  }, {
    "url": "index.html",
    "revision": "1b50d08c0b2173f9ec4c417af43a0332"
  }, {
    "url": "icon.svg",
    "revision": "9bff94a69d4959d1aefec0a632f504b4"
  }, {
    "url": "favicon.svg",
    "revision": "9bff94a69d4959d1aefec0a632f504b4"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "0f563c7b1a6ff11fdfa7e71e86fc8adf"
  }, {
    "url": "assets/ort-wasm-simd-threaded.asyncify-CxOG5pUO.wasm",
    "revision": null
  }, {
    "url": "assets/index-s7DyvY9x.css",
    "revision": null
  }, {
    "url": "assets/index-C3_D3NbA.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "0f563c7b1a6ff11fdfa7e71e86fc8adf"
  }, {
    "url": "favicon.svg",
    "revision": "9bff94a69d4959d1aefec0a632f504b4"
  }, {
    "url": "pwa-192x192.png",
    "revision": "795f0ea51af2800ab2d1b835e3091487"
  }, {
    "url": "pwa-512x512.png",
    "revision": "9af43d328df66934bd3ecb52e034cd01"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "9af43d328df66934bd3ecb52e034cd01"
  }, {
    "url": "manifest.webmanifest",
    "revision": "d3bd465d7b7d9043924f2ea3713d8c82"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
