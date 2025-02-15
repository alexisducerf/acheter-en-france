import { atom } from 'nanostores';

export const isLoading = atom(false);
export const isLoaded = atom(false);
export const hasErrors = atom(false);
export const durationPerDestination = atom([]);
export const codeInsee = atom(null);
export const sismicRisks = atom(null);
export const soilPollution = atom(null);
export const geoGasparRisks = atom(null);
export const legislativesElectionResults = atom(null);
export const presidentElectionResults = atom(null);
export const legislativesElectionResults2024 = atom(null);
export const inseeData = atom(null);

export const totalTasks = atom(13); // Nombre total de tâches
export const completedTasks = atom(0); // Tâches complétées

// Dans vos fonctions de recherche, mettez à jour completedTasks
export const incrementCompletedTasks = () => {
  completedTasks.set(completedTasks.get() + 1);
};