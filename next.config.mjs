/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "myreplyai.com",
        port: "",
      },
      
    ],
  },
};

export default nextConfig;
