import { useStore } from '@nanostores/react';
import { isLoaded, isLoading, hasErrors, durationPerDestination} from '../stores/search';

const Results = () => {

  const $isLoading = useStore(isLoading);
  const $isLoaded = useStore(isLoaded);
  const $hasErrors = useStore(hasErrors);
  const $durationPerDestination = useStore(durationPerDestination);

  let content = null;

  console.log($durationPerDestination);
  

  if ($isLoading) {
     content = <p className="text-gray-600">Recherche en cours...</p>; 
  } else if ($isLoaded) {
    content = <p className="text-gray-600">{
      $durationPerDestination.map(dest => <p>{dest.city} ({dest.postalCode}) - <strong>{dest.duration}</strong> (<i>{dest.distance} kms</i>)   </p>)
      }</p>; 
  } else if ($hasErrors) {
    content = <p className="text-red-600">{error}</p>
  }

  if($isLoaded || $hasErrors || $isLoading) { 
    return (
      <div className="w-full  p-6 bg-white rounded-lg shadow-lg mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Recherche par localisation
        </h2>
          {content}
      </div>
    );
  }
};

export default Results;