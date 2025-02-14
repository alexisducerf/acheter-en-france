import { useStore } from '@nanostores/react';
import { isLoaded, isLoading, hasErrors} from '../stores/search';

const Results = () => {

  const $isLoading = useStore(isLoading);
  const $isLoaded = useStore(isLoaded);
  const $hasErrors = useStore(hasErrors);

  if ($isLoading) {
    return (
      <div className="w-full lg:basis-1/2 p-6 bg-white rounded-lg shadow-lg mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Recherche par localisation
        </h2>
        <p className="text-gray-600">Recherche en cours...</p>
      </div>
    );
  } else if ($isLoaded) {
    return (
      <div className="w-full lg:basis-1/2 p-6 bg-white rounded-lg shadow-lg mt-6">
        TROUVÉ
      </div>
    );
  } else if ($hasErrors) {
    return (
      <div className="w-full lg:basis-1/2 p-6 bg-white rounded-lg shadow-lg mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Recherche par localisation
        </h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  } else {
    return <></>;
  }
};

export default Results;