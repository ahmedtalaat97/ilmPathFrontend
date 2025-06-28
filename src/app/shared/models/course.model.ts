export interface Course {
  id: string; // Guid is a string in TypeScript
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
  thumbnailImageUrl?: string; // Optional property
  categoryId?: number;
  categoryName?: string;
  instructorId: string;
  instructorName?: string;
}