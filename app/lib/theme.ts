// Full app-level light/dark switch. The class is applied pre-paint by the
// inline script in root.tsx; these just flip it and persist the choice.

export function isDarkTheme(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function setTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.theme = dark ? "dark" : "light";
  } catch {
    // Private windows and blocked site data: the theme still applies for this
    // session, it just won't be remembered.
  }
}

export function toggleTheme() {
  setTheme(!isDarkTheme());
}
