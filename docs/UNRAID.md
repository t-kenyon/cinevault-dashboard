# Run CineVault on KenyonVault (Unraid)

The first deployment is **demo mode only**. No Plex/Tautulli keys are needed, no live history is requested, and deployment does not enable sharing personal viewing data.

## Build on Unraid

Choose a persistent appdata folder for the checkout. Use the Unraid terminal (or an already configured SSH session), then:

```sh
git clone --branch feat/dashboard-v1 https://github.com/t-kenyon/cinevault-dashboard.git
cd cinevault-dashboard
docker build -t cinevault-dashboard:local .
```

Git is needed only to obtain/update source. If unavailable on the host, download the branch ZIP from GitHub and extract it into the persistent folder before building.

## Start on the home network

Replace `YOUR_SERVER_LAN_IP` with KenyonVault's actual private LAN address. Check port 3101 is unused first. Do not use the Plex or Tautulli port.

```sh
docker run -d \
  --name cinevault-dashboard \
  --restart unless-stopped \
  --security-opt no-new-privileges:true \
  --cap-drop ALL \
  -p YOUR_SERVER_LAN_IP:3101:3000 \
  cinevault-dashboard:local
```

Visit `http://YOUR_SERVER_LAN_IP:3101` from a device on the same network. Do not add a router port forward. The Docker host network policy must restrict access to the intended LAN; binding an address is not authentication.

If Docker Compose is already available, the equivalent is:

```sh
DASHBOARD_BIND_IP=YOUR_SERVER_LAN_IP docker compose up -d --build
```

Compose defaults to loopback-only access if the address is omitted.

## Unraid container settings

If managing the locally built image with Unraid's Docker template instead of the command above, use repository `cinevault-dashboard:local`, bridge networking, container port `3000`, host port `3101`, and WebUI `http://[IP]:[PORT:3000]`. Leave Privileged off. Do not mount the Docker socket, media library, or Plex/Tautulli configuration folders. The application needs no data volume in demo mode. Host-wide port bindings are broader than the IP-bound command above; prefer the command/Compose definition if a specific LAN bind is required.

## Verify and update

```sh
docker ps --filter name=cinevault-dashboard
docker inspect --format '{{.State.Health.Status}}' cinevault-dashboard
docker logs --tail 50 cinevault-dashboard
```

The image runs as an unprivileged user and contains the Next.js standalone server, static assets, and public artwork. Image cache writes remain inside the container and can be recreated. Fonts are served locally. Local build checks cover the standalone output; a full Linux container build/run still needs validation on a Docker host.

To update, fetch and fast-forward the review branch in the checkout, rebuild the image, then recreate the container. With Compose: `git pull --ff-only`, then `DASHBOARD_BIND_IP=YOUR_SERVER_LAN_IP docker compose up -d --build`. Keep the previous image until the new container is verified.

## Next: Tautulli

Confirm Tautulli's version and reachable base URL from the dashboard container. With bridge networking, `localhost` refers to the dashboard container, not Unraid or Tautulli. Use the actual server LAN address and published Tautulli port, or attach both containers to an existing suitable user-defined network and use the Tautulli container name. Do not change existing Tautulli networking just for this setup.

Tautulli 2.18+ supports the preferred `X-Api-Key` header. Credentials should be supplied only at runtime from private environment/secret storage, never during Docker build. `.dockerignore` excludes environment files from the build context. The status/inventory adapter is opt-in. Set `CINEVAULT_DATA_MODE=tautulli` with the URL and API key only at runtime; see [Tautulli setup](TAUTULLI.md).

The next reviewed change should connect status and movie-library totals only. Keep personal analytics on fictional fixtures until consent is recorded. Public remote access, reverse proxy configuration, or private VPN access can be decided after the LAN deployment works.

References: [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output), [self-hosting](https://nextjs.org/docs/app/guides/self-hosting), [Tautulli API](https://github.com/Tautulli/Tautulli/wiki/Tautulli-API-Reference).
