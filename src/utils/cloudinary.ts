/**
 * Generates an optimized Cloudinary URL for a given public ID,
 * applying best-practice configurations like auto-format (f_auto)
 * and auto-quality (q_auto) along with custom resize dimensions.
 * 
 * Falls back to local public images under `/images/` if the 
 * `PUBLIC_CLOUDINARY_CLOUD_NAME` environment variable is not configured.
 */
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string {
  const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;

  // Fallback to local images if Cloudinary is not configured
  if (!cloudName) {
    if (publicId.startsWith('/') || publicId.startsWith('http')) {
      return publicId;
    }
    // Remove potential folder prefixes for local resolution
    const basename = publicId.split('/').pop() || publicId;
    return basename.includes('.') ? `/images/${basename}` : `/images/${basename}.png`;
  }

  const folderName = import.meta.env.PUBLIC_CLOUDINARY_FOLDER || '';
  const prefix = folderName ? `${folderName.replace(/\/$/, '')}/` : '';
  const cleanPublicId = publicId.replace(/^\//, '');
  
  // Build the full public ID (including optional folder path)
  const fullPublicId = cleanPublicId.startsWith(prefix) ? cleanPublicId : `${prefix}${cleanPublicId}`;

  // Default transformations: automatic format & quality
  const transforms: string[] = ['f_auto', 'q_auto'];

  if (options.width) {
    transforms.push(`w_${options.width}`);
  }
  if (options.height) {
    transforms.push(`h_${options.height}`);
  }
  
  if (options.crop) {
    transforms.push(`c_${options.crop}`);
  } else if (options.width || options.height) {
    // Default crop to limit when dimensions are set, ensuring aspect ratios
    // are respected without distortion unless explicitly requested.
    transforms.push('c_limit');
  }

  if (options.quality) {
    const idx = transforms.indexOf('q_auto');
    if (idx !== -1) transforms.splice(idx, 1);
    transforms.push(`q_${options.quality}`);
  }

  if (options.format) {
    const idx = transforms.indexOf('f_auto');
    if (idx !== -1) transforms.splice(idx, 1);
    transforms.push(`f_${options.format}`);
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(',')}/${fullPublicId}`;
}
export default getCloudinaryUrl;
