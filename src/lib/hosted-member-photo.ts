// Internal file transport. Call only after authorizing current member photo access.
import { constants } from "node:fs";
import { open } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { memberPhotoFilename } from "./member-photo-policy.ts";

const headers = {"Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff"};
export function memberPhotoNotFound() { return new Response(null, {status: 404, headers}); }

export async function readHostedMemberPhoto(path: string, directory = process.env.CINEVAULT_PHOTO_DIR): Promise<Response> {
  const filename = memberPhotoFilename(path);
  if (!filename || !directory || !isAbsolute(directory)) return memberPhotoNotFound();
  let file;
  try {
    file = await open(join(directory, filename), constants.O_RDONLY | constants.O_NOFOLLOW);
    const stat = await file.stat();
    if (!stat.isFile() || stat.size < 1 || stat.size > 5_000_000) throw Error();
    // One extra byte detects concurrent growth without unbounded buffering.
    const bytes = Buffer.alloc(stat.size + 1);
    let size = 0;
    while (size < bytes.length) {
      const read = await file.read(bytes, size, bytes.length - size, null);
      if (!read.bytesRead) break;
      size += read.bytesRead;
    }
    if (size !== stat.size) throw Error();
    const image = bytes.subarray(0, size);
    const extension = filename.split(".").at(-1)!.toLowerCase();
    let type: string | undefined;
    if (extension === "png" && image.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) type = "image/png";
    if (["jpg", "jpeg"].includes(extension) && image.subarray(0,3).equals(Buffer.from([255,216,255]))) type = "image/jpeg";
    if (extension === "webp" && image.subarray(0,4).toString() === "RIFF" && image.subarray(8,12).toString() === "WEBP") type = "image/webp";
    if (!type) throw Error();
    return new Response(image, {headers: {...headers, "Content-Type": type}});
  } catch {
    return memberPhotoNotFound();
  } finally {
    await file?.close().catch(() => {});
  }
}
