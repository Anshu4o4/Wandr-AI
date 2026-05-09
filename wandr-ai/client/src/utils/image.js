const OPTIMIZABLE_HOSTS = new Set([
  'images.unsplash.com',
  'images.pexels.com',
  'res.cloudinary.com',
]);

export const getOptimizedImageUrl = (src, { width, height, quality = 72 } = {}) => {
  if (!src) return '';

  try {
    const parsed = new URL(src);
    if (!OPTIMIZABLE_HOSTS.has(parsed.hostname)) return src;

    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fm', 'webp');
    parsed.searchParams.set('q', String(quality));

    if (width) parsed.searchParams.set('w', String(width));
    if (height) parsed.searchParams.set('h', String(height));

    return parsed.toString();
  } catch {
    return src;
  }
};

export const getResponsiveImageAttributes = (src, options = {}) => {
  const widths = options.widths || [320, 640, 960, 1280];
  const srcSet = widths
    .map((width) => `${getOptimizedImageUrl(src, { ...options, width })} ${width}w`)
    .join(', ');

  return {
    src: getOptimizedImageUrl(src, options),
    srcSet,
    sizes: options.sizes || '(max-width: 768px) 100vw, 50vw',
  };
};
