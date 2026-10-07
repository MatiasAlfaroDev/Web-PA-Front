# 2. Modloaders y frameworks

Quién nos deja entrar, y con qué reglas.

---

## Qué hace un modloader

Tres trabajos, y ninguno es trivial:

1. Arrancar el juego con un classloader propio y transformar las clases al cargarlas.
2. Encontrar los mods, leer su manifiesto, ordenar dependencias y avisarles cuándo arrancar.
3. Ofrecer puntos de enganche: eventos, registros, hooks, para no tener que parchear a mano.

Sin loader, cada mod tendría que editar el `.jar` y dos mods nunca podrían convivir.

---

## Mixin: el truco central

Mixin es la librería que usan los dos loaders grandes. Escribís una clase normal que declara dónde inyectarse:

```
@Mixin(TitleScreen.class)
public class EjemploMixin {
    @Inject(method = "init()V", at = @At("HEAD"))
    private void alAbrirElMenu(CallbackInfo info) {
        // corre al principio de init(), antes del codigo original
    }
}
```

Al cargar `TitleScreen`, Mixin reescribe su bytecode e inserta la llamada. El juego no sabe que existís.

La firma del método que inyecta tiene que coincidir con la del método objetivo, más el `CallbackInfo` al final.

Es poderoso y es filoso: dos mods inyectando en el mismo método pueden pelearse.

---

## Fabric

- Liviano: `Fabric Loader` arranca el juego, `Fabric API` agrega los hooks comunes, y nada más.
- Se actualiza casi el mismo día que sale una versión nueva.
- Mappings Yarn, muy legibles.
- Build con `Fabric Loom`, plantilla oficial de proyecto en la web.
- Filosofía: poco framework, mucho Mixin.

Ideal para mods chicos, experimentos, optimización y versiones nuevas.

---

## NeoForge

- Fork de Forge, hoy la rama principal de esa familia.
- Framework grande: `DeferredRegister` para registros, bus de eventos, capabilities, data generation, redes.
- Más estructura y menos Mixin para el contenido típico.
- Build con `ModDevGradle`.
- Donde está el ecosistema histórico de mods grandes de tecnología y magia.

Ideal para mods de contenido pesado: máquinas, inventarios, energía, muchos ítems.

---

## Forge y Quilt

- Forge: el loader clásico, todavía vivo para versiones viejas. Si el proyecto apunta a una versión moderna, hoy se elige NeoForge.
- Quilt: fork de Fabric, compatible con buena parte de sus mods, pero con mucha menos tracción. No es donde queremos estar aprendiendo.

---

## Multi-loader

Un mod puede publicarse para Fabric y NeoForge a la vez, separando lógica común de lo específico de cada loader:

- Architectury: una API intermedia más su plugin de Gradle.
- MultiLoader Template: proyecto con subprojects, sin dependencia extra en tiempo de ejecución.

Para nuestro proyecto: no. Elegimos un loader y lo hacemos bien. Multi-loader es el doble de build para el mismo mod.

---

## Librerías que aparecen siempre

- GeckoLib: animaciones de entidades y bloques con huesos y keyframes.
- Cloth Config, YACL: pantallas de configuración.
- JEI, REI, EMI: visor de recetas. Lo importante es que las tuyas aparezcan ahí.
- Patchouli: libros de guía en el juego.
- spark: profiler, para cuando el mod hace caer los TPS.

---

## Nuestra decisión

Para este proyecto: Fabric, sobre una versión fija de Minecraft 1.21.x, con Java 21.

Por qué:

- Entorno más rápido de armar y de arrancar.
- Menos framework que memorizar antes del primer resultado.
- Nos obliga a leer el código del juego, que es la mitad del aprendizaje.

Todo el grupo usa exactamente la misma versión. Versiones mezcladas significa que el mod del compañero no abre.

---

## La alternativa Bedrock

En Bedrock no hay mods de código, hay add-ons:

- Behavior packs y resource packs, todo JSON.
- Script API en JavaScript o TypeScript, con módulos como `@minecraft/server`.
- Entra sin compilar nada y corre en consolas y celulares.

Es una plataforma legítima y más accesible, pero no es Java ni es programación avanzada. Queda como camino alternativo si alguien lo quiere explorar aparte.

---

## Lo que no es modding con código

Dos cosas que conviene distinguir:

- Data packs: cambian recetas, loot, avances, funciones de comando. Cero Java y se prueban en segundos.
- Plugins de servidor (Paper, Spigot): Java, pero sólo del lado del servidor y sin tocar el cliente. No pueden agregar bloques nuevos de verdad.

Si una idea se puede hacer con un data pack, hacela con un data pack. Vale como prototipo.
