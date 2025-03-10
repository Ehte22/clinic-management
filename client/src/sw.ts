import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { CacheFirst, NetworkFirst } from "workbox-strategies";
import { NavigationRoute, registerRoute, Route } from "workbox-routing";

declare let self: ServiceWorkerGlobalScope

// Clean outdated caches and precache assets
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)
self.skipWaiting()

// Claim clients immediately
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

// Cache Static Assets (JS, CSS, Images)
const imageRoute = new Route(
    ({ request, sameOrigin }) => {
        return sameOrigin && request.destination === "image"
    },
    new CacheFirst({ cacheName: "images" })
)
registerRoute(imageRoute)

const staticResourcesRoute = new Route(
    ({ request }) => ["script", "style"].includes(request.destination),
    new NetworkFirst({ cacheName: "static-resources" })
);
registerRoute(staticResourcesRoute)

// Cache Navigation
const navigationRoute = new NavigationRoute(
    new NetworkFirst({
        cacheName: "navigation",
        networkTimeoutSeconds: 5
    })
)
registerRoute(navigationRoute)