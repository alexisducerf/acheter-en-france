import { useStore } from '@nanostores/react';
import { completedTasks, totalTasks } from '../stores/search';

const ProgressBar = () => {
  const $completedTasks = useStore(completedTasks);
  const $totalTasks = useStore(totalTasks);
  const progress = Math.min(100, ($completedTasks / $totalTasks) * 100);

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div className="h-full bg-accent transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
    </div>
  );
};

export default ProgressBar;
