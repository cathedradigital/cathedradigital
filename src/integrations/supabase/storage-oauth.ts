/**
 * Supabase Storage & OAuth Configuration Module
 * Handles initialization of storage buckets and OAuth providers
 */

import { supabase } from '@/lib/db';

interface StorageBucketConfig {
  name: string;
  isPublic: boolean;
  allowedMimeTypes?: string[];
  maxFileSize?: number;
}

const STORAGE_BUCKETS: StorageBucketConfig[] = [
  {
    name: 'avatars',
    isPublic: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
  {
    name: 'public-assets',
    isPublic: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
];

/**
 * Initialize storage buckets for the application
 * This is typically called during app startup or admin setup
 */
export async function initializeStorageBuckets(): Promise<void> {
  console.log('Initializing storage buckets...');

  for (const bucket of STORAGE_BUCKETS) {
    try {
      // Check if bucket exists
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets?.some((b) => b.name === bucket.name);

      if (!bucketExists) {
        console.log(`Creating storage bucket: ${bucket.name}`);
        // Note: Storage bucket creation typically requires admin API
        // This should be done via Supabase Dashboard or CLI
      } else {
        console.log(`Storage bucket already exists: ${bucket.name}`);
      }
    } catch (error) {
      console.error(`Error initializing bucket ${bucket.name}:`, error);
    }
  }

  console.log('Storage bucket initialization complete');
}

/**
 * Upload file to storage bucket
 */
export async function uploadToStorage(
  bucketName: string,
  filePath: string,
  file: File
): Promise<{ path: string; url: string } | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error(`Error uploading to ${bucketName}:`, error);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      path: data.path,
      url: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

/**
 * OAuth Provider Configuration
 * Google and Apple OAuth settings
 */
function getPublicEnv(name: string): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[name];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return undefined;
}

function getBrowserOrigin(): string {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

/**
 * OAuth providers are configured in Supabase Auth. The client only exposes
 * whether the corresponding public client ID is present; secrets never belong
 * in the browser bundle.
 */
export const OAUTH_CONFIG = {
  google: {
    enabled: Boolean(getPublicEnv('VITE_GOOGLE_CLIENT_ID')),
    redirectUrl: `${getBrowserOrigin()}/auth/callback?provider=google`,
  },
  apple: {
    enabled: Boolean(getPublicEnv('VITE_APPLE_CLIENT_ID')),
    redirectUrl: `${getBrowserOrigin()}/auth/callback?provider=apple`,
  },
};

/**
 * Get available OAuth providers
 */
export function getAvailableOAuthProviders(): string[] {
  const providers: string[] = [];
  if (OAUTH_CONFIG.google.enabled) providers.push('google');
  if (OAUTH_CONFIG.apple.enabled) providers.push('apple');
  return providers;
}

export default {
  initializeStorageBuckets,
  uploadToStorage,
  OAUTH_CONFIG,
  getAvailableOAuthProviders,
};
