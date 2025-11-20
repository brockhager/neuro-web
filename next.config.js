/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/v1/:path*',
                destination: 'http://localhost:3007/v1/:path*',
            },
        ]
    },
    webpack: (config, { isServer }) => {
        // Suppress case-sensitivity warnings on Windows
        config.module.unsafeCache = false;
        return config;
    },
}

module.exports = nextConfig
