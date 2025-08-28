"use client";

import { useEffect, useState } from "react";

export default function CallTranscription() {
  const [transcripts, setTranscripts] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "final_transcript") {
        setTranscripts((prev) => [
          ...prev,
          {
            speaker: data.speaker, // 0 or 1 (or undefined)
            text: data.text,
            timestamp: data.timestamp,
            turnId: data.turnId,
          },
        ]);
      }
    };

    return () => ws.close();
  }, []);

  // Map speaker index to label and color
  const getSpeakerLabel = (speaker) => {
    if (speaker === 0) return { label: "Caller", color: "text-blue-600" };
    if (speaker === 1) return { label: "Agent", color: "text-green-600" };
    return { label: "Unknown", color: "text-gray-600" };
  };

  return (
    <div className="p-4 h-[400px] overflow-y-auto border rounded">
      <h2 className="font-bold mb-4">Live Transcript</h2>
      <div className="space-y-3">
        {transcripts.map(({ speaker, text, turnId }, idx) => {
          const { label, color } = getSpeakerLabel(speaker);
          return (
            <div key={turnId || idx} className="flex gap-3">
              <span className={`font-semibold ${color}`}>{label}:</span>
              <p>{text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
