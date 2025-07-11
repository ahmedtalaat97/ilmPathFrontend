import { environment } from '../../../environments/environment';

export class ImageUrlUtil {
  /**
   * Converts a relative image URL to a full URL
   * @param imageUrl - The relative or absolute image URL
   * @returns Full image URL or null if no image
   */
  static getFullImageUrl(imageUrl: string | null | undefined): string | null {
    if (!imageUrl) return null;
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative URL, prepend the backend base URL (without /api)
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${imageUrl}`;
  }

  /**
   * Gets a fallback image URL for profiles
   * @returns Default avatar image path or null to show placeholder
   */
  static getDefaultAvatar(): string | null {
    // Return null so components can show placeholder divs instead
    return null;
  }

  /**
   * Gets the profile image URL with fallback
   * @param imageUrl - The user's profile image URL
   * @returns Full image URL or null for placeholder
   */
  static getProfileImageUrl(imageUrl: string | null | undefined): string | null {
    return this.getFullImageUrl(imageUrl);
  }
} 