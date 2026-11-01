import React, { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-contain'
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  // If no source provided or failed to load, show beautiful styled fallback
  if (!src || hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FFFDF7] to-[#F5ECCE] p-4 text-center rounded-xl select-none">
        <div className="w-12 h-12 rounded-full bg-[#123D24]/10 text-[#123D24] flex items-center justify-center mb-2 shadow-xs">
          <Leaf className="w-6 h-6 text-[#56783B]" />
        </div>
        <span className="text-xs font-bold text-[#123D24] line-clamp-1">{alt}</span>
        <span className="text-[10px] text-[#56783B] font-medium uppercase tracking-wider mt-0.5">
          Real Ingredients
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};
