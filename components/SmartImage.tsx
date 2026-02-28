import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    lowResSrc?: string; // Optional low-resolution fallback for blur-up
    alt: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
    src,
    lowResSrc,
    alt,
    className = '',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string>(lowResSrc || '');

    useEffect(() => {
        // Si pas de lowResSrc, on affiche directement l'image quand elle est chargée
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setCurrentSrc(src);
            setIsLoaded(true);
        };
    }, [src]);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Background Skeleton while loading */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-slate-200 animate-pulse rounded-inherit" />
            )}

            <motion.img
                src={currentSrc || src} // Fallback to src if no lowResSrc provided initially
                alt={alt}
                initial={{ filter: 'blur(10px)', opacity: lowResSrc ? 1 : 0 }}
                animate={{
                    filter: isLoaded ? 'blur(0px)' : 'blur(10px)',
                    opacity: isLoaded ? 1 : (lowResSrc ? 1 : 0)
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`w-full h-full object-cover ${className}`}
                {...props}
            />
        </div>
    );
};
