import { Component } from 'react';
import styles from './Pokemon.module.css';
import type { Ability } from '~/types/ability.types';
import type { Pokemon as IPokemon } from '~/types/pokemon.types';
import PokemonAbilities from './PokemonAbilities/PokemonAbilities';
import api from '~/api/api';
import Loader from '~/components/Loader/Loader';

interface Props {
  pokemon: IPokemon;
}

interface State {
  abilities: Ability[];
  loading: boolean;
}

export default class Pokemon extends Component<Props, State> {
  state: State = {
    abilities: [],
    loading: true,
  };

  loadAbilities = async () => {
    this.setState({ loading: true });
    try {
      const response: Ability[] = await api.getAbilities(
        this.props.pokemon.abilities
      );

      this.setState({ abilities: response, loading: false });
    } catch (error) {
      this.setState({ loading: false });
      if (error instanceof Error) throw error;
      throw new Error('Unknown error occurred', { cause: error });
    }
  };

  componentDidMount(): void {
    this.loadAbilities();
  }
  render() {
    const { pokemon } = this.props;
    return (
      <div className={styles.pokemon}>
        <span className={styles.pokemonName}>{pokemon.name} </span>
        {this.state.loading ? (
          <Loader />
        ) : (
          <PokemonAbilities abilities={this.state.abilities} />
        )}
      </div>
    );
  }
}
