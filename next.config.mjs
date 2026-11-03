/** @type {import('next').NextConfig} */
const nextConfig = {
  // La landing vive en public/landing.html y se sirve en la raíz "/".
  async rewrites() {
    return [{ source: "/", destination: "/landing.html" }];
  },
};
export default nextConfig;
