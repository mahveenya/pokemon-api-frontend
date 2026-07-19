import { Component } from 'react';
import styles from './AbilityPicker.module.css';
import api from '~/api/api';
import type { Ability } from '~/types/ability.types';

interface Props {
  selected: Ability[];
  onChange: (next: Ability[]) => void;
}

interface State {
  query: string;
  results: Ability[];
  searching: boolean;
  searchError: string | null;
  showCreate: boolean;
  newName: string;
  newShortEffect: string;
  newEffect: string;
  creating: boolean;
  createError: string | null;
}

const SEARCH_DEBOUNCE_MS = 300;

const INITIAL_STATE: State = {
  query: '',
  results: [],
  searching: false,
  searchError: null,
  showCreate: false,
  newName: '',
  newShortEffect: '',
  newEffect: '',
  creating: false,
  createError: null,
};

type CreateField = 'newName' | 'newShortEffect' | 'newEffect';

export default class AbilityPicker extends Component<Props, State> {
  state: State = INITIAL_STATE;

  private debounceId?: ReturnType<typeof setTimeout>;

  componentWillUnmount() {
    if (this.debounceId) clearTimeout(this.debounceId);
  }

  private isSelected = (id: number) =>
    this.props.selected.some((ability) => ability.id === id);

  private handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    this.setState({ query });

    if (this.debounceId) clearTimeout(this.debounceId);

    if (!query.trim()) {
      this.setState({ results: [], searching: false, searchError: null });
      return;
    }

    this.setState({ searching: true });
    this.debounceId = setTimeout(
      () => this.runSearch(query.trim()),
      SEARCH_DEBOUNCE_MS
    );
  };

  private runSearch = async (query: string) => {
    try {
      const results = await api.searchAbilities(query);
      this.setState({ results, searching: false, searchError: null });
    } catch (error) {
      this.setState({
        results: [],
        searching: false,
        searchError:
          error instanceof Error ? error.message : 'Failed to search abilities',
      });
    }
  };

  private addAbility = (ability: Ability) => {
    if (this.isSelected(ability.id)) return;
    this.props.onChange([...this.props.selected, ability]);
  };

  private removeAbility = (id: number) => {
    this.props.onChange(
      this.props.selected.filter((ability) => ability.id !== id)
    );
  };

  private handleCreateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    this.setState({ [name]: value } as Pick<State, CreateField>);
  };

  private toggleCreate = () =>
    this.setState((prev) => ({
      showCreate: !prev.showCreate,
      createError: null,
    }));

  private handleCreate = async () => {
    const name = this.state.newName.trim();
    const shortEffect = this.state.newShortEffect.trim();
    const effect = this.state.newEffect.trim();

    if (!name || !shortEffect) {
      this.setState({
        createError: 'Ability name and short effect are required',
      });
      return;
    }

    this.setState({ creating: true, createError: null });

    try {
      const ability = await api.createAbility({
        name,
        effect_entries: [
          {
            effect: effect || null,
            short_effect: shortEffect,
            language: { name: 'en' },
          },
        ],
      });

      this.addAbility(ability);
      this.setState({
        creating: false,
        showCreate: false,
        newName: '',
        newShortEffect: '',
        newEffect: '',
      });
    } catch (error) {
      this.setState({
        creating: false,
        createError:
          error instanceof Error ? error.message : 'Failed to create ability',
      });
    }
  };

  render() {
    const {
      query,
      results,
      searching,
      searchError,
      showCreate,
      newName,
      newShortEffect,
      newEffect,
      creating,
      createError,
    } = this.state;
    const { selected } = this.props;
    const suggestions = results.filter(
      (ability) => !this.isSelected(ability.id)
    );

    return (
      <div className={styles.picker}>
        {selected.length > 0 && (
          <ul className={styles.chips}>
            {selected.map((ability) => (
              <li key={ability.id} className={styles.chip}>
                {ability.name}
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => this.removeAbility(ability.id)}
                >
                  Remove {ability.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          type="text"
          className={styles.input}
          placeholder="Search abilities"
          aria-label="Search abilities"
          value={query}
          onChange={this.handleQueryChange}
        />

        {searching && <p className={styles.status}>Searching...</p>}
        {searchError && <p className={styles.error}>{searchError}</p>}
        {!searching &&
          !searchError &&
          query.trim() &&
          suggestions.length === 0 && (
            <p className={styles.status}>No abilities found</p>
          )}

        {suggestions.length > 0 && (
          <ul className={styles.results}>
            {suggestions.map((ability) => (
              <li key={ability.id}>
                <button
                  type="button"
                  className={styles.result}
                  onClick={() => this.addAbility(ability)}
                >
                  {ability.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          className={styles.createToggle}
          onClick={this.toggleCreate}
        >
          {showCreate ? 'Cancel new ability' : 'Create new ability'}
        </button>

        {showCreate && (
          <div className={styles.createForm}>
            <input
              type="text"
              name="newName"
              className={styles.input}
              placeholder="New ability name"
              aria-label="New ability name"
              value={newName}
              onChange={this.handleCreateChange}
            />
            <input
              type="text"
              name="newShortEffect"
              className={styles.input}
              placeholder="New ability short effect"
              aria-label="New ability short effect"
              value={newShortEffect}
              onChange={this.handleCreateChange}
            />
            <input
              type="text"
              name="newEffect"
              className={styles.input}
              placeholder="New ability effect (optional)"
              aria-label="New ability effect (optional)"
              value={newEffect}
              onChange={this.handleCreateChange}
            />
            {createError && (
              <p role="alert" className={styles.error}>
                {createError}
              </p>
            )}
            <button
              type="button"
              className={styles.createSubmit}
              onClick={this.handleCreate}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create ability'}
            </button>
          </div>
        )}
      </div>
    );
  }
}
