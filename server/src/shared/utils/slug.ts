/**
 * Converts a string to a URL-friendly slug.
 * "Mini Polaroids" → "mini-polaroids"
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // remove non-word chars except spaces and hyphens
    .replace(/[\s_]+/g, "-")    // spaces and underscores → hyphen
    .replace(/-+/g, "-")        // collapse multiple hyphens
    .replace(/^-+|-+$/g, "");   // trim leading/trailing hyphens
};

/**
 * Given a base slug and a check function, appends -2, -3, etc.
 * until a unique slug is found.
 */
export const generateUniqueSlug = async (
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> => {
  let slug = generateSlug(base);
  let isAvailable = !(await exists(slug));

  if (isAvailable) return slug;

  let counter = 2;
  while (true) {
    const candidate = `${slug}-${counter}`;
    const taken = await exists(candidate);
    if (!taken) return candidate;
    counter++;
  }
};