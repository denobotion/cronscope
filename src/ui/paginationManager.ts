export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export function createPaginationState(
  totalItems: number,
  pageSize = 20
): PaginationState {
  return { currentPage: 0, pageSize, totalItems };
}

export function totalPages(state: PaginationState): number {
  return Math.max(1, Math.ceil(state.totalItems / state.pageSize));
}

export function nextPage(state: PaginationState): PaginationState {
  const max = totalPages(state) - 1;
  return { ...state, currentPage: Math.min(state.currentPage + 1, max) };
}

export function prevPage(state: PaginationState): PaginationState {
  return { ...state, currentPage: Math.max(state.currentPage - 1, 0) };
}

export function goToPage(
  state: PaginationState,
  page: number
): PaginationState {
  const clamped = Math.max(0, Math.min(page, totalPages(state) - 1));
  return { ...state, currentPage: clamped };
}

export function updateTotal(
  state: PaginationState,
  totalItems: number
): PaginationState {
  const newState = { ...state, totalItems };
  const max = totalPages(newState) - 1;
  return { ...newState, currentPage: Math.min(newState.currentPage, max) };
}

export function getPageSlice<T>(items: T[], state: PaginationState): T[] {
  const start = state.currentPage * state.pageSize;
  return items.slice(start, start + state.pageSize);
}

export function renderPaginationBar(state: PaginationState): string {
  const current = state.currentPage + 1;
  const total = totalPages(state);
  const start = state.currentPage * state.pageSize + 1;
  const end = Math.min(start + state.pageSize - 1, state.totalItems);
  const itemRange =
    state.totalItems === 0 ? "0-0" : `${start}-${end}`;
  return `  Page ${current}/${total}  [${itemRange} of ${state.totalItems}]  (← prev  → next)`;
}
