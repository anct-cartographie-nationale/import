import { Localisation } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { Colonne, Dissociation, LieuxMediationNumeriqueMatching, Source } from '../../input';

const isColonne = (colonneToTest: Partial<Colonne> & Partial<Dissociation>): colonneToTest is Colonne =>
  colonneToTest.colonne != null;

const dissocier = (source: Source, coordonnee: Dissociation & Partial<Colonne>): string | undefined =>
  source[coordonnee.dissocier.colonne]?.split(coordonnee.dissocier.séparateur)[coordonnee.dissocier.partie];

const latitudeField = (source: Source, latitude: Dissociation & Partial<Colonne>): string | undefined =>
  isColonne(latitude) ? source[latitude.colonne] : dissocier(source, latitude);

const longitudeField = (source: Source, longitude: Dissociation & Partial<Colonne>): string | undefined =>
  isColonne(longitude) ? source[longitude.colonne] : dissocier(source, longitude);

export const processLocalisation = (source: Source, matching: LieuxMediationNumeriqueMatching): Localisation =>
  Localisation({
    latitude: +(latitudeField(source, matching.latitude) ?? 0),
    longitude: +(longitudeField(source, matching.longitude) ?? 0)
  });
