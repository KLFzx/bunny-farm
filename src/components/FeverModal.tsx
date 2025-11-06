import { useGame } from '@/contexts/GameContext';
import { ShieldAlert, Syringe, Skull } from 'lucide-react';

interface FeverModalProps {
  onClose: () => void;
}

export const FeverModal = ({ onClose }: FeverModalProps) => {
  const { cureFeverWithCost, isolateAllInfected, gameState } = useGame();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-card border border-red-700/50 shadow-2xl rounded-2xl w-[92%] max-w-md p-5 text-center">
        <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
          <Skull className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-red-700">Rabbit Fever Outbreak</h2>
        <div className="text-sm text-left text-muted-foreground mt-3 space-y-2">
          <p>💀 A contagious fever is spreading through your colony and will last for <strong>30 days</strong>. During this time, <strong>water consumption is doubled</strong> when feeding carrots.</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
              Infected: <strong>{gameState.infectedIds?.length || 0}</strong>
            </span>
          </div>
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200/40 dark:border-red-800/40 rounded-lg p-3">
            <p className="font-semibold text-red-700 dark:text-red-300 mb-1">Your options:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium text-foreground">Isolate</span>: Quarantine infected rabbits. The fever will end after 30 days; all infected rabbits will be removed at the end.</li>
              <li><span className="font-medium text-foreground">Cure</span>: Spend 70% of your current coins to end the fever immediately and save all rabbits.</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              isolateAllInfected();
              onClose();
            }}
          >
            <ShieldAlert className="w-4 h-4" /> Isolate
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white"
            onClick={() => {
              cureFeverWithCost(0.7);
              onClose();
            }}
          >
            <Syringe className="w-4 h-4" /> Cure
          </button>
        </div>
      </div>
    </div>
  );
}
