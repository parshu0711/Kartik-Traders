export default function getImageUrl(img) {
  if (!img) return 'https://via.placeholder.com/100x100?text=No+Image';
  
  // If it's already a full URL (Cloudinary or other), return as is
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }
  
  // For local uploads, construct the full URL
  const isDevelopment = import.meta.env.DEV;
  const baseUrl = import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:5000' : window.location.origin);
  
  return `${baseUrl}${img.startsWith('/') ? img : '/' + img}`;
} 