# Enable live server status and movie inventory

Only Plex status and aggregate movie-library counts are enabled by this phase. Personal analytics stay fictional. Tautulli 2.18+ is required: older versions do not support the `X-Api-Key` header used here.

1. Build the updated review branch on Unraid before supplying any credentials.
2. In Tautulli, check the version and obtain its API key from Settings → Web Interface → API. Enable API access if necessary. Do not paste the key into chat, GitHub, or screenshots.
3. Store runtime settings in a private `.env.runtime` file outside the extracted source checkout. Suggested directory: `/mnt/user/appdata/cinevault-dashboard/`. It must not be added to Git. Environment files are excluded from the Docker build context.
4. Start the dashboard with Docker's `--env-file` pointing to this file, keeping the existing port mapping, restart policy, and non-privileged settings.

Template (replace values privately on the server):

```dotenv
CINEVAULT_DATA_MODE=tautulli
TAUTULLI_URL=http://YOUR_PRIVATE_TAUTULLI_ADDRESS:8181
TAUTULLI_API_KEY=YOUR_PRIVATE_KEY
```

Restrict the host file to the administrator (`chmod 600`). Docker reads the file at container creation; do not mount it in the public directory. The API key grants Tautulli privileges, and host administrators can inspect container environment values. No API key is placed in browser requests or URLs by this adapter.

To update an existing container safely, stop it and rename it as a rollback copy, then create the updated `cinevault-dashboard` container with the env file. Do not change the `cinevault-tunnel` container. Verify the dashboard on the LAN and confirm only server status and movie count are live, then check the public domain.

On failure the UI shows Unavailable, not Offline, because a Tautulli/API failure does not establish Plex's state. Member screenings/rankings remain demo. Remove live mode and recreate the container to return to the full demo.

Reference: https://github.com/Tautulli/Tautulli/wiki/Tautulli-API-Reference
