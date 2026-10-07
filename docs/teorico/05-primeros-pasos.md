# 5. Primeros pasos

El mod mínimo, paso por paso.

---

## El orden que funciona

1. Un ítem que aparece en el inventario.
2. Un bloque que se puede poner y romper.
3. Una receta para fabricarlo.
4. Un comportamiento: que haga algo al usarlo.
5. Recién después: entidades, pantallas, animaciones.

Cada paso termina con el juego abierto y la cosa funcionando. No se avanza con dos pasos a medias.

---

## El ítem, en código

La forma es siempre la misma: crear y registrar con un identificador propio.

```
public class MiMod implements ModInitializer {
    public static final String MOD_ID = "mimod";

    public static final Item POLVO = Registry.register(
        Registries.ITEM,
        Identifier.of(MOD_ID, "polvo"),
        new Item(new Item.Settings())
    );

    @Override
    public void onInitialize() {
        // el registro ya ocurrio al cargar la clase
    }
}
```

La firma exacta del constructor cambió entre versiones. Copiarla de la documentación oficial de la versión que fijamos, no de un video.

---

## El ítem, en archivos

Registrar no alcanza. El ítem necesita su parte declarativa:

- `assets/mimod/models/item/polvo.json`: el modelo, que apunta a la textura.
- `assets/mimod/textures/item/polvo.png`: la textura, 16 por 16.
- `assets/mimod/lang/es_es.json` y `en_us.json`: el nombre visible.
- Entrada en un grupo del inventario creativo, desde código.

Si el ítem sale violeta y negro, falta la textura o la ruta está mal escrita. Si sale con el nombre entre puntos, falta el lang.

![Esto es lo que se ve cuando falta la textura o la ruta esta mal escrita.](/teorico/textura-faltante.png)

---

## El bloque

Un bloque es lo mismo, más algunas piezas:

- Se registra el `Block` y además un `BlockItem`, que es el ítem que lo coloca.
- `blockstates/<nombre>.json` dice qué modelo usar para cada estado.
- `models/block/<nombre>.json` y `models/item/<nombre>.json`.
- Una loot table en el data pack, o romperlo no suelta nada.
- Tags para que la herramienta correcta lo mine a la velocidad correcta.

![La mesa de trabajo: el ingrediente de la receta que vas a declarar en el data pack.](/teorico/mesa-de-trabajo.png)

---

## Que haga algo

Ahí empieza lo interesante:

- Sobrescribir un método del bloque para reaccionar al click derecho.
- Escuchar un evento del loader, por ejemplo cuando un jugador entra.
- Guardar estado en un `BlockEntity` y hacerlo tickear.
- Mandar un paquete al cliente si el cliente tiene que enterarse.

Y la pregunta de siempre antes de escribir: esto corre en el servidor, en el cliente, o en los dos.

---

## Cuando no hay hook: Mixin

Si el juego no ofrece ningún punto de entrada para lo que querés hacer, se inyecta.

- Buscar el método real en el código descompilado.
- Inyectar lo mínimo, lo más al borde posible del método.
- Documentar en un comentario qué hace y por qué no había alternativa.

Un mixin es deuda: se rompe cuando el juego cambia. Usalo cuando haga falta, no por comodidad.

---

## Depurar

- Log con el logger del mod, nunca con `System.out.println`.
- Breakpoints de verdad: el debugger funciona con el juego corriendo.
- Hot swap para cambios chicos dentro de un método, reiniciar para todo lo demás.
- Leer el crash report entero: dice versión, mods cargados y la línea exacta.

---

## Trabajo en equipo

- Un repositorio por equipo, con `.gitignore` de Gradle e IntelliJ desde el primer commit.
- Nunca commitear `build/`, `run/`, ni la carpeta `.gradle`.
- Ramas por funcionalidad y commits que se entiendan.
- La versión de Minecraft, del loader y de la API se fijan en el repo y no las cambia nadie solo.

---

## Reglas de la casa

Mojang permite los mods, con límites:

- No se puede redistribuir el código ni los assets de Minecraft. Tu repo lleva tu código, no el juego.
- Los mods se publican gratis. No se cobra por acceso.
- Las librerías que uses tienen licencia: hay que respetarla y acreditarla.
- Si copiás código de un mod abierto, se cita y se cumple su licencia.
