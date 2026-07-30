# Traefik Dashboard

A read-only dashboard that reads Traefik's API, lists every domain currently being proxied, and renders each as a clickable card with a favicon for quick navigation.

Built with Vite, React, TypeScript, Tailwind CSS, and [Ninna UI](https://www.ninna-ui.dev/). A single Node/Express server serves the built static assets and proxies `/api/*` to Traefik, so the browser never talks to the Traefik API directly.

## Features

- Auto-discovers every domain from Traefik's `/api/http/routers`, polling every 20 seconds
- Excludes Traefik's own internal routers and the dashboard's own router
- Favicon fallback chain: site favicon, then Google's favicon service, then a generated initial
- Search/filter bar
- Light, dark, and system theme modes, plus a switchable Ninna UI color preset (Default, Ocean, Forest, Sunset, Minimal)
- No auth, no database, no persistence — state is whatever Traefik's API returns right now

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in real values. `VITE_TRAEFIK_API_URL` should point to wherever Traefik's API is reachable from your machine when running the dev server outside Docker (the `traefik` hostname only resolves inside the Docker network).

Set `VITE_MOCK_DATA=true` in `.env` to preview the UI with placeholder cards instead of a live Traefik connection. This flag has no effect in production builds.

## Building and running

The project builds into a Docker image (`docker/Dockerfile`) that serves the static bundle and proxies `/api/*` to Traefik via a small Express server, and ships with a compose file that attaches the container to Traefik's Docker network and pulls the published image from GHCR.

Copy `docker/docker-compose.example.yml` to `docker/docker-compose.yml` and fill in your real domain, entrypoint, and Docker network name (`docker-compose.yml` is gitignored since those are environment-specific):

```bash
cp docker/docker-compose.example.yml docker/docker-compose.yml
docker compose -f docker/docker-compose.yml up
```

The dashboard is itself routed through Traefik like any other service — it gets a router via Docker labels, not a published host port.

## Configuration

| Variable | Used by | Purpose |
|---|---|---|
| `TRAEFIK_API_URL` | container runtime | Traefik API address reachable from inside the Docker network |
| `VITE_TRAEFIK_API_URL` | `npm run dev` | Traefik API address reachable from your host machine |
| `VITE_DASHBOARD_HOSTNAME` | `npm run dev` | Overrides `window.location.hostname` for excluding the dashboard's own domain during local testing |
| `VITE_MOCK_DATA` | `npm run dev` | Renders placeholder cards instead of fetching from Traefik |

The dashboard's own domain, Traefik entrypoint, and Docker network name are set directly in `docker/docker-compose.yml`.

## Known limitations

- If Traefik's API sits behind an auth layer (e.g. Authentik) even on its internal port, the proxy has no credential forwarding — `/api/http/routers` returning a 401 or redirect instead of JSON is the signal to look into this.
- Router editing, authentication, and persistence are intentionally out of scope.
