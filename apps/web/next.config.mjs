/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Монорепогийн дотоод TS багцыг Next-ээр транспайл хийнэ
  transpilePackages: ['@audit/shared'],
};

export default nextConfig;
