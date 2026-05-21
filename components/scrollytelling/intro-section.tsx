"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface IntroSectionProps {
  onStart: () => void;
}

export function IntroSection({ onStart }: IntroSectionProps) {
  const [stage, setStage] = useState<"split" | "zoom" | "door" | "article">(
    "split"
  );




  const handleStartClick = () => {
    setStage("zoom");
  };

  const handleDoorClick = () => {
    setStage("door");
    setTimeout(() => {
      setStage("article");
    }, 800);
  };

  return (
    <section
      className="relative w-full bg-[#FFF9B0]"
      style={{
        height: stage !== "article" ? "100vh" : "auto",
      }}
    >
      {/* Stage 1: Split Screen */}
      {stage === "split" && (
        <div className="flex h-screen">
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
            {/* Doorway background image */}
            <Image
              src="/doorway.png"
              alt="Doorway"
              fill
              className="object-cover"
              priority
            />
            {/* Clickable door handle - positioned over the handle in the image */}
            <button
              onClick={handleStartClick}
              className="absolute cursor-pointer group"
              style={{
                left: '56%',
                top: '52%',
                width: '8%',
                height: '8%',
              }}
              aria-label="Click door handle to start"
            >
              {/* Subtle highlight effect on hover */}
              <div className="w-full h-full rounded-full bg-yellow-300/0 group-hover:bg-yellow-300/40 group-hover:shadow-lg group-hover:shadow-yellow-300/50 transition-all duration-300 animate-pulse" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 2: Zoom Door to Center */}
      {stage === "zoom" && (
        <div className="fixed inset-0 w-full h-screen z-20 animate-in fade-in duration-300">
          {/* Full screen doorway image */}
          <Image
            src="/doorway.png"
            alt="Doorway"
            fill
            className="object-cover animate-in zoom-in-105 duration-500"
            priority
          />
          {/* Clickable door handle - positioned over the handle in the zoomed image */}
          <button
            onClick={handleDoorClick}
            className="absolute cursor-pointer group"
            style={{
              left: '54%',
              top: '50%',
              width: '6%',
              height: '8%',
            }}
            aria-label="Click door handle to open"
          >
            {/* Highlight effect on hover */}
            <div className="w-full h-full rounded-full bg-yellow-300/0 group-hover:bg-yellow-300/50 group-hover:shadow-lg group-hover:shadow-yellow-300/60 transition-all duration-300 animate-pulse" />
          </button>
          {/* Hint text */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-foreground/60 text-sm bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full">
            Click the door handle
          </div>
        </div>
      )}

      {/* Stage 3: Door Opens */}
      {stage === "door" && (
        <div className="fixed inset-0 w-full h-screen z-30 overflow-hidden animate-in fade-in duration-300">
          {/* Highway background revealed */}
          <Image
            src="/highway.png"
            alt="Highway outside"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

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
              onClick={() => setStage("split")}
              className="absolute top-4 left-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all"
              aria-label="Back to start"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
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
