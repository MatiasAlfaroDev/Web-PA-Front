// Full app-level light/dark toggle. The class is applied pre-paint by the
// inline script in root.tsx; this just flips it and persists the choice.
export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.theme = isDark ? "dark" : "light";
}
