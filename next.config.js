/** @type {import('next').NextConfig} */
const nextConfig = {
        serverExternalPackages: ['@supabase/supabase-js'],
        images: {
                    remotePatterns: [
                        { protocol: 'https', hostname: '*.supabase.co' },
                        { protocol: 'https', hostname: 'graph.facebook.com' },
                                ],
        },
}

module.exports = nextConfig
