export function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, '') // Trim - from end of text
        .substring(0, 50); // Limit slug length to 50 characters
}

// Generate a unique slug if collision occurs
export async function generateUniqueSlug(title, GifModel) {
    let slug = slugify(title);
    let counter = 1;

    // Check if slug already exists
    while (await GifModel.exists({ slug })) {
        slug = `${slugify(title)}-${counter}`;
        counter++;
    }

    return slug;
}