import { Component } from 'react';
import type { FormEvent } from 'react';
import styles from './EditPokemon.module.css';
import AbilityPicker from '~components/AbilityPicker/AbilityPicker';
import api from '~/api/api';
import type { Pokemon } from '~/types/pokemon.types';
import type { Ability } from '~/types/ability.types';

interface Props {
  pokemon: Pokemon;
  initialAbilities: Ability[];
  onUpdated: (pokemon: Pokemon, abilities: Ability[]) => void;
  onClose: () => void;
}

interface State {
  name: string;
  abilities: Ability[];
  submitting: boolean;
  error: string | null;
}

export default class EditPokemon extends Component<Props, State> {
  state: State = {
    name: this.props.pokemon.name,
    abilities: this.props.initialAbilities,
    submitting: false,
    error: null,
  };

  private handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value });
  };

  private handleAbilitiesChange = (abilities: Ability[]) => {
    this.setState({ abilities });
  };

  private handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = this.state.name.trim();
    const { abilities } = this.state;

    if (!name || abilities.length === 0) {
      this.setState({
        error: 'Name and at least one ability are required',
      });
      return;
    }

    this.setState({ submitting: true, error: null });

    try {
      const pokemon = await api.updatePokemon(this.props.pokemon.id, {
        name,
        ability_ids: abilities.map((ability) => ability.id),
      });

      this.props.onUpdated(pokemon, abilities);
    } catch (error) {
      this.setState({
        submitting: false,
        error:
          error instanceof Error ? error.message : 'Failed to update pokemon',
      });
    }
  };

  render() {
    const { name, abilities, submitting, error } = this.state;

    return (
      <div className={styles.overlay} onClick={this.props.onClose}>
        <div
          role="dialog"
          className={styles.dialog}
          onClick={(event) => event.stopPropagation()}
        >
          <h2 id="edit-pokemon-title" className={styles.title}>
            Edit pokemon
          </h2>
          <form onSubmit={this.handleSubmit} className={styles.form}>
            <input
              type="text"
              name="name"
              placeholder="Pokemon name"
              className={styles.input}
              value={name}
              onChange={this.handleNameChange}
            />
            <AbilityPicker
              selected={abilities}
              onChange={this.handleAbilitiesChange}
            />
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.actions}>
              <button type="button" onClick={this.props.onClose}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
