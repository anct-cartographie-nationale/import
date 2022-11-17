/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */

import { LieuxMediationNumeriqueMatching, Source } from '../../input';

const communes: Commune[] = require('../../../../assets/data/communes.json');

type Commune = { Nom_commune: string; Code_postal: number };

export type CleanOperation = {
  name: string;
  selector: RegExp;
  field: string;
  negate?: boolean;
  fix?: (toFix: string, source?: Source) => string;
};

const FIX_WRONG_ACCENT_CHARS_IN_COMMUNE = (matching: LieuxMediationNumeriqueMatching): CleanOperation => ({
  name: 'replace ╢ with Â',
  selector: /╢/u,
  field: matching.commune.colonne,
  fix: (toFix: string): string => toFix.replace('╢', 'Â')
});

const FIX_MULTILINES_IN_VOIE = (matching: LieuxMediationNumeriqueMatching): CleanOperation => ({
  name: 'replace \\n with space',
  selector: /\n/u,
  field: matching.voie.colonne ?? '',
  fix: (toFix: string): string => toFix.replace('\n', ' ')
});

const toCommuneName = (commune: Commune): string => commune.Nom_commune.toLowerCase();

const formatToCommuneNameData = (commune: string): string =>
  commune.toLowerCase().replace('saint', 'st').replace(/['-]/gu, ' ');

const formatCodePostal = (codePostal: string): string => (codePostal.length === 4 ? `0${codePostal}` : codePostal);

const ofMatchingCommuneName =
  (matchingCommuneName: string) =>
  (communeName: string): boolean =>
    communeName === formatToCommuneNameData(matchingCommuneName);

const findCodePostal = (matchingCommuneName: string): string =>
  communes[communes.map(toCommuneName).findIndex(ofMatchingCommuneName(matchingCommuneName))]?.Code_postal.toString() ?? '';

const codePostalFromCommune = (commune: string): string => formatCodePostal(findCodePostal(commune));

const processCodePostal = (source: Source, matching: LieuxMediationNumeriqueMatching): string =>
  (source[matching.code_postal.colonne] ?? '') === ''
    ? codePostalFromCommune(source[matching.commune.colonne] ?? '')
    : source[matching.code_postal.colonne] ?? '';

const throwMissingFixRequiredDataError = (): string => {
  throw new Error('Missing fix required data');
};

const FIX_MISSING_CODE_POSTAL = (matching: LieuxMediationNumeriqueMatching): CleanOperation => ({
  name: 'missing code postal',
  selector: /^$/u,
  field: matching.code_postal.colonne,
  fix: (_: string, source?: Source): string =>
    source == null ? throwMissingFixRequiredDataError() : processCodePostal(source, matching)
});

export const CLEAN_OPERATIONS = (matching: LieuxMediationNumeriqueMatching): CleanOperation[] => [
  FIX_WRONG_ACCENT_CHARS_IN_COMMUNE(matching),
  FIX_MISSING_CODE_POSTAL(matching),
  FIX_MULTILINES_IN_VOIE(matching)
];
