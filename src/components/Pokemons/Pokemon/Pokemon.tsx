import { Component } from 'react';
import styles from './Pokemon.module.css';
import type { Ability } from '~/types/ability.types';
import type { Pokemon as IPokemon } from '~/types/pokemon.types';
import PokemonAbilities from './PokemonAbilities/PokemonAbilities';
import EditPokemon from '~components/EditPokemon/EditPokemon';
import ConfirmDialog from '~components/ConfirmDialog/ConfirmDialog';
import api from '~/api/api';
import Loader from '~/components/Loader/Loader';

interface Props {
  pokemon: IPokemon;
  onDelete: (id: number) => void;
  onUpdate: (pokemon: IPokemon) => void;
}

interface State {
  abilities: Ability[];
  loading: boolean;
  deleting: boolean;
  editing: boolean;
  confirmingDelete: boolean;
}

export default class Pokemon extends Component<Props, State> {
  state: State = {
    abilities: [],
    loading: true,
    deleting: false,
    editing: false,
    confirmingDelete: false,
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

  private requestDelete = () => this.setState({ confirmingDelete: true });

  private cancelDelete = () => this.setState({ confirmingDelete: false });

  handleDelete = async () => {
    this.setState({ deleting: true });
    try {
      await api.deletePokemon(this.props.pokemon.id);
      this.props.onDelete(this.props.pokemon.id);
    } catch (error) {
      this.setState({ deleting: false, confirmingDelete: false });
      if (error instanceof Error) throw error;
      throw new Error('Unknown error occurred', { cause: error });
    }
  };

  private openEdit = () => this.setState({ editing: true });

  private closeEdit = () => this.setState({ editing: false });

  private handleUpdated = (pokemon: IPokemon, abilities: Ability[]) => {
    this.setState({ abilities, editing: false });
    this.props.onUpdate(pokemon);
  };

  componentDidMount(): void {
    this.loadAbilities();
  }
  render() {
    const { pokemon } = this.props;
    const { deleting, editing, loading, abilities, confirmingDelete } =
      this.state;
    return (
      <div className={styles.pokemon}>
        <span className={styles.pokemonName}>{pokemon.name} </span>
        {loading ? <Loader /> : <PokemonAbilities abilities={abilities} />}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.editButton}
            onClick={this.openEdit}
            disabled={loading}
            aria-label={`Edit ${pokemon.name}`}
          >
            Edit
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={this.requestDelete}
            disabled={deleting}
            aria-label={`Delete ${pokemon.name}`}
          >
            Delete
          </button>
        </div>
        {editing && (
          <EditPokemon
            pokemon={pokemon}
            initialAbilities={abilities}
            onUpdated={this.handleUpdated}
            onClose={this.closeEdit}
          />
        )}
        {confirmingDelete && (
          <ConfirmDialog
            message={`Delete ${pokemon.name}?`}
            confirmLabel="Delete"
            busy={deleting}
            busyLabel="Deleting..."
            onConfirm={this.handleDelete}
            onCancel={this.cancelDelete}
          />
        )}
      </div>
    );
  }
}
