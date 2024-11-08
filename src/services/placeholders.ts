const placeholderBackgrounds = [
  "linear-gradient(45deg, #121212 0%, #FE2C55 10%, #121212 100%)",
  "linear-gradient(135deg, #121212 0%, #20D5EC 15%, #121212 100%)",
  "linear-gradient(to right, #1a1a1a 0%, #69C9D0 10%, #1a1a1a 100%)",
  "linear-gradient(to bottom right, #232323 0%, #EE1D52 15%, #121212 100%)",
  "linear-gradient(to bottom, #202020 0%, #69C9D0 10%, #161616 100%)",
];

export const getRandomPlaceholder = () => {
  const randomIndex = Math.floor(Math.random() * placeholderBackgrounds.length);
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#121212;stop-opacity:1" />
          <stop offset="15%" style="stop-color:#FE2C55;stop-opacity:0.5" />
          <stop offset="100%" style="stop-color:#121212;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>`
  )}`;
};