import {
  createPaginationState,
  totalPages,
  nextPage,
  prevPage,
  goToPage,
  updateTotal,
  getPageSlice,
  renderPaginationBar,
} from "../paginationManager";

describe("createPaginationState", () => {
  it("creates state with defaults", () => {
    const s = createPaginationState(50);
    expect(s).toEqual({ currentPage: 0, pageSize: 20, totalItems: 50 });
  });

  it("accepts custom pageSize", () => {
    const s = createPaginationState(100, 10);
    expect(s.pageSize).toBe(10);
  });
});

describe("totalPages", () => {
  it("calculates pages correctly", () => {
    expect(totalPages(createPaginationState(50, 20))).toBe(3);
    expect(totalPages(createPaginationState(40, 20))).toBe(2);
    expect(totalPages(createPaginationState(0, 20))).toBe(1);
  });
});

describe("nextPage / prevPage", () => {
  it("advances page", () => {
    const s = createPaginationState(50, 20);
    expect(nextPage(s).currentPage).toBe(1);
  });

  it("does not exceed last page", () => {
    const s = { currentPage: 2, pageSize: 20, totalItems: 50 };
    expect(nextPage(s).currentPage).toBe(2);
  });

  it("goes back a page", () => {
    const s = { currentPage: 2, pageSize: 20, totalItems: 50 };
    expect(prevPage(s).currentPage).toBe(1);
  });

  it("does not go below 0", () => {
    const s = createPaginationState(50, 20);
    expect(prevPage(s).currentPage).toBe(0);
  });
});

describe("goToPage", () => {
  it("clamps to valid range", () => {
    const s = createPaginationState(50, 20);
    expect(goToPage(s, 10).currentPage).toBe(2);
    expect(goToPage(s, -1).currentPage).toBe(0);
    expect(goToPage(s, 1).currentPage).toBe(1);
  });
});

describe("updateTotal", () => {
  it("adjusts currentPage if out of range", () => {
    const s = { currentPage: 2, pageSize: 20, totalItems: 50 };
    const updated = updateTotal(s, 10);
    expect(updated.currentPage).toBe(0);
    expect(updated.totalItems).toBe(10);
  });
});

describe("getPageSlice", () => {
  it("returns correct slice", () => {
    const items = Array.from({ length: 50 }, (_, i) => i);
    const s = { currentPage: 1, pageSize: 20, totalItems: 50 };
    const slice = getPageSlice(items, s);
    expect(slice[0]).toBe(20);
    expect(slice.length).toBe(20);
  });
});

describe("renderPaginationBar", () => {
  it("renders correctly", () => {
    const s = { currentPage: 0, pageSize: 20, totalItems: 45 };
    const bar = renderPaginationBar(s);
    expect(bar).toContain("Page 1/3");
    expect(bar).toContain("1-20 of 45");
  });

  it("handles zero items", () => {
    const s = createPaginationState(0);
    const bar = renderPaginationBar(s);
    expect(bar).toContain("0-0 of 0");
  });
});
