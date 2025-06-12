"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, Play, Pause, RotateCcw } from "lucide-react";

export default function AnimatedTranscript({ transcription }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  
  const words = transcription ? transcription.split(' ') : [];
  const animationSpeed = 250; // milliseconds per word

  useEffect(() => {
    let interval;
    
    if (isAnimating && currentWordIndex < words.length) {
      interval = setInterval(() => {
        setCurrentWordIndex(prev => {
          const nextIndex = prev + 1;
          const wordsToShow = words.slice(0, nextIndex);
          setDisplayedText(wordsToShow.join(' '));
          
          if (nextIndex >= words.length) {
            setIsAnimating(false);
          }
          
          return nextIndex;
        });
      }, animationSpeed);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnimating, currentWordIndex, words.length]);

  const handleViewTranscript = () => {
    setShowTranscript(true);
    setCurrentWordIndex(0);
    setDisplayedText('');
    setIsAnimating(true);
  };

  const handlePauseResume = () => {
    setIsAnimating(!isAnimating);
  };

  const handleRestart = () => {
    setCurrentWordIndex(0);
    setDisplayedText('');
    setIsAnimating(true);
  };

  const handleClose = () => {
    setShowTranscript(false);
    setIsAnimating(false);
    setCurrentWordIndex(0);
    setDisplayedText('');
  };

  if (!transcription) return null;

  return (
    <div>
      {!showTranscript ? (
        <Button
          size="sm"
          variant="outline"
          onClick={handleViewTranscript}
          className="mt-2"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          View Transcript
        </Button>
      ) : (
        <div className="mt-3 border rounded-lg bg-background">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Transcript</span>
              
            </div>
            
            <div className="flex items-center gap-1">
              {showTranscript && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePauseResume}
                    className="h-8 w-8 p-0"
                  >
                    {isAnimating ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRestart}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClose}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                ×
              </Button>
            </div>
          </div>

          {/* Animated text content */}
          <div className="p-4 min-h-[120px]">
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground leading-relaxed m-0">
                <span className='text-xs'>{displayedText}</span>
                {isAnimating && (
                  <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse" />
                )}
              </p>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-300 ease-out"
                  style={{ 
                    width: `${(currentWordIndex / words.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

