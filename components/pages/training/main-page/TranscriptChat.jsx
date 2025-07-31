"use client";
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TranscriptChat({
  transcriptData = [],
  trainingData = null,
  userProfile,
}) {
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [showTimestamps, setShowTimestamps] = useState(true);

  // Parse transcript data from different sources
  const parseTranscriptData = () => {
    console.log("Raw transcriptData:", transcriptData);
    console.log("Raw trainingData:", trainingData);

    // If trainingData is provided, parse its transcript
    if (trainingData && trainingData.transcript) {
      try {
        const parsed =
          typeof trainingData.transcript === "string"
            ? JSON.parse(trainingData.transcript)
            : trainingData.transcript;
        console.log("Parsed training transcript:", parsed);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("Error parsing training transcript:", error);
        return sampleData;
      }
    }

    // Handle transcriptData - could be string or array
    if (transcriptData) {
      try {
        if (typeof transcriptData === "string") {
          const parsed = JSON.parse(transcriptData);
          console.log("Parsed transcriptData:", parsed);
          return Array.isArray(parsed) ? parsed : [];
        } else if (Array.isArray(transcriptData) && transcriptData.length > 0) {
          console.log("Using array transcriptData:", transcriptData);
          return transcriptData;
        }
      } catch (error) {
        console.error("Error parsing transcriptData:", error);
        return sampleData;
      }
    }

    // Return sample data if nothing provided or parsing failed
    console.log("Using sample data");
    return sampleData;
  };

  // Format time from milliseconds to MM:SS
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };




  const data = parseTranscriptData();

return (
  <div className="flex flex-col bg-muted/30 rounded relative overflow-hidden">
    {/* Header */}

    {/* Chat Area with Masking */}
    <ScrollArea className="h-full relative">
      {/* Top Fade Mask */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-muted to-transparent z-10 pointer-events-none" />
      
      {/* Bottom Fade Mask */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-muted to-transparent z-10 pointer-events-none" />


      <div className="max-w-4xl mx-auto py-6 px-6 space-y-6 relative z-0">
        {data.map((segment, index) => {
          const isUserA = segment.speaker === "A";
        

          return (
            <div
              key={index}
              className={`flex gap-4 transition-all duration-300 ease-in-out ${
                isUserA ? "flex-row-reverse" : "flex-row"
              }`}
              style={{
                // Staggered entrance animation
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Avatar */}
              <Avatar
                className={`w-10 h-10 transition-all duration-200 hover:scale-105 ${
                  isUserA ? "" : "border-secondary bg-secondary"
                }`}
              >
                {isUserA && (
                  <AvatarImage
                    src={userProfile.imageUrl}
                    alt="user avatar"
                  />
                )}
                <AvatarFallback
                  className={
                    isUserA
                      ? "text-background bg-primary"
                      : "text-background bg-secondary"
                  }
                >
                  {isUserA ? "U" : "AI"}
                </AvatarFallback>
              </Avatar>

              {/* Message Container */}
              <div
                className={`flex flex-col max-w-2xl transition-all duration-300 ${
                  isUserA ? "items-end" : "items-start"
                }`}
              >
                {/* Speaker Info */}
                <div
                  className={`flex items-center gap-2 mb-2 transition-opacity duration-200 ${
                    isUserA ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    {isUserA ? userProfile.firstname : "AI Prospect"}
                  </span>
                  {showTimestamps && (
                    <>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <span className="text-xs text-gray-500">
                        {formatTime(segment.start)}
                      </span>
                    </>
                  )}
                </div>

                {/* Message Bubble with Enhanced Masking */}
                <div
                  className={`group relative px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-0.5 ${
                    isUserA
                      ? "bg-primary text-white rounded-br-md hover:bg-primary/90"
                      : "bg-white text-gray-900 border border-gray-200 rounded-bl-md hover:border-gray-300 hover:bg-gray-50"
                  } ${
                    selectedSegment === index
                      ? "ring-2 ring-blue-400 ring-offset-2 shadow-lg scale-[1.02]"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedSegment(
                      selectedSegment === index ? null : index
                    )
                  }
                >
                  <p className="text-sm leading-relaxed transition-all duration-200">
                    {segment.text}
                  </p>
                  
                  {/* Hover overlay mask */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  </div>
);
}
