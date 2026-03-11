"use client";

import { useState } from 'react';

// --- Image Modal Component ---
const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose} // Closes modal when clicking outside
        >
            <div 
                className="relative bg-gray-900 rounded-xl p-6 shadow-2xl max-w-4xl max-h-[90vh] w-11/12 md:w-3/4"
                onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
            >
                <h3 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Enlarged View</h3>
                
                {/* The main enlarged image */}
                <div className="w-full h-auto flex items-center justify-center">
                    <img 
                        src={imageUrl} 
                        alt="Enlarged Content Card" 
                        // object-contain ensures the full high-res image is visible within the modal
                        className="max-w-full max-h-[70vh] object-contain rounded-lg" 
                    />
                </div>
                
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-white text-3xl font-light hover:text-red-500 transition-colors"
                    aria-label="Close"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};
// -------------------------------------------------------------


// --- ContentRow Component (Client-side) ---
export default function ContentRow({ title, cardDataArray }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const scrollContainerRef = useState(null)[0];

    // Function now accepts the modalImagePath (the high-resolution path)
    const handleCardClick = (modalPath) => {
        setSelectedImage(modalPath);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    const scroll = (direction) => {
        if (typeof document === 'undefined') return;
        const container = document.getElementById(`scroll-${title.replace(/\s+/g, '-')}`);
        if (container) {
            const scrollAmount = 400;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="space-y-4 relative group">
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            
            {/* Left Arrow */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                aria-label="Scroll left"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Right Arrow */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                aria-label="Scroll right"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
            </button>
            
            <div id={`scroll-${title.replace(/\s+/g, '-')}`} className="flex space-x-4 overflow-x-scroll pb-4 custom-scrollbar">
                
                {cardDataArray.map((card, index) => (
                    <div 
                        key={index}
                        className="flex-shrink-0 w-80 h-60 bg-gray-800 rounded-lg overflow-hidden 
                                   cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-xl"
                        // Passes the specific modal image path when clicked
                        onClick={() => handleCardClick(card.modalImagePath)} 
                    >
                        {/* --- IMAGE CONTAINER: Uses the thumbnailImagePath for the card background --- */}
                        <div 
                            // Uses the new thumbnailImagePath property
                            className="w-full h-full bg-cover bg-center bg-white bg-no-repeat" 
                            style={{ 
                                backgroundImage: `url(${card.thumbnailImagePath})`,
                            }}
                            role="img"
                            aria-label={`Showcase image ${index + 1}`}
                        >
                        </div>
                    </div>
                ))}
            </div>

            {/* Render the Modal */}
            <ImageModal 
                imageUrl={selectedImage} 
                onClose={handleCloseModal} 
            />
        </div>
    );
}