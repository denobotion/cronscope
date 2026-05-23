/**
 * searchBar.ts
 * Renders and manages the interactive search/filter bar for cronscope dashboard.
 */

export interface SearchState {
  query: string;
  active: boolean;
}

export function createSearchState(): SearchState {
  return { query: "", active: false };
}

export function applySearchInput(
  state: SearchState,
  char: string
): SearchState {
  if (char === "\x7f" || char === "\b") {
    // Backspace
    return { ...state, query: state.query.slice(0, -1) };
  }
  if (char === "\x1b" || char === "\r" || char === "\n") {
    // Escape or Enter closes search
    return { ...state, active: false };
  }
  if (char === "/") {
    return { ...state, active: true };
  }
  if (state.active && char.length === 1) {
    return { ...state, query: state.query + char };
  }
  return state;
}

export function clearSearch(state: SearchState): SearchState {
  return { query: "", active: false };
}

export function renderSearchBar(state: SearchState, width: number): string {
  const label = state.active ? " Search: " : " Press / to search ";
  const cursor = state.active ? "█" : "";
  const queryDisplay = state.active
    ? `\x1b[1m${state.query}${cursor}\x1b[0m`
    : `\x1b[2m${state.query}\x1b[0m`;
  const borderColor = state.active ? "\x1b[36m" : "\x1b[90m";
  const reset = "\x1b[0m";
  const content = `${label}${queryDisplay}`;
  const padded = content.padEnd(width - 2);
  return `${borderColor}[${reset}${padded}${borderColor}]${reset}`;
}
