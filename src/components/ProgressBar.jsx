import { useStore } from '@nanostores/react';
import {completedTasks, totalTasks} from '../stores/search';

const ProgressBar = () => {
  const $completedTasks = useStore(completedTasks);
  const $totalTasks = useStore(totalTasks);
  const progress = ($completedTasks / $totalTasks) * 100;
  
  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div
        className="h-full bg-blue-500 transition-all duration-300 ease-out shadow-[0_2px_8px_rgba(59,130,246,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;