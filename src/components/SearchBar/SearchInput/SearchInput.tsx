import { Component, type ChangeEvent } from 'react';
import styles from './SearchInput.module.css';
import ls from '../../../db/storage';

export default class SearchInput extends Component {
  state = {
    query: ls.getLastSearch() || '',
  };

  private handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ query: event.target.value });
  };
  render() {
    return (
      <input
        type="search"
        name="q"
        placeholder="Search pokemons by name or id..."
        aria-label="Search pokemons by name or id"
        className={styles.searchInput}
        value={this.state.query}
        onChange={this.handleChange}
      />
    );
  }
}
