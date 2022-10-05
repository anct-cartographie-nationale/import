export type CleanOperation = {
  selector: RegExp;
  fix: (...matches: string[]) => string;
};

const REMOVE_WHITE_SPACES: CleanOperation = {
  selector: /\s/gu,
  fix: (): string => ''
};

const REMOVE_ADDITIONAL_INFORMATION_TEXT: CleanOperation = {
  selector: /[a-zA-ZÀ-ú\s]{2}[a-zA-ZÀ-ú\s]*$/u,
  fix: (): string => ''
};

const FORMAT_HOURS_SEPARATOR: CleanOperation = {
  selector: /[à/–]|et/gu,
  fix: (): string => '-'
};

/** @example 09:- OR 09:-13: */
const FORMAT_HOURS_WITH_TIME_SEPARATOR_BUT_NO_MINUTES: CleanOperation = {
  selector: /(?<startHour>[012]?\d):-(?:(?<endHour>[012]?\d):$)?/u,
  fix: (_: string, startHour: string, endHour?: string): string =>
    `-${startHour}:00-${endHour === undefined ? '' : `${endHour}:00`}`
};

/** @example 09h30-12- OR 08:00-12- */
const FORMAT_MISSING_END_HOUR_MINUTES_WITH_TIME_SEPARATOR: CleanOperation = {
  selector: /(?<startHour>[012]?\d)[h:](?<startMinute>\d\d)-(?<endHour>[012]?\d)-/gu,
  fix: (_: string, startHour: string, startMinute: string, endHour: string): string =>
    `${startHour}:${startMinute}-${endHour}:00`
};

/** @example 09h12h OR 09h12h30 */
const FORMAT_START_HOUR_WITHOUT_MINUTES_NO_SEPARATOR: CleanOperation = {
  selector: /(?<startHour>[012]?\d)h(?<endHour>[012]?\d)h(?<endMinute>\d\d)?/gu,
  fix: (_: string, startHour: string, endHour: string, endMinute?: string): string =>
    `${startHour}:00-${endHour}${endMinute === undefined ? ':00' : `:${endMinute}`}`
};

/** @example 09h00-13h30 */
const FORMAT_HOURS_WITH_LETTER_SEPARATOR: CleanOperation = {
  selector: /(?<startHour>[012]?\d)h(?<startMinute>\d\d)-(?<endHour>[012]?\d)h(?<endMinute>\d\d)/gu,
  fix: (_: string, startHour: string, startMinute: string, endHour: string, endMinute: string): string =>
    `${startHour}-${startMinute}-${endHour}-${endMinute}`
};

/** @example 09h00 OR 09h */
const FORMAT_WRONG_HOUR_MINUTE_SEPARATOR: CleanOperation = {
  selector: /(?<hour>[012]?\d)h(?<minute>\d\d)?/gu,
  fix: (_: string, hour: string, minute?: string): string => `${hour}:${minute === undefined ? '00' : minute}`
};

export const CLEAN_OPERATIONS: CleanOperation[] = [
  REMOVE_WHITE_SPACES,
  REMOVE_ADDITIONAL_INFORMATION_TEXT,
  FORMAT_HOURS_SEPARATOR,
  FORMAT_HOURS_WITH_TIME_SEPARATOR_BUT_NO_MINUTES,
  FORMAT_MISSING_END_HOUR_MINUTES_WITH_TIME_SEPARATOR,
  FORMAT_START_HOUR_WITHOUT_MINUTES_NO_SEPARATOR,
  FORMAT_HOURS_WITH_LETTER_SEPARATOR,
  FORMAT_WRONG_HOUR_MINUTE_SEPARATOR
];
