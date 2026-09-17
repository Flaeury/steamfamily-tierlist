export const BANNED_WORDS = [
  "hentai", "nsfw", "18+", "porn", "sex",
  "digital artbook", "digital art book", "art book",
  "soundtrack dlc", "soundtrack", "soundtrack trailer",
];

export function isGameAllowed(name: string): boolean {
  const lower = name.toLowerCase();
  return !BANNED_WORDS.some((word) => lower.includes(word));
}