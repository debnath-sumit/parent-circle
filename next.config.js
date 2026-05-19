/** @type {import('next').NextConfig} */
const nextConfig = {
  // The Vercel Supabase integration injects SUPABASE_URL (server-only). Alias
  // it to NEXT_PUBLIC_SUPABASE_URL so the same value is also inlined into
  // client bundles where our browser supabase client reads it.
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  }
};

module.exports = nextConfig;
