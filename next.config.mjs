/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: import.meta.dirname,
  // @react-three/fiber's Canvas ne supporte pas le double montage/démontage
  // que le Strict Mode de React déclenche en dev sur les effets : le
  // WebGLRenderer créé au premier montage perd son contexte GL quand le
  // canvas est retiré du DOM lors du démontage simulé, avant le remontage
  // réel (rendu 3D vide, "THREE.WebGLRenderer: Context Lost." en console).
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
