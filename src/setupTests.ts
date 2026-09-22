import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// @testing-library/react's auto-cleanup relies on a global afterEach hook
// registered by the test framework. This project imports `afterEach`
// explicitly (no vitest `globals: true`), so register cleanup ourselves —
// otherwise DOM from one test's render() leaks into the next.
afterEach(() => {
  cleanup();
});
