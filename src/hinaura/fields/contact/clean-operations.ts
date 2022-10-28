type HinauraEmail =
  "Email (éviter les emails nominatifs - en cas d'email nominitatif seule la personne concernée est autorisé à l'ajouter)";

export type CleanOperation = {
  name: string;
  selector: RegExp;
  field: HinauraEmail | 'Site Web' | 'Téléphone';
  negate?: boolean;
  fix?: (toFix: string) => string;
};

export const EMAIL_FIELD: HinauraEmail =
  "Email (éviter les emails nominatifs - en cas d'email nominitatif seule la personne concernée est autorisé à l'ajouter)";

const REMOVE_HTTP_ONLY_WEBSITES: CleanOperation = {
  name: 'http only websites',
  selector: /^http:\/\/$/u,
  field: 'Site Web'
};

const FIX_MISSING_HTTP_WEBSITES: CleanOperation = {
  name: 'missing http websites',
  selector: /^(?!http:\/\/).*/u,
  field: 'Site Web',
  fix: (toFix: string): string => `http://${toFix}`
};

const FIX_WRONG_CHARS_IN_PHONE: CleanOperation = {
  name: 'wrong chars in phone',
  selector: /(?!\d|\+)./gu,
  field: 'Téléphone',
  fix: (toFix: string): string => toFix.replace(/(?!\d|\+)./gu, '')
};

const FIX_UNEXPECTED_PHONE_LIST: CleanOperation = {
  name: 'unexpected phone list',
  selector: /\d{10}\/\d{10}/u,
  field: 'Téléphone',
  fix: (toFix: string): string => toFix.split('/')[0] ?? ''
};

const FIX_PHONE_WITHOUT_STARTING_0: CleanOperation = {
  name: 'phone without starting 0',
  selector: /^\d{9}$/u,
  field: 'Téléphone',
  fix: (toFix: string): string => `+33${toFix}`
};

const FIX_SHORT_CAF_PHONE: CleanOperation = {
  name: 'short CAF phone',
  selector: /3230/u,
  field: 'Téléphone',
  fix: (): string => '+33969322121'
};

const REMOVE_TOO_FEW_DIGITS_IN_PHONE: CleanOperation = {
  name: 'too few digits in phone',
  selector: /^.{0,8}$/u,
  field: 'Téléphone'
};

const REMOVE_TOO_MANY_DIGITS_IN_PHONE: CleanOperation = {
  name: 'too many digits in phone',
  selector: /^0.{10,}/u,
  field: 'Téléphone'
};

const REMOVE_EMAIL_STARTING_WITH_WWW: CleanOperation = {
  name: 'email starts with www.',
  selector: /^www\./u,
  field: EMAIL_FIELD
};

const FIX_UNEXPECTED_EMAIL_LABEL: CleanOperation = {
  name: 'unexpected email label',
  selector: /\S\s:\s\S/u,
  field: EMAIL_FIELD,
  fix: (toFix: string): string => toFix.split(/\s:\s/u)[1] ?? ''
};

const FIX_UNEXPECTED_EMAIL_LIST: CleanOperation = {
  name: 'unexpected email list',
  selector: /\S\s?(?:et|ou|;|\s|\/)\s?\S/u,
  field: EMAIL_FIELD,
  fix: (toFix: string): string => toFix.split(/\s?(?:et|ou|;|\s|\/)\s?/u)[0] ?? ''
};

const FIX_MISSING_AT_IN_EMAIL: CleanOperation = {
  name: 'missing @ in email',
  selector: /\[a\]/gu,
  field: EMAIL_FIELD,
  fix: (toFix: string): string => toFix.replace('[a]', '@')
};

const FIX_MISSING_EMAIL_EXTENSION: CleanOperation = {
  name: 'missing dot suffix in email',
  selector: /\.[a-z]{2,3}$/u,
  field: EMAIL_FIELD,
  negate: true
};

export const CLEAN_OPERATIONS: CleanOperation[] = [
  REMOVE_HTTP_ONLY_WEBSITES,
  FIX_MISSING_HTTP_WEBSITES,
  FIX_UNEXPECTED_PHONE_LIST,
  FIX_WRONG_CHARS_IN_PHONE,
  FIX_PHONE_WITHOUT_STARTING_0,
  FIX_SHORT_CAF_PHONE,
  REMOVE_TOO_FEW_DIGITS_IN_PHONE,
  REMOVE_TOO_MANY_DIGITS_IN_PHONE,
  REMOVE_EMAIL_STARTING_WITH_WWW,
  FIX_UNEXPECTED_EMAIL_LABEL,
  FIX_UNEXPECTED_EMAIL_LIST,
  FIX_MISSING_AT_IN_EMAIL,
  FIX_MISSING_EMAIL_EXTENSION
];
