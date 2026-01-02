/**
 * Timeline JSON Format
 * 
 * Timeline is pure data - rendering is pure function(timeline, assets)
 * This enables: undo/redo, versioning, future collaboration
 */

export type VideoFormat = "9:16" | "16:9" | "1:1";

export interface Timeline {
  version: string; // Timeline format version
  format: VideoFormat;
  duration: number; // Total duration in seconds
  tracks: Track[];
  scenes: Scene[];
  settings: TimelineSettings;
}

export interface Track {
  id: string;
  type: "video" | "audio" | "subtitle";
  clips: Clip[];
  locked?: boolean;
  muted?: boolean;
  volume?: number; // 0-1
}

export interface Clip {
  id: string;
  clipId: string; // Reference to Clip model
  startTime: number; // Start time in timeline (seconds)
  duration: number; // Clip duration in timeline
  sourceStartTime?: number; // Start time in source video (for trimming)
  sourceEndTime?: number; // End time in source video (for trimming)
  transformations: Transformation[];
  position?: { x: number; y: number }; // For video tracks (positioning)
  scale?: number; // For video tracks (scaling)
  opacity?: number; // 0-1
  // Voice track support
  voiceId?: string; // Reference to Voice model
  voiceText?: string; // Text to synthesize
  voiceLanguage?: string; // Language for TTS
  voiceJobId?: string; // Job ID if voice is being generated
  // Face/Character binding
  characterId?: string; // Reference to Character model
  faceTrackId?: string; // Face track ID from detection (e.g., "face_1", "face_2")
  faceDetectionJobId?: string; // Job ID if face detection is in progress
}

export interface Transformation {
  type: 
    | "face_transform" 
    | "background_replace" 
    | "voice_replace" 
    | "lip_sync" 
    | "subtitle_add"
    | "crop"
    | "filter";
  jobId?: string; // Reference to Job if transformation is processing
  status?: "pending" | "processing" | "completed" | "failed";
  config: Record<string, any>; // Transformation-specific config
  appliedAt?: number; // Timestamp when applied
}

export interface Scene {
  id: string;
  name?: string;
  startTime: number; // Scene start in timeline
  duration: number; // Scene duration
  clips: string[]; // Clip IDs in this scene
  transitions: Transition[];
}

export interface Transition {
  type: "fade" | "crossfade" | "slide" | "wipe" | "none";
  duration: number; // Transition duration in seconds
  fromClipId?: string;
  toClipId?: string;
}

export interface TimelineSettings {
  fps: number; // Frames per second
  resolution: {
    width: number;
    height: number;
  };
  backgroundColor?: string; // Hex color
  audioSampleRate?: number;
  audioChannels?: number;
}

// Project Settings (stored in Project.settings JSON)
export interface ProjectSettings {
  autoSave: boolean;
  autoSaveInterval?: number; // seconds
  defaultFormat: VideoFormat;
  defaultFPS: number;
  watermark?: {
    enabled: boolean;
    text?: string;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  };
}

// Clip Metadata (stored in Clip.metadata JSON)
export interface ClipMetadata {
  duration: number; // Original clip duration
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate?: number;
  fileSize: number;
  uploadedAt: string; // ISO timestamp
  sourcePlatform?: string; // "youtube" | "rumble" | "twitter" | "tiktok" | "instagram" | "upload"
}

// Audio Track (stored in Clip.audioTrack JSON)
export interface AudioTrack {
  filePath: string; // S3 path to audio file
  duration: number;
  sampleRate: number;
  channels: number;
  volume: number; // 0-1
  voiceId?: string; // Reference to Voice if cloned
  modelVersion?: string; // TTS model version
}

// Subtitle Track (stored in Clip.subtitles JSON array)
export interface SubtitleTrack {
  id: string;
  language: string; // ISO 639-1 code
  filePath?: string; // S3 path to SRT/VTT file
  segments: SubtitleSegment[];
  translatedFrom?: string; // Original language if translated
}

export interface SubtitleSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

// Appearance Config (stored in Character.appearanceConfig JSON)
export interface AppearanceConfig {
  faceModel?: string;
  skinTone?: string;
  hairColor?: string;
  hairStyle?: string;
  clothing?: string;
  accessories?: string[];
  era?: string; // "ancient" | "medieval" | "modern" | etc.
  custom?: Record<string, any>;
}

