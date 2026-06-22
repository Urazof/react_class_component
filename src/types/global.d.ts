// Type declarations for static assets and CSS files.
// Next.js handles CSS imports natively, but TypeScript needs these declarations
// for strict mode type checking of side-effect imports.

declare module '*.css';
declare module '*.svg' {
  import type React from 'react';
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.webp' {
  const src: string;
  export default src;
}
