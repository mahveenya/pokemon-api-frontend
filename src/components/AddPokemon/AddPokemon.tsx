import { Component } from 'react';
import type { FormEvent } from 'react';
import styles from './AddPokemon.module.css';
import AbilityPicker from '~components/AbilityPicker/AbilityPicker';
import api from '~/api/api';
import type { Pokemon } from '~/types/pokemon.types';
import type { Ability } from '~/types/ability.types';

interface Props {
  onCreated: (pokemon: Pokemon) => void;
}

interface State {
  open: boolean;
  name: string;
  abilities: Ability[];
  submitting: boolean;
  error: string | null;
}

const INITIAL_STATE: State = {
  open: false,
  name: '',
  abilities: [],
  submitting: false,
  error: null,
};

export default class AddPokemon extends Component<Props, State> {
  state: State = INITIAL_STATE;

  private openForm = () => this.setState({ open: true });

  private closeForm = () => this.setState({ ...INITIAL_STATE });

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
      const pokemon = await api.createPokemon({
        name,
        ability_ids: abilities.map((ability) => ability.id),
      });

      this.setState({ ...INITIAL_STATE });
      this.props.onCreated(pokemon);
    } catch (error) {
      this.setState({
        submitting: false,
        error: error instanceof Error ? error.message : 'Failed to add pokemon',
      });
    }
  };

  render() {
    const { open, name, abilities, submitting, error } = this.state;

    return (
      <div className={styles.addPokemon}>
        <button type="button" onClick={this.openForm}>
          Add pokemon
        </button>

        {open && (
          <div className={styles.overlay} onClick={this.closeForm}>
            <div
              role="dialog"
              className={styles.dialog}
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="add-pokemon-title" className={styles.title}>
                Add a new pokemon
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
                  <button type="button" onClick={this.closeForm}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
}
