import { atom } from 'nanostores';

export const isLoading = atom(false);
export const isLoaded = atom(false);
export const hasErrors = atom(false);
export const durationPerDestination = atom([]);
export const codeInsee = atom(null);
export const sismicRisks = atom(null);
export const soilPollution = atom(null);
export const geoGasparRisks = atom(null);
