/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Required for Docker production builds
  images: {
    domains: [
      'covers.openlibrary.org',
      'image.tmdb.org',
      'i.ebayimg.com',
      'imgur.com',
      'i.imgur.com',
      'm.media-amazon.com',
      'images-na.ssl-images-amazon.com',
      'books.google.com',
      'books.googleusercontent.com',
      'upload.wikimedia.org',
      'static.wikia.nocookie.net',
      'encrypted-tbn0.gstatic.com',
      'michaelcrichton.com',
    ],
  },
};

module.exports = nextConfig;
