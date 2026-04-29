import "@testing-library/jest-dom";

// Fix for Next.js router (fallback if not mocked)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  }),
});
