/**
 * Face Detection and Tracking Types
 * Used for face detection worker output and character binding
 */

export interface FaceDetection {
  frameNumber: number;
  timestamp: number; // Time in seconds
  faces: DetectedFace[];
}

export interface DetectedFace {
  trackId: string; // Persistent face track ID (e.g., "face_1", "face_2")
  boundingBox: BoundingBox;
  confidence: number; // 0-1
  embedding?: number[]; // Face embedding vector (for identity matching)
  landmarks?: FaceLandmarks; // Facial landmarks
  attributes?: FaceAttributes; // Age, gender, etc. (if available)
}

export interface BoundingBox {
  x: number; // Top-left X coordinate
  y: number; // Top-left Y coordinate
  width: number;
  height: number;
}

export interface FaceLandmarks {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose: { x: number; y: number };
  mouthLeft: { x: number; y: number };
  mouthRight: { x: number; y: number };
}

export interface FaceAttributes {
  age?: number;
  gender?: "male" | "female" | "unknown";
  emotion?: string;
}

export interface FaceTrack {
  trackId: string; // Persistent ID across frames
  startFrame: number;
  endFrame: number;
  startTime: number; // Start time in seconds
  endTime: number; // End time in seconds
  boundingBoxes: Map<number, BoundingBox>; // Frame number -> bounding box
  embeddings: number[][]; // Embeddings per frame (for averaging)
  averageEmbedding?: number[]; // Averaged embedding for identity
  metadata: {
    totalFrames: number;
    confidence: number; // Average confidence
    characterId?: string; // Bound to character if assigned
  };
}

export interface FaceDetectionOutput {
  videoPath: string;
  detections: FaceDetection[]; // Per-frame detections
  tracks: FaceTrack[]; // Persistent face tracks
  metadata: {
    totalFrames: number;
    fps: number;
    duration: number;
    facesDetected: number;
    uniqueTracks: number;
    modelVersion: string; // e.g., "insightface-v1"
    detectionConfig: {
      minConfidence: number;
      frameSampling?: number; // Process every Nth frame
    };
  };
  filePath: string; // S3 path to JSON metadata file
}

