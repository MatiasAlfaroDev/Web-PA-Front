# Diapositivas en vivo + pasada de UI

Fecha: 2026-10-07. Toca este repo y `Web-PA-Back`.

## 1. Diapositivas

### Fuente del contenido

Una lección sigue siendo **un solo markdown**. Las diapositivas son ese markdown
cortado en una línea que solo contiene `---` (`app/lib/slides.ts`). No hay tabla
nueva ni editor aparte:

- las lecciones escritas antes de esta función siguen abriendo como una sola
  diapositiva;
- el editor de lecciones muestra el contador de diapositivas mientras se escribe,
  que es lo que hace descubrible el separador;
- la vista de lectura usa los mismos cortes como separaciones de sección, así la
  lección se lee igual que se presenta.

Los separadores dentro de un bloque ``` ``` no cortan nada.

### Sesión en vivo

Una sola sesión por instalación (una clase, un proyector): fila singleton `id = 1`
en `presentations`, misma forma que `site_locks`.

| Verbo | Ruta | Quién | Para qué |
| --- | --- | --- | --- |
| GET | `/api/presentation` | cualquiera autenticado | estado actual, legible aun con el sitio bloqueado |
| PUT | `/api/presentation` | profesor | inicia la sesión y empuja la diapositiva actual |
| DELETE | `/api/presentation` | profesor | la termina |

No hay websockets: el front hace polling de un registro diminuto. La vista de
diapositivas del estudiante consulta cada 2 s (el número de diapositiva tiene que
sentirse inmediato); la barra "el profesor está presentando" del layout, cada 15 s
(solo necesita enterarse de que empezó). Una sesión sin actualizaciones por 30
minutos deja de considerarse viva, así una pestaña olvidada no queda transmitiendo.

### Rutas nuevas

- `/app/theory/:courseId/lessons/:lessonId/slides` — mazo del estudiante. Si hay
  sesión viva de esa lección, sigue al profesor y ofrece "Ver a mi ritmo" para
  despegarse (y volver).
- `/admin/theory/:courseId/lessons/:lessonId/present` — vista del profesor: el
  mazo, la próxima diapositiva, el recorrido completo y el control de transmisión.
- `/app/live` — ruta de recurso que ambos consultan, fuera de los layouts para que
  cada tick no revalide los guards.

El layout de profesor no revalida cuando la submission apunta a `/present`: cada
flecha del teclado es una submission y recargar perfil y site-lock en cada una
sería absurdo.

## 2. Pasada de UI

Modo "preservar": verde de marca, IA, rutas, slugs y voz de los textos quedan
como estaban. Lo que cambió:

- **Dos verdes con dos trabajos.** `--brand` (#16a34a) es el verde decorativo
  (progreso, foco, pulso de desbloqueo); `--primary` bajó a #15803d porque es el
  que lleva texto blanco encima y #16a34a solo llegaba a 3.3:1 contra blanco.
  `--success-ink` es el verde para texto sobre superficie (#15803d claro,
  #4ade80 oscuro). Esto corrige un fallo real de WCAG AA en botones primarios,
  puntajes y resúmenes de pruebas.
- **Una escala tipográfica** (`page-title`, `section-title`, `eyebrow`, `num` en
  `app.css`) en lugar de `text-[28px] font-extrabold` repetido página por página.
- **Mono solo para números y código.** Antes etiquetas, emails y chips también
  eran monoespaciados.
- **Familias de layout distintas por página**: grilla de tarjetas para cursos,
  listas con reglas para teórico, clasificación y perfil, tablas para el panel
  del profesor. Antes todo era la misma tarjeta con borde.
- **Progreso en tramos** (`ProgressTicks`): un tramo por desafío, contable, y el
  mismo gesto visual que el riel de diapositivas.
- **Componentes compartidos** en `app/components/bits.tsx`: `PageHeader`,
  `BackLink`, `EmptyState`, `Figure`, `ProgressTicks`, `PublishChip`.
- Rayas em (`—`) fuera de los textos visibles, separadores `·` reducidos a lo
  imprescindible, y colores de podio como tokens en vez de hex sueltos.
