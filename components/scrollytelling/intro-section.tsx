"use client";

import { useState } from "react";
import Image from "next/image";

interface IntroSectionProps {
  onStart: () => void;
  onStageChange?: (stage: "split" | "zoom" | "door" | "article") => void;
}

export function IntroSection({ onStart, onStageChange }: IntroSectionProps) {
  const [stage, setStage] = useState<"split" | "zoom" | "door" | "article">(
    "split"
  );

  const updateStage = (newStage: "split" | "zoom" | "door" | "article") => {
    setStage(newStage);
    onStageChange?.(newStage);
  };

  const handleStartClick = () => {
    updateStage("zoom");
  };

  const handleDoorClick = () => {
    updateStage("door");
    setTimeout(() => {
      updateStage("article");
    }, 1000);
  };

  return (
    <section
      className="relative w-full bg-[#FFF9B0]"
      style={{
        height: stage !== "article" ? "100vh" : "auto",
      }}
    >
      {/* Stage 1: Split Screen - always rendered, fades out */}
      <div 
        className={`absolute inset-0 flex h-screen transition-all duration-700 ease-in-out ${
          stage === "split" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
        }`}
      >
        {/* Left half - Title and decoration */}
        <div className="w-1/2 flex flex-col items-center justify-center px-8 py-32 bg-[#FFF986]">
          <div className="max-w-xl text-center">
            <h1 className="distressed-text text-4xl md:text-5xl font-black text-red-500 leading-none mb-8">
              What is
              <br />
              Environmental
              <br />
              Racism?
            </h1>

            <p className="text-sm md:text-base text-foreground mb-12 leading-relaxed">
              a story about highways, red lines, <br></br>and social
              determinants of health
            </p>

            <button
              onClick={handleStartClick}
              className="group inline-flex flex-col items-center gap-2 text-secondary hover:text-secondary/80 transition-colors cursor-pointer"
            >
              <Image
                src="/arrow.png"
                alt="Start"
                width={80}
                height={80}
                className="object-contain transition-transform group-hover:translate-x-2"
              />

              <span className="text-sm">Click to start</span>
            </button>

            <footer className="mt-16 flex flex-col items-center gap-2 text-sm">
              <span className="font-medium">by Felicia Yan</span>
              <a
                href="#about"
                className="text-secondary underline hover:text-secondary/80"
              >
                About
              </a>
            </footer>
          </div>
        </div>
        {/* Right half - Door with greenery */}
        <div className="w-1/2 relative overflow-hidden">
          {/* Doorway background image - entire door is clickable */}
          <button
            onClick={handleStartClick}
            className="absolute inset-0 w-full h-full cursor-pointer"
            aria-label="Click door to start"
          >
            <Image
              src="/doorway.png"
              alt="Doorway"
              fill
              className="object-cover"
              priority
            />
          </button>
        </div>
      </div>

      {/* Stage 2: Zoom Door to Center - fades in/out with smooth transition */}
      <div 
        className={`fixed inset-0 w-full h-screen transition-all duration-700 ease-in-out ${
          stage === "zoom" 
            ? "opacity-100 z-20" 
            : stage === "door" || stage === "article"
              ? "opacity-0 z-0 pointer-events-none"
              : "opacity-0 z-0 pointer-events-none"
        }`}
      >
        {/* Full screen doorway image - entire door is clickable */}
        <button
          onClick={handleDoorClick}
          className="absolute inset-0 w-full h-full cursor-pointer"
          aria-label="Click door to open"
        >
          <Image
            src="/doorway.png"
            alt="Doorway"
            fill
            className="object-cover"
            priority
          />
        </button>
        {/* Hint text */}
        <div 
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-foreground/60 text-sm bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full pointer-events-none transition-opacity duration-500 ${
            stage === "zoom" ? "opacity-100" : "opacity-0"
          }`}
        >
          Click the door to open
        </div>
      </div>

      {/* Stage 3: Highway reveal - crossfades from door, only during door stage */}
      <div 
        className={`fixed inset-0 w-full h-screen transition-all duration-1000 ease-in-out ${
          stage === "door"
            ? "opacity-100 z-30" 
            : "opacity-0 z-0 pointer-events-none"
        }`}
      >
        {/* Highway background */}
        <Image
          src="/highway.png"
          alt="Highway outside"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Stage 4: Article Content Begins */}
      {stage === "article" && (
        <div className="relative w-full">
          {/* Door open reveal - the highway scene */}
          <div className="min-h-screen w-full flex items-center justify-center px-6 py-12 relative">
            {/* Highway background */}
            <Image
              src="/highway.png"
              alt="Highway outside"
              fill
              className="object-cover"
              priority
            />
            {/* Back button - attached to this section */}
            <button
              onClick={() => updateStage("split")}
              className="absolute top-4 left-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all"
              aria-label="Back to start"
            >
              <div className="relative w-5 h-5" style={{ transform: 'scaleX(-1)' }}>
                <Image
                  src="/arrow.png"
                  alt="Back"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
            </button>
            <div className="max-w-3xl text-center relative z-10">
              <div className="mb-12 animate-in fade-in duration-500 delay-300">
                <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed bg-white/80 backdrop-blur-sm px-6 py-4 rounded-lg">
                  Woah, there&apos;s a highway right outside your doorstep!
                </p>
              </div>

              <div className="animate-in fade-in duration-500 delay-500">
                <p className="text-base text-foreground/80 leading-relaxed bg-white/80 backdrop-blur-sm px-6 py-4 rounded-lg">
                  That wasn't here yesterday. How did it get here? And why here,
                  of all places?
                </p>
              </div>

              <div className="mt-16 animate-in fade-in duration-500 delay-700 text-foreground/60 text-xs">
                <p className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full inline-block">Scroll to continue</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
