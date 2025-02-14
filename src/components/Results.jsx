import { useStore } from '@nanostores/react';
import { isLoaded, isLoading, hasErrors, durationPerDestination, codeInsee, geoGasparRisks, sismicRisks, soilPollution, legislativesElectionResults, presidentElectionResults} from '../stores/search';
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
  const $legislativesElectionResults = useStore(legislativesElectionResults);
  const $presidentElectionResults = useStore(presidentElectionResults);

  console.log('Results:', $legislativesElectionResults, $presidentElectionResults);
  

  let content = null;

  if ($isLoading) {
     content = <p className="text-gray-600">Recherche en cours...</p>; 
  } else if ($hasErrors) {
    content = <p className="text-red-600">{error}</p>
  }

   const elements = [
    {
      title: 'Durée et distance',
      content: $durationPerDestination.map((dest, i) => (
        <p key={i}>{dest.city} ({dest.postalCode}) - <strong>{dest.duration}</strong> (<i>{dest.distance} kms</i>)</p>
      ))
    }, {
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
      title: 'Élections',
      content: (
        <div className="space-y-6">
          {$presidentElectionResults && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-700">Présidentielles 2022</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-600 mb-2">Participation</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Inscrits: {$presidentElectionResults.participation.inscrits}</li>
                    <li>Votants: {$presidentElectionResults.participation.votants}</li>
                    <li>Exprimés: {$presidentElectionResults.participation.exprimes}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-600 mb-2">Résultats</h4>
                  <ul className="space-y-1 text-sm">
                    {$presidentElectionResults.candidats
                      .sort((a, b) => b.voix - a.voix)
                      .map((candidat, i) => (
                        <li key={i} className={i < 3 ? 'font-medium' : ''}>
                          {candidat.nom} {candidat.prenom}: {candidat.voix} voix ({candidat.pourcentage}%)
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            </div>
          )}

          {$legislativesElectionResults && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-700">Législatives 2022</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-600 mb-2">Participation</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Inscrits: {$legislativesElectionResults.participation.inscrits}</li>
                    <li>Votants: {$legislativesElectionResults.participation.votants}</li>
                    <li>Exprimés: {$legislativesElectionResults.participation.exprimes}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-600 mb-2">Résultats</h4>
                  <ul className="space-y-1 text-sm">
                    {$legislativesElectionResults.candidats
                      .sort((a, b) => b.voix - a.voix)
                      .map((candidat, i) => (
                        <li key={i} className={i < 3 ? 'font-medium' : ''}>
                          {candidat.nom} {candidat.prenom} ({candidat.nuance}): {candidat.voix} voix ({candidat.pourcentage_voix_exprimes}%)
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            </div>
          )}
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
