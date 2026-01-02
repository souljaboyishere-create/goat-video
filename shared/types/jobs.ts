/**
 * Job Types and Interfaces
 * Matches Prisma schema and worker contract
 */

export type JobType =
  | "video_download"
  | "clip_edit"
  | "face_transform"
  | "voice_clone"
  | "lip_sync"
  | "subtitle_generate"
  | "background_replace"
  | "render";

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface Job {
  id: string;
  userId: string;
  projectId?: string;
  type: JobType;
  status: JobStatus;
  input: JobInput;
  output?: JobOutput;
  error?: string;
  progress: number; // 0-100
  idempotencyKey?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

// Job Input Types (by job type)
export interface VideoDownloadInput {
  url: string;
  platform?: "youtube" | "rumble" | "twitter" | "tiktok" | "instagram";
  quality?: "best" | "worst" | "720p" | "1080p";
  format?: "mp4" | "webm";
}

export interface ClipEditInput {
  clipId: string;
  startTime: number;
  endTime: number;
  crop?: { x: number; y: number; width: number; height: number };
  filters?: string[];
}

export interface FaceTransformInput {
  clipId: string;
  videoPath: string;
  characterId?: string; // Optional - can bind character after detection
  frameSampling?: number; // Process every Nth frame (default: 1)
  minConfidence?: number; // Minimum detection confidence (default: 0.5)
  // Phase 1: Detection only
  // Phase 2: Will add transformation parameters
}

export interface VoiceCloneInput {
  sourceAudio: string; // S3 path to reference audio
  text: string;
  language: string;
  emotion?: string;
  style?: string;
  voiceId?: string; // Use existing voice profile
}

export interface LipSyncInput {
  videoPath: string; // S3 path to video
  audioPath: string; // S3 path to audio
  clipId: string;
}

export interface SubtitleGenerateInput {
  clipId: string;
  language?: string; // Auto-detect if not provided
  translateTo?: string[]; // Array of target languages
}

export interface BackgroundReplaceInput {
  clipId: string;
  backgroundType: "image" | "video" | "generated";
  backgroundSource?: string; // S3 path or prompt
  prompt?: string; // For AI-generated backgrounds
}

export interface RenderInput {
  projectId: string;
  timeline: any; // Timeline JSON from Project
  format: "9:16" | "16:9" | "1:1";
  resolution?: string; // e.g., "1920x1080"
  watermark?: boolean;
  quality?: "low" | "medium" | "high";
}

export type JobInput =
  | VideoDownloadInput
  | ClipEditInput
  | FaceTransformInput
  | VoiceCloneInput
  | LipSyncInput
  | SubtitleGenerateInput
  | BackgroundReplaceInput
  | RenderInput;

// Job Output Types (all include modelVersion for AI jobs)
export interface VideoDownloadOutput {
  filePath: string; // S3 path
  duration: number;
  width: number;
  height: number;
  fileSize: number;
  thumbnailPath?: string;
}

export interface ClipEditOutput {
  filePath: string;
  duration: number;
}

export interface FaceTransformOutput {
  filePath: string; // S3 path to JSON metadata file
  facesDetected: number;
  uniqueTracks: number; // Number of unique face tracks
  duration: number;
  modelVersion: string; // e.g., "insightface-buffalo_l"
  // JSON file contains: detections, tracks, embeddings, metadata
}

export interface VoiceCloneOutput {
  filePath: string;
  duration: number;
  modelVersion: string; // e.g., "xtts-v2" or "yourtts-v1"
  sampleRate: number;
  voiceEmbedding?: number[]; // For reuse
}

export interface LipSyncOutput {
  filePath: string;
  duration: number;
  modelVersion: string; // e.g., "wav2lip-v1.0"
}

export interface SubtitleGenerateOutput {
  filePath: string; // SRT/VTT file
  language: string;
  segments: Array<{
    startTime: number;
    endTime: number;
    text: string;
  }>;
  modelVersion: string; // e.g., "whisper-large-v3"
  translations?: Record<string, string>; // language -> filePath
}

export interface BackgroundReplaceOutput {
  filePath: string;
  duration: number;
  modelVersion?: string; // If AI-generated
}

export interface RenderOutput {
  filePath: string; // S3 path to rendered video
  thumbnailPath: string; // S3 path to thumbnail
  duration: number;
  fileSize: number; // Bytes
  format: string; // "9:16" | "16:9" | "1:1"
  resolution: string; // e.g., "1920x1080"
  watermark?: boolean; // Whether watermark was applied
}

export type JobOutput =
  | VideoDownloadOutput
  | ClipEditOutput
  | FaceTransformOutput
  | VoiceCloneOutput
  | LipSyncOutput
  | SubtitleGenerateOutput
  | BackgroundReplaceOutput
  | RenderOutput;

// Worker Contract Types
export interface WorkerExecuteRequest {
  jobId: string;
  type: JobType;
  input: JobInput;
}

export interface WorkerExecuteResponse {
  jobId: string;
  status: "accepted" | "rejected";
  message?: string;
}

export interface WorkerStatusUpdate {
  jobId: string;
  progress: number; // 0-100
  status: JobStatus;
  output?: JobOutput;
  error?: string;
}

export interface WorkerHealthResponse {
  status: "healthy" | "unhealthy";
  gpu_available?: boolean;
  model_loaded?: boolean;
  version?: string;
}

