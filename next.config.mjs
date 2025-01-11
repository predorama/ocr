/** @type {import('next').NextConfig} */
const nextConfig = {
    api: {
      bodyParser: {
        sizeLimit: '10mb', // Increase the limit to 10MB (or any size you need)
      },
    },
  };
  
  export default nextConfig;