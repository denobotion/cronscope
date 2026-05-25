import {
  PaginationState,
  nextPage,
  prevPage,
  goToPage,
  updateTotal,
} from "./paginationManager";

export type PaginationKey =
  | "next"
  | "prev"
  | "first"
  | "last"
  | "none";

export function parsePaginationKey(key: string): PaginationKey {
  switch (key) {
    case "right":
    case "l":
    case "]":
      return "next";
    case "left":
    case "h":
    case "[":
      return "prev";
    case "home":
    case "g":
      return "first";
    case "end":
    case "G":
      return "last";
    default:
      return "none";
  }
}

export function applyPaginationKey(
  state: PaginationState,
  key: string
): PaginationState {
  const action = parsePaginationKey(key);
  switch (action) {
    case "next":
      return nextPage(state);
    case "prev":
      return prevPage(state);
    case "first":
      return goToPage(state, 0);
    case "last": {
      const lastPage =
        Math.max(1, Math.ceil(state.totalItems / state.pageSize)) - 1;
      return goToPage(state, lastPage);
    }
    default:
      return state;
  }
}

export function syncPaginationWithItems(
  state: PaginationState,
  newTotal: number
): PaginationState {
  return updateTotal(state, newTotal);
}
