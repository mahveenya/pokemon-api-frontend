class Ls {
  getLastSearch() {
    return localStorage.getItem('lastSearch') || '';
  }
  setLastSearch(query: string) {
    localStorage.setItem('lastSearch', query);
  }
  removeLastSearch() {
    localStorage.removeItem('lastSearch');
  }
}

export default new Ls();
