'use client';

import { useState, useEffect } from 'react';

export default function PopularBets() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Placeholder data - will be replaced by API call to /api/popular-bets
  const popularData = {
    sport: 'Football',
    team: 'Kansas City Chiefs',
    player: 'Patrick Mahomes'
  };

  const slides = [
    {
      title: 'Most Popular Sport',
      value: popularData.sport,
      icon: '🏈',
      gradient: 'from-blue-600 to-cyan-500',
      bgGradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      title: 'Most Popular Team',
      value: popularData.team,
      icon: '🏆',
      gradient: 'from-purple-600 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      title: 'Most Popular Player',
      value: popularData.player,
      icon: '⭐',
      gradient: 'from-orange-600 to-red-500',
      bgGradient: 'from-orange-500/20 to-red-500/20'
    }
  ];

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const goToSlide = (index) => {
    if (!isAnimating && index !== currentSlide) {
      setIsAnimating(true);
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, isAnimating]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Popular Bets
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
          Discover what the community is betting on right now
        </p>
      </div>

      {/* Carousel Container */}
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Slides */}
          <div className="relative h-96 md:h-[500px]">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  index === currentSlide
                    ? 'opacity-100 translate-x-0'
                    : index < currentSlide
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
                }`}
              >
                <div className={`h-full bg-gradient-to-br ${slide.bgGradient} flex flex-col items-center justify-center p-8`}>
                  {/* Icon */}
                  <div className="text-8xl md:text-9xl mb-8 animate-bounce-slow">
                    {slide.icon}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl font-semibold text-white/80 mb-4">
                    {slide.title}
                  </h2>

                  {/* Value */}
                  <div className={`bg-gradient-to-r ${slide.gradient} rounded-2xl px-8 py-6 shadow-xl transform hover:scale-105 transition-transform duration-300`}>
                    <p className="text-3xl md:text-5xl font-bold text-white text-center">
                      {slide.value}
                    </p>
                  </div>

                  {/* Stats Badge */}
                  <div className="mt-8 bg-black/30 backdrop-blur-sm rounded-full px-6 py-3">
                    <p className="text-white/90 text-sm font-medium">
                      🔥 Trending Now
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-3 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-3 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'w-12 h-3 bg-white'
                    : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Info Cards Below Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {slides.map((slide, index) => (
            <div
              key={index}
              onClick={() => goToSlide(index)}
              className={`cursor-pointer bg-white/10 backdrop-blur-lg rounded-xl p-6 border transition-all duration-300 hover:scale-105 hover:bg-white/15 ${
                index === currentSlide
                  ? 'border-white/40 shadow-lg'
                  : 'border-white/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{slide.icon}</div>
                <div>
                  <p className="text-white/70 text-sm font-medium">{slide.title}</p>
                  <p className="text-white font-bold text-lg">{slide.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}