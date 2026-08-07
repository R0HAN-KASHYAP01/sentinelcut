// src/lib/constants.js

export function getConfidenceStyle(score) {
  if (score >= 0.85) {
    return { color: 'accent-rose', fill: true, label: 'High confidence' };
  }
  if (score >= 0.60) {
    return { color: 'accent-amber', fill: true, label: 'Medium confidence — review suggested' };
  }
  if (score >= 0.30) {
    return { color: 'accent-amber', fill: false, label: 'Low confidence — likely needs review' };
  }
  return { color: 'text-secondary', fill: false, dotted: true, label: 'Very low confidence' };
}

export const ACCEPTED_UPLOAD_FORMATS = ['.mp4', '.mp3', '.wav']; // MVP scope — expand later if time allows
export const MAX_UPLOAD_MB = 500;