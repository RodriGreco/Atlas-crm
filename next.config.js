/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
      },
        images: {
    remotePatterns: [
{ protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'graph.facebook.com' },
          ],
      },
      }

      module.exports = nextConfig
