import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isLoaded, isLoading, hasErrors, durationPerDestination, codeInsee, geoGasparRisks, sismicRisks, soilPollution, 
  legislativesElectionResults, presidentElectionResults, legislativesElectionResults2024, inseeData, totalTasks, completedTasks} from '../stores/search';
import Accordions from './Accordions';
import ProgressBar from './ProgressBar';
import LoadingSpinner from './Spinner';

const Results = () => {

  const $isLoading = useStore(isLoading);
  const $isLoaded = useStore(isLoaded);
  const $hasErrors = useStore(hasErrors);
  const $durationPerDestination = useStore(durationPerDestination);
  const $geoGasparRisks = useStore(geoGasparRisks);
  const $sismicRisks = useStore(sismicRisks);
  const $soilPollution = useStore(soilPollution);
  const soilPollutionTotal = $soilPollution || {number: 0, elements: ''};
  const $legislativesElectionResults = useStore(legislativesElectionResults);
  const $presidentElectionResults = useStore(presidentElectionResults);
  const $legislativesElectionResults2024 = useStore(legislativesElectionResults2024);
  const $inseeData = useStore(inseeData);
  const $totalTasks = useStore(totalTasks);
  const $completedTasks = useStore(completedTasks);

  const isDataLoaded = (data) => {
    return data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);
  };

  const [elements, setElements] = useState([]);

  useEffect(() => {
    setElements([
      {
        title: 'Durée et distance',
        content: isDataLoaded($durationPerDestination) ? 
          <div className="space-y-2">
            {$durationPerDestination.map((dest, i) => (
              <p key={i}>{dest.city} ({dest.postalCode}) - <strong>{dest.duration}</strong> (<i>{dest.distance} kms</i>)</p>
            ))}
          </div> : 
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
      },
      {
        title: 'Risques',
        content: $geoGasparRisks || $sismicRisks || $soilPollution ? (
          <div className="space-y-4">
            <div>
              <strong>Risques Généraux</strong>: {$geoGasparRisks || <LoadingSpinner />}
            </div>
            <div>
              <strong>Risque Sismique:</strong> {$sismicRisks || <LoadingSpinner />}
            </div>
            <div>
              <strong>{soilPollutionTotal.number} risques de Pollution des Sols:</strong>{' '}
              {soilPollutionTotal.elements || <LoadingSpinner />}
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        )
      },
      {
        title: 'Élections',
        content: (
          <div className="space-y-6">
            {$presidentElectionResults ? (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">Présidentielles 2022</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-600 mb-2">Participation</h4>
                    <ul className="space-y-1 text-sm">
                      <li>Inscrits: {$presidentElectionResults.participation.inscrits}</li>
                      <li>Votants: {$presidentElectionResults.participation.votants}</li>
                      <li>Exprimés: {$presidentElectionResults.participation.exprimes}</li>
                      <li>Abstentions: {$presidentElectionResults.participation.abstentions}</li>
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
            ) : <LoadingSpinner />}

            {$legislativesElectionResults ? (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">Législatives 2022</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-600 mb-2">Participation</h4>
                    <ul className="space-y-1 text-sm">
                      <li>Inscrits: {$legislativesElectionResults.participation.inscrits}</li>
                      <li>Votants: {$legislativesElectionResults.participation.votants}</li>
                      <li>Exprimés: {$legislativesElectionResults.participation.exprimes}</li>
                      <li>Abstentions: {$legislativesElectionResults.participation.abstentions}</li>
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
            ) : <LoadingSpinner />}
            
            {$legislativesElectionResults2024 ? (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">Législatives 2024</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-600 mb-2">Participation</h4>
                    <ul className="space-y-1 text-sm">
                      <li>Inscrits: {$legislativesElectionResults2024.participation.inscrits}</li>
                      <li>Votants: {$legislativesElectionResults2024.participation.votants}</li>
                      <li>Exprimés: {$legislativesElectionResults2024.participation.exprimes}</li>
                      <li>Abstentions: {$legislativesElectionResults2024.participation.abstentions}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-600 mb-2">Résultats</h4>
                    <ul className="space-y-1 text-sm">
                      {$legislativesElectionResults2024.candidats
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
            ) : <LoadingSpinner />}
          </div>
        )
      },
      {
        title: 'Données INSEE',
        content: $inseeData ? (
          <div className="space-y-12">
            {Object.entries($inseeData).map(([tableName, tableData]) => (
              <div key={tableName} className="space-y-4 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 pb-2 border-b border-gray-200">
                  {tableName}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200">
                      {tableData.map((row, rowIndex) => (
                        <tr 
                          key={rowIndex}
                          className={`
                            ${rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                            hover:bg-gray-100 transition-colors
                          `}
                        >
                          {row.map((cell, cellIndex) => (
                            <td 
                              key={cellIndex}
                              className={`
                                px-6 py-3 text-sm whitespace-nowrap
                                ${cellIndex === 0 
                                  ? 'font-medium text-gray-700 bg-gray-50'
                                  : 'text-gray-600'}
                                ${cellIndex === 0 ? 'border-r border-gray-200' : ''}
                              `}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : <LoadingSpinner />
      }
    ]);
  }, [
    $durationPerDestination,
    $geoGasparRisks,
    $sismicRisks,
    $soilPollution,
    $presidentElectionResults,
    $legislativesElectionResults,
    $legislativesElectionResults2024,
    $inseeData
  ]);

  // Add a check for search being initiated
  const hasSearchStarted = $isLoading || $isLoaded || $hasErrors;

  if(hasSearchStarted) {
    return (
      <>
        {$isLoading && <ProgressBar />}
        <div id="search-results" className="w-full p-6 bg-white rounded-lg shadow-lg mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Résultats de recherche
          </h2>
          {$isLoading && (
            <div className="text-gray-600 mb-4">
              <p>Chargement des données...</p>
              {/*<p className="text-sm mt-1">Progression : {$completedTasks}/{$totalTasks} tâches complétées</p>*/}
            </div>
          )}
          {$hasErrors && <p className="text-red-600 mb-4">{$hasErrors}</p>}
          {($isLoading || $isLoaded) && <Accordions elements={elements} />}
        </div>
      </>
    );
  } 
};

export default Results;
