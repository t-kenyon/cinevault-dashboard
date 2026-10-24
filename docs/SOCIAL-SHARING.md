# Main-link sharing preview

The approved 1200 × 630 image is `src/app/opengraph-image.jpg`. It uses a silver CINE / gold VAULT wordmark with a standard A in front of a separate closed vault door. The same approved artwork is also used as the homepage hero logo, with its natural 1200 × 630 proportions. The earlier logo asset is preserved in public/brand/.

Next.js emits Open Graph image metadata from this file and its companion `opengraph-image.alt.txt`. `src/app/layout.tsx` provides the public base URL, title (CineVault Dashboard), preservation tagline and large-image Twitter card pointing to the same artwork. No member data or network service is required to render the preview image.

Generated with the built-in image-generation tool using the earlier logo sharing card as a reference. The generated master and exact prompt are preserved in the project workspace under `output/cinevault-branding/cinevault-social-vault-door-v2-master.png` and `cinevault-social-vault-door-v2-prompt.txt`. The approved PNG export is also preserved there. The deployed image is a smaller JPEG export of that approved artwork.

After deploying, test a newly shared public homepage link on an iPhone. Messages may retain a previously generated preview; no immediate cache reset is guaranteed. Existing messages need not update when the website's image changes.

Generation prompt:

Built-in image generation; reference: cinevault-social-preview.png. New variant for review, not installed as the website sharing image.

Use case: logo-brand. Edit the attached CineVault social sharing graphic into a new wide cinematic brand composition. Final canvas landscape 1200x630, same approximate aspect ratio as the reference. Text verbatim: CINEVAULT, spelled C I N E V A U L T. Preserve the reference's bold extruded beveled metallic lettering, polished silver CINE and warm rich metallic gold VAULT, edge highlights and high-end film-collection feel. IMPORTANT: replace the vault-door-shaped A with an ordinary clearly readable capital A, with two diagonal gold legs, a horizontal crossbar and a simple triangular counter. No vault door, hinge, shelves or wheel incorporated into ANY letter. The complete text must read CINEVAULT naturally. Put the entire wordmark across the foreground in front of a separate monumental CLOSED round bank vault door centered in the background. This separate closed door must have a dark brushed steel face, gold circular outer rim and a silver circular crank wheel, with subtle gold lighting. No open door and no visible interior shelves. Door is behind the wordmark, partially occluded by the letters, darker and less prominent than the text so the name stays legible. Maintain near-black surroundings, symmetrical frontal composition, generous margins, clean contrast and no extra captions, logos or watermarks. The door is a background object, not an A character. Deliver one polished image itself, not a device mockup.
