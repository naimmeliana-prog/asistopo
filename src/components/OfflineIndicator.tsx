import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle } from "lucide-react";

interface OfflineIndicatorProps {
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
}

export default function OfflineIndicator({
  isSimulatedOffline,
  onToggleSimulatedOffline,
}: OfflineIndicatorProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Simulate automatic sync when connection is detected (switching simulated offline to online)
  useEffect(() => {
    if (!isSimulatedOffline) {
      setIsSyncing(true);
      const timer = setTimeout(() => {
        setIsSyncing(false);
        setLastSynced(new Date().toLocaleTimeString());
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSimulatedOffline]);

  const handleManualSync = () => {
    if (isSimulatedOffline) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced(new Date().toLocaleTimeString());
    }, 1200);
  };

  if (!isSimulatedOffline) {
    return null; // Return nothing when online, keeping the interface completely clean as requested by the user
  }

  return (
    <div
      id="offline-indicator"
      className="bg-amber-50 text-amber-800 border-b border-amber-200 text-xs"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <WifiOff className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>
            <strong>Modo de Estudio Local Activo:</strong> Todo el temario y los exámenes de la base de datos están listos para acceso 100% autónomo.
          </span>
        </div>

        <button
          id="btn-toggle-offline-mode"
          onClick={onToggleSimulatedOffline}
          className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 shadow-xs transition-all cursor-pointer"
        >
          Volver a Modo Online
        </button>
      </div>
    </div>
  );
}
