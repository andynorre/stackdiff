export {
  replaceEnvMap,
  replaceMultipleEnvMaps,
  hasReplaceChanges,
  replaceInString,
} from './replaceEnvMap';
export type { ReplaceOptions, ReplaceResult } from './replaceEnvMap';

export {
  collectReplaceStats,
  formatReplaceResult,
  formatMultipleReplaceResults,
  countReplacedTotal,
} from './formatReplace';
export type { ReplaceStats } from './formatReplace';
