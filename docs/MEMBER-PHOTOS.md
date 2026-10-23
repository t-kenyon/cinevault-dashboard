# Friendly names and self-hosted member photos

The dashboard displays the Tautulli Friendly Name when it is valid, falling back to the Plex username. A name must be nonempty, at most 100 characters, and contain no control characters or `@`. Email fields are never used. Consent and history remain tied to numeric Tautulli user IDs, so changing a display name does not create a new member or alter consent dates.

## Persistent storage on KenyonVault

Store photos outside all source checkouts at:

```text
/mnt/user/appdata/cinevault-dashboard/member-photos
```

Create the directory with mode 755; readable photo files can use mode 644. The application runs as UID 1001 and needs read permission. The container mounts this directory read-only. Keep images in this folder instead of inside the container or public Git repository so rebuilds retain them. Back this folder up privately alongside the consent file.

Use JPEG, PNG or WebP images, at most 5 MB each. Filenames must start with a letter or number and contain only letters, numbers, underscores and hyphens before the extension. Example: `cinema-friend.jpg`. No subfolders, spaces, SVG, or symbolic links are supported. File content must match its extension.

## Runtime configuration

Keep the existing environment file, consent file mount, port mapping, and member-analytics settings. Add these options when creating the dashboard container:

```sh
-e CINEVAULT_PUBLIC_URL=https://cinevault-dashboard.com \
-e CINEVAULT_PHOTO_DIR=/run/cinevault/member-photos \
--mount type=bind,src=/mnt/user/appdata/cinevault-dashboard/member-photos,dst=/run/cinevault/member-photos,readonly
```

These lines are additional Docker run options, not a standalone command. The public URL must be the exact HTTPS origin, with no path, credentials, query string, or custom port. Cloudflare's existing route already forwards the photo paths to the application; no extra tunnel route is needed.

## Set a member photo in Tautulli

1. Place the approved image in the host folder, e.g. `cinema-friend.jpg`.
2. In that member's Tautulli settings, set the custom avatar URL to `https://cinevault-dashboard.com/member-photos/cinema-friend.jpg` and save it.
3. Allow up to 60 seconds for the dashboard's cached Tautulli user list to expire, then refresh.

Only a configured photo assigned to a currently consenting member who appears in rankings or Recent Screenings is served. A file without an eligible assignment returns 404 even if it exists. The URL may therefore return 404 before it has been saved in Tautulli or while the previous assignment is cached. This is intentional. Existing Plex avatar URLs still work for users who have not chosen a custom URL; missing/unsupported images fall back to initials.

The same URL works as Tautulli's image source and as a direct browser request. The dashboard reads local file bytes instead of sending a network request back through Cloudflare. Public page image URLs still use opaque artwork identifiers. Both access paths check current consent; responses are private/no-store and restricted to raster image content. There is no public upload or folder-listing endpoint.

To replace a photo, update the host file; no image rebuild is required. To change its filename, update the Tautulli URL too and wait for the 60-second user-list cache. To remove a custom photo immediately, remove the host file or revoke the member's photo-sharing section permissions; deleting the photo file does not change consent. Clearing the custom avatar in Tautulli restores the supplied Plex avatar after the cache expires. Already downloaded copies cannot be recalled.
