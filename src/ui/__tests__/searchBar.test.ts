import {
  createSearchState,
  applySearchInput,
  clearSearch,
  renderSearchBar,
  SearchState,
} from "../searchBar";

describe("createSearchState", () => {
  it("returns default inactive state", () => {
    const state = createSearchState();
    expect(state.query).toBe("");
    expect(state.active).toBe(false);
  });
});

describe("applySearchInput", () => {
  it("activates search on /", () => {
    const state = createSearchState();
    const next = applySearchInput(state, "/");
    expect(next.active).toBe(true);
  });

  it("appends characters when active", () => {
    const state: SearchState = { query: "cron", active: true };
    const next = applySearchInput(state, "d");
    expect(next.query).toBe("crond");
  });

  it("does not append characters when inactive", () => {
    const state: SearchState = { query: "", active: false };
    const next = applySearchInput(state, "a");
    expect(next.query).toBe("");
  });

  it("removes last character on backspace", () => {
    const state: SearchState = { query: "cron", active: true };
    const next = applySearchInput(state, "\x7f");
    expect(next.query).toBe("cro");
  });

  it("deactivates on Escape", () => {
    const state: SearchState = { query: "cron", active: true };
    const next = applySearchInput(state, "\x1b");
    expect(next.active).toBe(false);
  });

  it("deactivates on Enter", () => {
    const state: SearchState = { query: "test", active: true };
    const next = applySearchInput(state, "\r");
    expect(next.active).toBe(false);
    expect(next.query).toBe("test");
  });
});

describe("clearSearch", () => {
  it("resets query and active state", () => {
    const state: SearchState = { query: "something", active: true };
    const next = clearSearch(state);
    expect(next.query).toBe("");
    expect(next.active).toBe(false);
  });
});

describe("renderSearchBar", () => {
  it("renders inactive hint when not active", () => {
    const state = createSearchState();
    const output = renderSearchBar(state, 40);
    expect(output).toContain("Press / to search");
  });

  it("renders query when active", () => {
    const state: SearchState = { query: "backup", active: true };
    const output = renderSearchBar(state, 40);
    expect(output).toContain("backup");
    expect(output).toContain("Search:");
  });
});
