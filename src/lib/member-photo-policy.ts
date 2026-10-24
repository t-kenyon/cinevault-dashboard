export function memberPhotoFilename(path: string): string | undefined {
  return /^\/member-photos\/([a-z0-9][a-z0-9_-]{0,79}\.(?:jpe?g|png|webp))$/i.exec(path)?.[1];
}

export function hostedMemberPhotoPath(source: string, publicUrl?: string): string | undefined {
  if (!publicUrl) return;
  try {
    const base = new URL(publicUrl);
    const photo = new URL(source);
    if (base.protocol !== "https:" || base.username || base.password || base.port || base.search || base.hash || base.pathname !== "/") return;
    if (photo.origin !== base.origin || photo.username || photo.password || photo.search || photo.hash) return;
    return memberPhotoFilename(photo.pathname) ? photo.pathname : undefined;
  } catch { return; }
}
