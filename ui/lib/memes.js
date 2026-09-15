export const CONGRATS_IMAGES = [
  '/congrats/congrats-1.jpg',
  '/congrats/congrats-2.jpg',
  '/congrats/congrats-3.jpg',
  '/congrats/congrats-4.jpg',
  '/congrats/congrats-5.jpg',
  '/congrats/congrats-6.jpg',
  '/congrats/congrats-7.jpg',
];

export const SORRY_IMAGES = [
  '/sorry/sorry-1.jpg',
  '/sorry/sorry-2.jpg',
  '/sorry/sorry-3.jpg',
  '/sorry/sorry-4.gif',
];

/**
 * Deterministically or pseudo-randomly pick a meme based on team seed
 * to ensure all teams get different memes distributed across the full set.
 */
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getRandomCongratsImage(currentImage = null, teamSeed = null) {
  if (teamSeed) {
    const pool = currentImage ? CONGRATS_IMAGES.filter((img) => img !== currentImage) : CONGRATS_IMAGES;
    const idx = hashString(String(teamSeed)) % pool.length;
    return pool[idx];
  }
  const pool = currentImage ? CONGRATS_IMAGES.filter((img) => img !== currentImage) : CONGRATS_IMAGES;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

export function getRandomSorryImage(currentImage = null, teamSeed = null) {
  if (teamSeed) {
    const pool = currentImage ? SORRY_IMAGES.filter((img) => img !== currentImage) : SORRY_IMAGES;
    const idx = hashString(String(teamSeed)) % pool.length;
    return pool[idx];
  }
  const pool = currentImage ? SORRY_IMAGES.filter((img) => img !== currentImage) : SORRY_IMAGES;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

export function getTeamMeme(teamId = '', passed = false, currentImage = null) {
  if (passed) {
    return getRandomCongratsImage(currentImage, teamId || undefined);
  }
  return getRandomSorryImage(currentImage, teamId || undefined);
}
