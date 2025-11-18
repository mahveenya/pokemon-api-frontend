import { Component } from 'react';
import styles from './PokemonAbilities.module.css';
import type { Ability, VerboseEffect } from '~/types/types';
import { isEmptyArray } from '~/utils/utils';

interface Props {
  abilities: Ability[];
  lang?: string;
}

export default class PokemonAbilities extends Component<Props> {
  state = {
    lang: this.props.lang ?? 'en',
  };

  private normalizeAbilityName = (abilityName: string) =>
    abilityName.replace('-', ' ');

  private getShortEffect = (effectEntries: VerboseEffect[]) => {
    const shortEffectsByLang = [this.state.lang, 'en'].map((lang) =>
      effectEntries.find((effectEntry) => effectEntry.language.name === lang)
    );

    const [userLangShortEffect, defaultLangShortEffect] = shortEffectsByLang;

    if (userLangShortEffect?.short_effect)
      return userLangShortEffect.short_effect.toLowerCase();
    if (defaultLangShortEffect?.short_effect)
      return defaultLangShortEffect.short_effect.toLowerCase();
    throw new Error('Short effect description is missing');
  };

  render() {
    const { abilities } = this.props;
    const hasAbilities = !isEmptyArray(abilities);

    return (
      <div>
        {hasAbilities &&
          abilities.map((ability) => {
            const abilityName = this.normalizeAbilityName(ability.name);
            const shortEffect = this.getShortEffect(ability.effect_entries);
            return (
              <div key={ability.id}>
                <span className={styles.abilityName}>{`${abilityName}: `}</span>
                <span>{shortEffect}</span>
              </div>
            );
          })}
      </div>
    );
  }
}
