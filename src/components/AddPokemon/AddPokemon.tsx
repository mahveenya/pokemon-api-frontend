import { Component } from 'react';
import type { FormEvent } from 'react';
import styles from './AddPokemon.module.css';
import api from '~/api/api';
import type { Pokemon } from '~/types/pokemon.types';

interface Props {
  onCreated: (pokemon: Pokemon) => void;
}

interface State {
  open: boolean;
  name: string;
  abilityName: string;
  shortEffect: string;
  effect: string;
  submitting: boolean;
  error: string | null;
}

type TextField = 'name' | 'abilityName' | 'shortEffect' | 'effect';

const INITIAL_STATE: State = {
  open: false,
  name: '',
  abilityName: '',
  shortEffect: '',
  effect: '',
  submitting: false,
  error: null,
};

export default class AddPokemon extends Component<Props, State> {
  state: State = INITIAL_STATE;

  private openForm = () => this.setState({ open: true });

  private closeForm = () => this.setState({ ...INITIAL_STATE });

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    this.setState({ [name]: value } as Pick<State, TextField>);
  };

  private handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = this.state.name.trim();
    const abilityName = this.state.abilityName.trim();
    const shortEffect = this.state.shortEffect.trim();
    const effect = this.state.effect.trim();

    if (!name || !abilityName || !shortEffect) {
      this.setState({
        error: 'Name, ability name and short effect are required',
      });
      return;
    }

    this.setState({ submitting: true, error: null });

    try {
      const pokemon = await api.createPokemon({
        name,
        abilities: [
          {
            name: abilityName,
            effect_entries: [
              {
                effect: effect || null,
                short_effect: shortEffect,
                language: { name: 'en' },
              },
            ],
          },
        ],
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
    const { open, name, abilityName, shortEffect, effect, submitting, error } =
      this.state;

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
                  onChange={this.handleChange}
                />
                <input
                  type="text"
                  name="abilityName"
                  placeholder="Ability name"
                  className={styles.input}
                  value={abilityName}
                  onChange={this.handleChange}
                />
                <input
                  type="text"
                  name="shortEffect"
                  placeholder="Ability short effect"
                  className={styles.input}
                  value={shortEffect}
                  onChange={this.handleChange}
                />
                <input
                  type="text"
                  name="effect"
                  placeholder="Ability effect (optional)"
                  className={styles.input}
                  value={effect}
                  onChange={this.handleChange}
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
