import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AmbientAudioPlayerProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export const AmbientAudioPlayer: React.FC<AmbientAudioPlayerProps> = ({
  isPlaying,
  onToggle,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onToggle}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 relative group ${
          isPlaying
            ? 'bg-[#164e28] text-white ring-4 ring-[#164e28]/20 shadow-[#164e28]/30'
            : 'bg-white hover:bg-stone-50 text-[#78716C] border border-surface-border'
        }`}
        title={isPlaying ? 'Silenciar música ambiental' : 'Reproducir música ambiental'}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-5 h-5 text-emerald-300" />
            {/* Visualizer bars indicator */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </>
        ) : (
          <VolumeX className="w-5 h-5" />
        )}

        {/* Floating Tooltip */}
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 rounded-full text-[11px] font-medium bg-stone-900 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
          {isPlaying ? 'Música zen botánica activa' : 'Reproducir música relajante'}
        </span>
      </button>
    </div>
  );
};
