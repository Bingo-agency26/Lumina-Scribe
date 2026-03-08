
export type ContentType = 'social_post' | 'blog_article' | 'email' | 'video_script' | 'product_description';

export type ToneType = 'professional' | 'casual' | 'friendly' | 'expert' | 'inspirational' | 'witty';

export type LengthType = 'short' | 'medium' | 'long';

export type Language = 'fr' | 'en';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface GenerationParams {
  tone: ToneType;
  length: LengthType;
  includeEmojis: boolean;
  platforms?: string[];
  goal?: string;
  jobTitle?: string;
  generateImage?: boolean; // New: Toggle for image generation
  imageAspectRatio?: AspectRatio; // New: Aspect ratio for the image
}

export interface Template {
  id: string;
  name: string;
  description: string;
  type: ContentType;
  iconName: string;
  defaultParams: GenerationParams;
  promptBase: string;
  example: string;
}

export interface GenerationHistory {
  id: string;
  type: ContentType;
  prompt: string;
  content: string;
  imageUrl?: string; // New: Store generated image
  createdAt: string;
  params: GenerationParams;
}

export interface ConnectedAccounts {
  linkedin: boolean;
  twitter: boolean;
  facebook: boolean;
  instagram: boolean; 
  tiktok: boolean;   
}

export interface User {
  email: string;
  firstName: string; 
  lastName: string;  
  birthDate?: string; 
  name: string; 
  isPro: boolean;
  credits: number;
  unlimited: boolean;
  connectedAccounts: ConnectedAccounts;
  stats: {
    totalWords: number;
    documentsCreated: number;
  }
}

export interface SignupData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthDate: string;
}