/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  eslint: {
    dirs: ['src'],
  },
  // Ensure Node.js APIs are only used in API routes, not middleware
  serverExternalPackages: ['pg', 'bcrypt', 'jsonwebtoken', 'pino'],
};

export default nextConfig;
