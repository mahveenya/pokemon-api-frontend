import type { Language } from './common.types';

export interface Effect {
  effect: string | null;
  short_effect: string;
  language: Language;
}

export interface EffectCreate {
  effect: string | null;
  short_effect: string;
  language: Language;
}
