// No need to import React with modern JSX transformer

interface LogoProps {
  className?: string;
  onClick?: () => void;
  showText?: boolean;
}

export function Logo({ className = 'h-10 w-auto', onClick, showText = true }: LogoProps) {
  // Directly render the wolf logo as an SVG for better performance and matching
  // the blue wolf head silhouette in the original logo
  return (
    <div className={`flex items-center gap-3 ${className}`} onClick={onClick}>
      <svg 
        viewBox="0 0 100 100" 
        className="h-full w-auto" 
        style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))' }}
      >
        <g transform="translate(5, 5) scale(0.9 0.9)">
          {/* Wolf head SVG matching the original image */}
          <path
            fill="#3B82F6" // Matching the blue color from the original logo
            d="M50.5,10.2c-0.8,0.4-1.5,1.1-2.2,1.8c-2.3,2.4-3.1,5.7-3.9,8.9c-0.7,2.8-1.5,5.6-3.4,7.8
            c-2.4,2.9-6.1,4.4-9.7,5.2c-3.5,0.8-7.2,1-10.7,1.8c-2.6,0.6-5.1,1.7-7.2,3.4c-1.8,1.5-3.3,3.5-4,5.8c-0.7,2.3-0.6,4.9,0.3,7.1
            c1.6,3.9,5.4,6.5,9.4,7.9c2.5,0.9,5.2,1.3,7.8,1.9c1.3,0.3,2.6,0.7,3.8,1.4c1.2,0.7,2.2,1.8,2.7,3.1c0.7,1.8,0.5,3.8,0.2,5.7
            c-0.5,2.9-1.3,5.9-0.7,8.8c0.4,2.1,1.6,4,3.2,5.4c1.6,1.3,3.5,2.2,5.5,2.8c4.1,1.2,8.5,1.4,12.8,0.8c4.3-0.6,8.4-2,12.3-3.8
            c2.4-1.1,4.8-2.4,6.9-4.1c1.9-1.5,3.6-3.3,5.4-5c1.9-1.8,3.9-3.5,6.3-4.6c3.2-1.5,6.8-1.9,10.3-2.2c1.8-0.2,3.6-0.3,5.3-0.8
            c1.8-0.5,3.4-1.3,4.9-2.4c1-0.7,1.8-1.6,2.3-2.7c0.5-1.1,0.5-2.3,0.1-3.4c-0.6-1.9-2.3-3.2-4-4.1c-1.7-0.9-3.6-1.5-5.4-2.2
            c-3.7-1.4-7.2-3.5-10-6.4c-0.7-0.7-1.3-1.5-1.8-2.3c-0.5-0.9-0.9-1.9-1-2.9c-0.1-1.4,0.3-2.8,0.9-4.1c1.7-3.7,5.3-6.1,8.3-8.7
            c1.2-1,2.4-2.1,3-3.6c0.5-1.4,0.4-3-0.2-4.3c-0.6-1.3-1.6-2.4-2.7-3.3c-1.8-1.4-3.9-2.3-6.1-2.7c-4.4-0.8-8.9,0.2-13,1.9
            c-2,0.9-4,1.9-6.1,2.4c-2.4,0.6-4.9,0.7-7.4,0.4c-1.4-0.2-2.7-0.5-4-1.1c-1.2-0.5-2.3-1.3-3.2-2.2c-0.9-0.9-1.7-2-2.5-3
            c-0.9-1.1-1.9-2.2-3.1-3C55.1,9.5,52.6,9.1,50.5,10.2z"
          />
          
          {/* Eye openings to create the negative space in the silhouette */}
          <path
            fill="#000" // Black for the eye opening (will be transparent with mask)
            d="M68,38c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2S68,36.9,68,38z"
          />
          
          {/* Ear notch */}
          <path
            fill="#3B82F6" // Same blue color
            d="M80,25c1.7,0.6,3.2,1.8,3.8,3.5c0.3,0.9,0.3,1.9,0.1,2.8c-0.5,1.7-2.1,2.9-3.8,3.3c-1.7,0.4-3.5,0.1-5-0.8
            c-1.5-0.9-2.5-2.4-2.8-4c-0.2-1.3,0.1-2.6,0.9-3.7c0.8-1.1,2-1.8,3.3-2.1C77.7,23.6,78.8,24.5,80,25z"
          />
          
          {/* Create a mask for the eye opening */}
          <mask id="eyeMask">
            <rect width="100" height="100" fill="white" />
            <circle cx="66" cy="38" r="2" fill="black" />
          </mask>
          
          {/* Apply the mask to create negative space for the eye */}
          <rect x="0" y="0" width="100" height="100" fill="transparent" mask="url(#eyeMask)" />
        </g>
      </svg>
      
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-semibold text-gray-900">Wolf</span>
          <span className="text-sm font-medium text-gray-700">Auto Marketer</span>
        </div>
      )}
    </div>
  );
}