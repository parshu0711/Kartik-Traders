export default function getImageUrl(img) {
  if (!img) return 'https://via.placeholder.com/100x100?text=No+Image';
  if (img.startsWith('http')) return img;
  
  // Dynamically determine base URL
  const isDevelopment = import.meta.env.DEV;
  const baseUrl = import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:5000' : window.location.origin);
  
  return `${baseUrl}${img.startsWith('/') ? img : '/' + img}`;
} 