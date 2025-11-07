import { X, PlayCircle } from 'lucide-react';

type Props = {
  onClose: () => void;
};

export const TutorialModal = ({ onClose }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card border shadow-2xl rounded-2xl w-[92%] max-w-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Welcome to Rabbit Feed Tycoon</h2>
          <button className="p-2 rounded hover:bg-muted" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Grow a rabbit colony by managing food, water, housing, and smart upgrades.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Press <b>Next Day</b> to earn coins from your rabbits. 🐰</li>
            <li>Keep enough <b>food</b> and <b>water</b> each day to sustain the colony. 🥕</li>
            <li>Buy <b>houses</b> to raise capacity. Breeding can add more rabbits. 🏠</li>
            <li>Buy <b>upgrades</b> to boost coins, breeding, and efficiency. Events can help or hinder. 🏗️</li>
            <li>Receive various boosts or penalties from <b> random events</b>. 📈</li>
          </ul>
          <p>If your empire starts starving you can always restart and try a new strategy.</p>
        </div>
        <button
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 w-full"
          onClick={onClose}
        >
          <PlayCircle className="w-4 h-4" /> Start Playing
        </button>
      </div>
    </div>
  );
}
