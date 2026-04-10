import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Layers } from 'lucide-react';
import { useBuildingContext } from '../../../context/BuildingContext';
import type { Building } from '../types/building.type';

interface BuildingCarousel3DProps {
  buildings: Building[];
  onSelectBuilding: (buildingId: string) => void;
}

export const BuildingCarousel3D: React.FC<BuildingCarousel3DProps> = ({ buildings, onSelectBuilding }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const { setActiveBuildingImage } = useBuildingContext();

  // Update context when active building changes
  useEffect(() => {
    if (buildings[activeIndex]) {
      setActiveBuildingImage(buildings[activeIndex].image);
    }
  }, [activeIndex, buildings, setActiveBuildingImage]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % buildings.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + buildings.length) % buildings.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleCardClick = (index: number) => {
    const position = (index - activeIndex + buildings.length) % buildings.length;
    const totalCards = buildings.length;
    const isActive = position === 0;

    if (isActive) {
      // Center card - navigate to building detail using name, not id
      onSelectBuilding(buildings[index].name);
    } else if (position === 1 || (position === totalCards - 1 && activeIndex === 0)) {
      // Right card - go next
      handleNext();
    } else if (position === totalCards - 1 || (position === 1 && activeIndex === totalCards - 1)) {
      // Left card - go prev
      handlePrev();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const offset = e.clientX - dragStartX;
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100; // minimum drag distance to trigger change

    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        // Dragged right - go to previous
        handlePrev();
      } else {
        // Dragged left - go to next
        handleNext();
      }
    }

    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const getCardStyle = (index: number) => {
    const position = (index - activeIndex + buildings.length) % buildings.length;
    const totalCards = buildings.length;

    // Center card
    if (position === 0) {
      return {
        transform: 'translateX(0) translateZ(0) rotateY(0deg) scale(1.1)',
        opacity: 1,
        zIndex: 50,
        filter: 'brightness(1)',
      };
    }

    // Right card
    if (position === 1 || (position === totalCards - 1 && activeIndex === 0)) {
      return {
        transform: 'translateX(45%) translateZ(-250px) rotateY(-35deg) scale(0.85)',
        opacity: 0.7,
        zIndex: 30,
        filter: 'brightness(0.7)',
      };
    }

    // Left card
    if (position === totalCards - 1 || (position === 1 && activeIndex === totalCards - 1)) {
      return {
        transform: 'translateX(-45%) translateZ(-250px) rotateY(35deg) scale(0.85)',
        opacity: 0.7,
        zIndex: 30,
        filter: 'brightness(0.7)',
      };
    }

    // Hidden cards
    return {
      transform: 'translateX(0) translateZ(-400px) scale(0.5)',
      opacity: 0,
      zIndex: 10,
      filter: 'brightness(0.5)',
    };
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Animated Background - Changes with active building */}
      <div className="absolute inset-0 z-0">
        {buildings.map((building, index) => (
          <div
            key={building.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeIndex ? 'opacity-100' : 'opacity-0'
              }`}
          >
            {/* Background Image with Blur */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-110"
              style={{
                backgroundImage: `url(${building.image})`,
                filter: 'blur(15px) brightness(0.8)',
              }}
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/50" />
          </div>
        ))}
      </div>

      {/* 3D Perspective Container */}
      <div
        className="relative z-10 w-full h-full flex items-center justify-center"
        style={{ perspective: '2000px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transform: isDragging ? `translateX(${dragOffset * 0.3}px)` : 'translateX(0)',
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          {buildings.map((building, index) => {
            const isActive = index === activeIndex;
            const style = getCardStyle(index);
            const position = (index - activeIndex + buildings.length) % buildings.length;

            return (
              <div
                key={building.id}
                className="absolute w-[500px] h-[500px] transition-all duration-700 ease-out"
                style={{
                  ...style,
                  cursor: position === 0 ? 'pointer' : 'pointer',
                  userSelect: 'none'
                }}
                onClick={() => handleCardClick(index)}
              >
                {/* Card Container with Glassmorphism */}
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl group">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img
                      src={building.image}
                      alt={building.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  </div>

                  {/* Content Overlay */}
                  <div className="relative h-full flex flex-col justify-end p-8 z-10">
                    {/* Top Badge */}
                    <div className="absolute top-6 left-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
                        <MapPin className="h-4 w-4 text-white" />
                        <span className="text-white text-sm font-semibold">FPT University</span>
                      </div>
                    </div>

                    {/* Room Count Badge */}
                    <div className="absolute top-6 right-6">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                        <Layers className="h-4 w-4 text-white" />
                        <span className="text-white text-sm font-bold">{building.roomCount} Rooms</span>
                      </div>
                    </div>

                    {/* Building Info */}
                    <div className="space-y-3">
                      <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                        <span className="text-white/80 text-xs font-medium uppercase tracking-wider">
                          {building.id}
                        </span>
                      </div>

                      <h2 className="text-4xl font-black text-white leading-tight">
                        {building.name}
                      </h2>

                      <p className="text-white/90 text-lg font-medium">
                        {building.description}
                      </p>

                      {/* Action Button - Only show on active card */}
                      {isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBuilding(String(building.id));
                          }}
                          className="mt-4 px-6 py-3 rounded-full bg-white text-gray-900 font-bold text-sm
                                   hover:bg-orange-500 hover:text-white transition-all duration-300
                                   shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2 w-fit"
                        >
                          Explore Building
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-3xl ring-4 ring-orange-500/50 ring-offset-4 ring-offset-transparent 
                                  pointer-events-none transition-all duration-300"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={handlePrev}
        disabled={isAnimating}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-[60] p-4 rounded-full 
                 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl
                 hover:bg-white/20 transition-all duration-300 disabled:opacity-50
                 hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>

      <button
        onClick={handleNext}
        disabled={isAnimating}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-[60] p-4 rounded-full 
                 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl
                 hover:bg-white/20 transition-all duration-300 disabled:opacity-50
                 hover:scale-110 active:scale-95"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] flex gap-2">
        {buildings.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true);
                setActiveIndex(index);
                setTimeout(() => setIsAnimating(false), 600);
              }
            }}
            className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex
              ? 'w-8 bg-white'
              : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BuildingCarousel3D;
