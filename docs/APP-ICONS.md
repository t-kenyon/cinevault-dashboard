# CineVault app icons

Generated with the built-in image-generation tool, then resized into production assets. The original wide CineVault logo was a style reference. The selected wheel icon retains the black background, gold vault door/film-reel body, and a contrasting silver circular handwheel.

## Assets

- `src/app/favicon.ico`: 16, 32 and 48px browser icons in one ICO.
- `src/app/icon.png`: 32px PNG favicon.
- `src/app/apple-icon.png`: opaque 180px iPhone/iPad home-screen icon.
- `public/icons/cinevault-192.png`: 192px app icon.
- `public/icons/cinevault-512.png`: 512px app icon and reusable export.
- `src/app/manifest.ts`: CineVault home-screen name, root launch URL, standalone display, dark theme and app icons.

The large masters are saved separately in the project workspace's `output/cinevault-branding/` folder: `cinevault-app-icon-master.png` is the first concept, and `cinevault-app-icon-wheel-master.png` preserves the wheel revision, and `cinevault-app-icon-solid-master.png` is the selected final revision with solid charcoal cutouts. Generated originals are preserved as well. iOS adds its own corner mask; the source image intentionally stays square and opaque.

After deployment, open the public dashboard in Safari on an iPhone, use Share → Add to Home Screen, and save it as CineVault. If an older saved shortcut retains an old icon, remove that shortcut and add it again. No App Store submission is required. Home-screen installation and rendering on a physical iPhone have not been tested in this session.

Apple instructions: https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios

## Visual references

The circular wheel reference came from bank-vault door photographs, including the eight-spoke wheel in this bank's image: [Schaffhauser Kantonalbank](https://www.shkb.ch/397-anlagekonto-firmen), [photo](https://image.shkb.ch/max_1300x1300/becfc5dce8a5ecd4cc7d3efc063b46931d5e777c/teaserbild-anlagekonto.jpg?itok=J2Ax18uh). The generated icon uses a simplified three-spoke wheel to keep it readable at favicon size.

## Circular-wheel image-edit prompt

Edit this CineVault app icon. Change ONLY the front handle assembly: replace the current three free-ended silver rods with an unmistakable traditional bank-vault circular handwheel. The wheel must have a complete continuous thick SILVER CIRCULAR OUTER RING, connected to the center gold hub by three chunky silver spokes, like a bank vault steering wheel. The tips of all three spokes join the full circular rim; there must be no free-ended handles. Outer handwheel diameter about 48 percent of the vault door diameter. Keep the rest of the artwork intact: gold film-reel vault door, five dark reel openings with film texture, gold hinge on right, metallic bevels, near-black square background, framing and proportions. The circular silver wheel rim must contrast clearly against the gold door and read at 32px favicon size. Do not add text, extra objects, white border or rounded-square frame. Reference concept: real bank vault wheel handles, continuous rim around connected spokes. Deliver only the square icon.

## Final solid-cutout image-edit prompt

Make one precise edit to this CineVault square app icon. Inside EACH of the five large rounded cutouts in the gold vault door, remove ALL the gray circular film reel, curved strips, perforations, machinery and texture visible behind the holes. Fill the interior of every one of those five cutouts with a uniform SOLID near-black charcoal (#080808). These must look like clean flat dark-filled shapes with no circle or detail behind them. Preserve exactly the cutout boundaries and the gold beveled rims around them. Keep the foreground circular silver handwheel, its full rim, three spokes and gold center hub completely intact, including where it overlaps the dark cutouts. Keep the gold door, hinge, materials, lighting, square black background, size and composition unchanged. No added text or objects. Deliver only the finished square icon.
