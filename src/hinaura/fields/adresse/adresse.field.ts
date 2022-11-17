/* eslint-disable @typescript-eslint/naming-convention, camelcase */

import { Adresse, OptionalPropertyError } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { HinauraLieuMediationNumerique } from '../../../hinaura/helper';
import { cannotApplyFix, cannotFixAdresse, formatCommune, formatVoie, Recorder } from '../../../tools';
import { CLEAN_OPERATIONS, CleanOperation } from './clean-operations';

type FixedAdresse = HinauraLieuMediationNumerique | undefined;

const toLieuxMediationNumeriqueAdresse = (hinauraLieuMediationNumerique: HinauraLieuMediationNumerique): Adresse =>
  Adresse({
    code_postal: hinauraLieuMediationNumerique['Code postal'],
    commune: formatCommune(hinauraLieuMediationNumerique['Ville *']),
    voie: formatVoie(hinauraLieuMediationNumerique['Adresse postale *'])
  });

const testCleanSelector = (cleanOperation: CleanOperation, property?: string): boolean =>
  property != null && new RegExp(cleanOperation.selector, 'u').test(property);

const shouldApplyFix = (cleanOperation: CleanOperation, property?: string): boolean =>
  cleanOperation.negate === true ? !testCleanSelector(cleanOperation, property) : testCleanSelector(cleanOperation, property);

const applyUpdateFix =
  (recorder: Recorder) =>
  (
    cleanOperation: CleanOperation & { fix: (toFix: string) => string },
    valueToFix: string,
    hinauraLieuMediationNumerique: HinauraLieuMediationNumerique
  ): HinauraLieuMediationNumerique => {
    const cleanValue: string = cleanOperation.fix(valueToFix, hinauraLieuMediationNumerique);
    recorder.fix({
      apply: cleanOperation.name,
      before: valueToFix,
      after: cleanValue
    });
    return {
      ...hinauraLieuMediationNumerique,
      ...{
        [cleanOperation.field]: cleanValue
      }
    };
  };

const canFix = (cleanOperation: CleanOperation): cleanOperation is CleanOperation & { fix: (toFix: string) => string } =>
  cleanOperation.fix != null;

const applyCleanOperation =
  (recorder: Recorder) =>
  (
    cleanOperation: CleanOperation,
    valueToFix: string,
    hinauraLieuMediationNumerique: HinauraLieuMediationNumerique
  ): HinauraLieuMediationNumerique =>
    canFix(cleanOperation)
      ? applyUpdateFix(recorder)(cleanOperation, valueToFix, hinauraLieuMediationNumerique)
      : cannotApplyFix<HinauraLieuMediationNumerique>();

const toFixedAdresse =
  (recorder: Recorder) =>
  (hinauraLieuMediationNumerique: HinauraLieuMediationNumerique) =>
  (
    adresse: HinauraLieuMediationNumerique | undefined,
    cleanOperation: CleanOperation
  ): HinauraLieuMediationNumerique | undefined =>
    adresse == null && shouldApplyFix(cleanOperation, hinauraLieuMediationNumerique[cleanOperation.field].toString())
      ? applyCleanOperation(recorder)(
          cleanOperation,
          hinauraLieuMediationNumerique[cleanOperation.field].toString(),
          hinauraLieuMediationNumerique
        )
      : adresse;

const retryOrThrow =
  (recorder: Recorder) =>
  (fixedAdresse: FixedAdresse, error: unknown): Adresse =>
    fixedAdresse == null ? cannotFixAdresse<Adresse>(error) : processAdresse(recorder)(fixedAdresse);

const fixAndRetry =
  (recorder: Recorder) =>
  (hinauraLieuMediationNumerique: HinauraLieuMediationNumerique, error: unknown): Adresse =>
    retryOrThrow(recorder)(CLEAN_OPERATIONS.reduce(toFixedAdresse(recorder)(hinauraLieuMediationNumerique), undefined), error);

export const processAdresse =
  (recorder: Recorder) =>
  (hinauraLieuMediationNumerique: HinauraLieuMediationNumerique): Adresse => {
    try {
      return toLieuxMediationNumeriqueAdresse(hinauraLieuMediationNumerique);
    } catch (error: unknown) {
      error instanceof OptionalPropertyError && recorder.record(error.key, error.message);
      return fixAndRetry(recorder)(hinauraLieuMediationNumerique, error);
    }
  };