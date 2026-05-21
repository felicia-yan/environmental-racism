"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
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
        overflow: "hidden",
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
          <div className="w-1/2 bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center relative overflow-hidden cursor-pointer group">
            {/* Decorative green leaf shapes */}
            <div className="absolute top-12 left-8 w-24 h-24 bg-green-300/40 rounded-full blur-xl"></div>
            <div className="absolute top-20 right-12 w-28 h-28 bg-green-200/50 rounded-full blur-2xl"></div>
            <div className="absolute bottom-16 left-1/4 w-32 h-32 bg-green-300/30 rounded-full blur-xl"></div>

            {/* Door */}
            <button
              onClick={handleStartClick}
              className="relative z-10 w-32 h-56 bg-amber-700 rounded-lg shadow-2xl border-4 border-amber-900 flex items-center justify-center hover:shadow-xl transition-shadow group"
            >
              {/* Door inner */}
              <div className="absolute inset-2 bg-gradient-to-br from-amber-600 to-amber-800 rounded-md"></div>

              {/* Door knob */}
              <div className="absolute right-4 w-4 h-4 bg-yellow-400 rounded-full shadow-md group-hover:scale-110 transition-transform"></div>
            </button>
          </div>
        </div>
      )}

      {/* Stage 2: Zoom Door to Center */}
      {stage === "zoom" && (
        <div className="fixed inset-0 w-full h-screen flex items-center justify-center z-20 animate-in fade-in duration-300 bg-gradient-to-br from-green-100 to-green-50">
          {/* Decorative green elements */}
          <div className="absolute top-20 left-1/4 w-48 h-48 bg-green-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-56 h-56 bg-green-200/40 rounded-full blur-3xl"></div>

          {/* Zoomed door */}
          <button
            onClick={handleDoorClick}
            className="relative z-10 w-48 h-96 bg-amber-700 rounded-lg shadow-2xl border-4 border-amber-900 flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors group animate-in zoom-in-50 duration-500"
          >
            {/* Door inner */}
            <div className="absolute inset-2 bg-gradient-to-br from-amber-600 to-amber-800 rounded-md"></div>

            {/* Door knob */}
            <div className="absolute right-6 w-5 h-5 bg-yellow-400 rounded-full shadow-md group-hover:scale-125 transition-transform"></div>

            {/* Subtle hint */}
            <div className="text-amber-900/40 text-xs group-hover:text-amber-900/60 transition-colors">
              Click handle
            </div>
          </button>
        </div>
      )}

      {/* Stage 3: Door Opens */}
      {stage === "door" && (
        <div className="fixed inset-0 w-full h-screen z-30 overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-gray-300 animate-in fade-in duration-500">
          {/* Door swinging open effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-96 bg-amber-700 rounded-lg border-4 border-amber-900 animate-out slide-out-to-left duration-500"></div>
          </div>
        </div>
      )}

      {/* Stage 4: Article Content Begins */}
      {stage === "article" && (
        <div
          className="relative w-full bg-gradient-to-r from-green-50 via-[#F5F1E8] to-green-50"
          style={{ overflow: "auto" }}
        >
          {/* Door open reveal - stays on screen */}
          <div className="min-h-screen w-full flex items-center justify-center px-6 py-12 bg-gradient-to-b from-sky-300 to-green-50">
            <div className="max-w-3xl text-center">
              <div className="mb-12 animate-in fade-in duration-500 delay-300">
                <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed">
                  Woah, there&apos;s a highway right outside your doorstep!
                </p>
              </div>

              <div className="animate-in fade-in duration-500 delay-500">
                <p className="text-base text-foreground/80 leading-relaxed">
                  That wasn't here yesterday. How did it get here? And why here,
                  of all places?
                </p>
              </div>

              <div className="mt-16 animate-in fade-in duration-500 delay-700 text-foreground/60 text-xs">
                <p>Scroll to continue</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
