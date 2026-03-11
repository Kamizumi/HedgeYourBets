"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Array of images to cycle through
const backgroundImages = [
    '/images/image_dd33ff.jpg', // Stadium
    'https://via.placeholder.com/1920x900/181818/999999?text=NFL+MATCHUP+SHOT', 
    'https://via.placeholder.com/1920x900/181818/999999?text=NBA+FEATURED+GAME',
];
const cycleInterval = 7000; // Change image every 7 seconds

export default function RotatingHeroBackground() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                (prevIndex + 1) % backgroundImages.length
            );
        }, cycleInterval);

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(timer);
    }, []); // Empty dependency array ensures this runs once

    return (
        <div className="relative h-[85vh] w-full flex items-center justify-center mb-12 overflow-hidden">
            
            {/* Image Backdrop Carousel */}
            {backgroundImages.map((src, index) => (
                <div 
                    key={index}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000`}
                    style={{ 
                        backgroundImage: `url('${src}')`,
                        opacity: index === currentIndex ? 1 : 0, // Only show the current image
                    }}
                >
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-black/60"></div> 
                </div>
            ))}
            
            {/* Centered Content Overlay (Static) */}
            <div className="relative z-10 max-w-4xl text-center p-8">
                
                <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-6">
                    Beat the Bookies.
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-300 mb-10">
                    Leverage proprietary machine learning models to identify high-value betting opportunities and maximize your edge.
                </p>
                
                {/* START PREDICTING Button */}
                <Link
                    href="/get-started" 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 
                                hover:from-blue-600 hover:to-purple-600 
                                text-white font-bold py-4 px-12 rounded-xl 
                                text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                    START PREDICTING
                </Link>
            </div>
        </div>
    );
}