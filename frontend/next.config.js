/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    ],
  },
};

module.exports = nextConfig;
