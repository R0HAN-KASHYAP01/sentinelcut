'use client';
import { useState, useRef } from 'react';
export function TranscriptView({ transcript, detections, onSelectDetection, selectedDetectionId }) {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 leading-loose text-lg">
      {transcript.map((item, index) => {
        // Check if this word falls within any active detection range
        const matchingDetection = detections.find(
          (d) => d.status !== 'removed' && item.start >= d.start && item.end <= d.end
        );

        if (matchingDetection) {
          return (
            <DetectionHighlight
              key={index}
              detection={matchingDetection}
              isSelected={selectedDetectionId === matchingDetection.id}
              onClick={onSelectDetection}
            >
              {item.word}
            </DetectionHighlight>
          );
        }

        return (
          <span key={index} className="mx-1 text-gray-800 dark:text-gray-200">
            {item.word}
          </span>
        );
      })}
    </div>
  );
}