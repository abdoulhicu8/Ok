import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
  Check,
  Sparkles,
} from "lucide-react";

interface AudioPlayerProps {
  audioSrc: string;
  filename: string;
  word: string;
  languageName: string;
  voiceName: string;
  duration?: number;
  instructions?: string;
  onDownload?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioSrc,
  filename,
  word,
  languageName,
  voiceName,
  instructions,
  onDownload,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = playbackRate;
    audio.loop = isLooping;
    audio.volume = isMuted ? 0 : volume;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    // Auto-play when new audio source is loaded
    audio.play().then(() => setIsPlaying(true)).catch(() => {
      // Browsers can block autoplay without user interaction, which is fine
      setIsPlaying(false);
    });

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioSrc]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const toggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    if (audioRef.current) {
      audioRef.current.loop = next;
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (audioRef.current) {
      audioRef.current.muted = next;
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = audioSrc;
    link.download = filename || `pronounce-${word.toLowerCase().slice(0, 15)}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    if (onDownload) onDownload();
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // 24 simulated waveform bar heights for visual fidelity
  const waveformBars = [
    28, 45, 65, 85, 95, 75, 55, 90, 100, 80, 60, 92, 70, 50, 85, 95, 60, 40,
    75, 90, 55, 35, 20, 10,
  ];

  return (
    <div
      id="active-audio-player"
      className="bg-stone-900 text-stone-100 rounded-2xl p-6 shadow-xl border border-stone-800"
    >
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full">
              Generated Audio
            </span>
            <span className="text-xs text-stone-400 font-medium">
              {languageName} • Voice: {voiceName}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>&ldquo;{word}&rdquo;</span>
          </h3>
          {instructions && (
            <p className="text-xs text-stone-400 mt-1 line-clamp-1 italic">
              <span className="text-stone-500 not-italic">Instruction: </span>
              {instructions}
            </p>
          )}
        </div>

        {/* Primary Download Button */}
        <button
          id="btn-download-audio"
          onClick={handleDownload}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md ${
            downloadSuccess
              ? "bg-emerald-600 text-white"
              : "bg-emerald-500 hover:bg-emerald-400 text-stone-950 hover:shadow-emerald-500/20 active:scale-95"
          }`}
          title="Download audio as standard WAV file"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Downloaded!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Audio (.wav)</span>
            </>
          )}
        </button>
      </div>

      {/* Waveform Visualization */}
      <div className="flex items-center justify-between gap-1.5 h-14 px-2 my-4 bg-stone-950/70 rounded-xl border border-stone-800/80">
        {waveformBars.map((heightPercent, idx) => {
          const barProgress = (idx / waveformBars.length) * (duration || 1);
          const isPassed = currentTime >= barProgress;
          return (
            <div
              key={idx}
              onClick={() => {
                const targetTime = (idx / waveformBars.length) * duration;
                if (audioRef.current) {
                  audioRef.current.currentTime = targetTime;
                  setCurrentTime(targetTime);
                }
              }}
              className="flex-1 flex items-center justify-center h-full cursor-pointer group"
            >
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[6px] rounded-full transition-all duration-150 ${
                  isPassed
                    ? "bg-emerald-400"
                    : "bg-stone-700 group-hover:bg-stone-500"
                } ${isPlaying && isPassed ? "opacity-100" : "opacity-75"}`}
              />
            </div>
          );
        })}
      </div>

      {/* Time Scrubber */}
      <div className="space-y-1 mb-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
        />
        <div className="flex justify-between text-xs text-stone-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls & Speed Options */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          {/* Main Play/Pause Button */}
          <button
            id="btn-toggle-play"
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Loop Button */}
          <button
            onClick={toggleLoop}
            className={`p-2.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isLooping
                ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                : "bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200"
            }`}
            title="Loop playback"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Loop</span>
          </button>

          {/* Volume Mute */}
          <button
            onClick={toggleMute}
            className="p-2.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Speed Selector Chips */}
        <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
          <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold px-2">
            Speed
          </span>
          {[0.5, 0.75, 1, 1.25, 1.5].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                playbackRate === speed
                  ? "bg-stone-700 text-white shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
