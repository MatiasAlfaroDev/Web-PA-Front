# 3. Herramientas

Con qué vamos a modelar, escribir y compilar.

---

## Blockbench

Editor 3D libre, pensado para Minecraft, en navegador o de escritorio.

- Formatos: Java Block/Item Model, modelo de entidad, geometría de Bedrock.
- Edición por cubos, UV sobre la textura, pintado dentro del programa.
- Animación con keyframes.
- Plugins para exportar e importar a cada ecosistema.

Es la herramienta con la que vamos a hacer todos los modelos del proyecto.

![La interfaz de Blockbench: cubos a la izquierda, modelo en el centro, UV sobre la textura a la derecha.](/teorico/blockbench-interfaz.png)

---

## Blockbench: cómo encaja en el mod

- Bloque o ítem simple: Blockbench exporta un JSON de modelo que va directo a `assets/<mod>/models/`.
- Entidad animada: el modelo y la animación se exportan para GeckoLib, que los reproduce desde el mod.
- La textura exportada va a `assets/<mod>/textures/` y el JSON la referencia por nombre.

Cuidado con dos cosas: el tamaño del modelo, que tiene límites, y la ruta de la textura, que es el error número uno.

---

## Texturas

Pixel art a 16 por 16 para que pegue con el juego.

- Aseprite, pago y excelente. LibreSprite y Pixelorama, libres.
- GIMP o Krita sirven si ya los usan.
- Nada de redimensionar con suavizado: el pixel tiene que quedar duro.
- Mismo formato: PNG con transparencia.

---

## IntelliJ IDEA

Es el IDE estándar para esto, y la Community Edition alcanza.

- Plugin `Minecraft Development`: entiende mixins, valida inyecciones, crea proyectos.
- Navegación al código del juego descompilado: ahí se aprende de verdad.
- Debugger con breakpoints dentro del juego corriendo.
- Hot swap: cambiar el cuerpo de un método sin reiniciar.

---

## Gradle

El build system. No hay que instalarlo: el proyecto trae el wrapper.

- `./gradlew build` compila y arma el `.jar` del mod.
- `./gradlew runClient` levanta el juego con el mod puesto.
- `./gradlew runServer` levanta un servidor dedicado.
- La primera corrida baja el juego, lo descompila y aplica mappings. Tarda. Las siguientes no.

Si Gradle falla, el 90 por ciento de las veces es la versión de Java o la red.

---

## Referencias que sí sirven

- Documentación oficial del loader elegido. Siempre primero y siempre con la versión que usamos.
- Minecraft Wiki: formatos de JSON, mecánicas, valores.
- Generadores de Misode: armar recetas, loot tables y data packs con un formulario.
- Modrinth y CurseForge: para publicar y para leer código de mods abiertos.
- Código fuente de mods con licencia abierta: la mejor fuente de ejemplos reales.

---

## Probar y medir

- Prism Launcher: instancias separadas para probar el `.jar` final como lo vería un jugador.
- Logs: la consola de Gradle y `logs/latest.log`. Leer el stack trace completo, no la última línea.
- spark o el profiler integrado del juego cuando algo va lento.
- Un mundo de pruebas en creativo, plano, guardado aparte.

![La pantalla F3: el juego informando su propio estado, chunk y rendimiento mientras corre.](/teorico/pantalla-debug.png)
