import { useStore } from '@nanostores/react';
import { isLoaded, isLoading, hasErrors, durationPerDestination, codeInsee, geoGasparRisks, sismicRisks, soilPollution} from '../stores/search';
import Accordions from './Accordions';

const Results = () => {

  const $isLoading = useStore(isLoading);
  const $isLoaded = useStore(isLoaded);
  const $hasErrors = useStore(hasErrors);
  const $durationPerDestination = useStore(durationPerDestination);
  const $codeInsee = useStore(codeInsee);
  const $geoGasparRisks = useStore(geoGasparRisks);
  const $sismicRisks = useStore(sismicRisks);
  const $soilPollution = useStore(soilPollution);
  const soilPollutionTotal = $soilPollution || {number: 0, elements: ''};

  let content = null;

  if ($isLoading) {
     content = <p className="text-gray-600">Recherche en cours...</p>; 
  } else if ($hasErrors) {
    content = <p className="text-red-600">{error}</p>
  }

   const elements = [
    {
      title: 'Durée et distance',
      content: $durationPerDestination.map((dest, i) => <p key={i}>{dest.city} ({dest.postalCode}) - <strong>{dest.duration}</strong> (<i>{dest.distance} kms</i>)   </p>)
    }, 
    {
      title: 'Risques ',
      content: (
        <div className="space-y-4">
          <p>
            <strong>Risques Généraux</strong>: {$geoGasparRisks}
          </p>
          <p>
            <strong>Risque Sismique:</strong> {$sismicRisks}
          </p>
          <p>
            <strong>{soilPollutionTotal.number} risques de Pollution des Sols:</strong>{' '}
            {soilPollutionTotal.elements}
          </p>
        </div>
      )
    },
    {
      title: 'INSEE',
      content: 'Code de la Commune: ' + $codeInsee
    },
  ];

  if($isLoaded || $hasErrors || $isLoading) { 
    return (
      <div id="search-results" className="w-full  p-6 bg-white rounded-lg shadow-lg mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Recherche par localisation
        </h2>
        {content}
        {$isLoaded && <Accordions elements={elements} /> }   
      </div>
    );
  }
};

export default Results;
