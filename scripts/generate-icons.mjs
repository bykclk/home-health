/**
 * Generates the app icon set from inline SVG.
 * Brand: green (#4a754c) field + white checkmark (echoing the score ring and
 * the "Spotless!" celebration). Run with: `npm i -D sharp && node scripts/generate-icons.mjs`.
 */
import sharp from 'sharp';

const GREEN = '#4a754c';
const RING = '#eef2e6';
const WHITE = '#ffffff';

const check = (sw, color, d) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;

// Full app icon: green field, subtle ring, bold white check.
const iconSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="${GREEN}"/>
  <circle cx="512" cy="512" r="300" fill="none" stroke="${RING}" stroke-width="26" opacity="0.22"/>
  ${check(84, WHITE, 'M338 530 L450 648 L688 392')}
</svg>`;

// Android adaptive foreground / monochrome: check only, within the safe zone.
const checkOnlySvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  ${check(60, WHITE, 'M388 512 L474 598 L648 440')}
</svg>`;

// Android adaptive background: solid green.
const bgSvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg"><rect width="1024" height="1024" fill="${GREEN}"/></svg>`;

// Splash: a small green badge with a white check, on the light splash background.
const splashSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect x="232" y="232" width="560" height="560" rx="150" fill="${GREEN}"/>
  ${check(56, WHITE, 'M432 516 L498 582 L602 456')}
</svg>`;

async function png(svg, file, size) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(file);
  console.log('wrote', file);
}

await png(iconSvg, 'assets/images/icon.png', 1024);
await png(bgSvg, 'assets/images/android-icon-background.png', 1024);
await png(checkOnlySvg, 'assets/images/android-icon-foreground.png', 1024);
await png(checkOnlySvg, 'assets/images/android-icon-monochrome.png', 1024);
await png(splashSvg, 'assets/images/splash-icon.png', 1024);
await png(iconSvg, 'assets/images/favicon.png', 196);
