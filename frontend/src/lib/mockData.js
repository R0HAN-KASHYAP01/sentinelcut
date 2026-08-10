export const mockTranscript = [
  { word: "This", start: 0.0, end: 0.5 },
  { word: "movie", start: 0.6, end: 1.0 },
  { word: "is", start: 1.1, end: 1.4 },
  { word: "fuuuuck", start: 1.5, end: 2.1 }, 
  { word: "amazing", start: 2.2, end: 2.8 },
  { word: "but", start: 2.9, end: 3.1 },
  { word: "the", start: 3.2, end: 3.4 },
  { word: "bakchodi", start: 3.5, end: 4.1 }, 
  { word: "is", start: 4.2, end: 4.4 },
  { word: "too", start: 4.5, end: 4.7 },
  { word: "much", start: 4.8, end: 5.0 },
];

export const mockDetections = [
  {
    id: "det_001",
    word: "fuuuuck",
    normalized: "fuck",
    language: "english",
    start: 1.5,
    end: 2.1,
    source: "dictionary", 
    confidence: 0.95,     
    replacement: "beep",
    status: "active"
  },
  {
    id: "det_002",
    word: "bakchodi",
    normalized: "bakchodi",
    language: "hinglish",
    start: 3.5,
    end: 4.1,
    source: "model",      
    confidence: 0.65,     
    replacement: "mute",
    status: "active"
  }
];
