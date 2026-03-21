import { Component } from 'react';
import styles from './Pokemons.module.css';
import Pokemon from './Pokemon/Pokemon';
import type { Pokemon as IPokemon } from '~/types/pokemon.types';
import NothingToShow from '../NothingToShow/NothingToShow';
import ErrorTrigger from '../ErrorTrigger/ErrorTrigger';
import { isEmptyArray } from '~/utils/utils';

interface Props {
  pokemons: [IPokemon] | IPokemon[];
  error: Error | null;
}

export default class Pokemons extends Component<Props> {
  render() {
    const { pokemons, error } = this.props;

    if (error) {
      throw error;
    }

    const hasPokemons = !isEmptyArray(pokemons);

    return (
      <>
        {hasPokemons ? (
          <section className={styles.pokemons}>
            {pokemons.map((pokemon: IPokemon) => {
              return <Pokemon key={pokemon.id} pokemon={pokemon} />;
            })}
          </section>
        ) : (
          <NothingToShow />
        )}
        <ErrorTrigger />
      </>
    );
  }
}
