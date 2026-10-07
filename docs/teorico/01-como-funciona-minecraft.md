# 1. Cómo funciona Minecraft

De qué está hecho el juego al que le vamos a meter código.

---

## Por qué este proyecto

Minecraft es un programa grande, escrito por otra gente, que ya funciona. Meterle código es el ejercicio más honesto que existe:

- Java de verdad, no ejercicios de consola.
- Leer código ajeno antes de escribir el propio.
- Build system, dependencias, versiones, Git.
- Y al final hay algo que se puede mostrar y jugar.

---

## El teórico son seis clases

En Teórico van a encontrar una lección por tema, en este orden:

1. Cómo funciona Minecraft por dentro.
2. Modloaders y frameworks: quién nos deja entrar.
3. Herramientas: Blockbench, IntelliJ, Gradle y compañía.
4. Preparar el entorno de desarrollo.
5. Primeros pasos: el mod mínimo.
6. El proyecto: alcance, calendario y entrega.

Cada una se lee sola y se puede repasar por separado.

---

## Son dos juegos distintos

Mismo nombre, dos programas que no comparten código:

- Java Edition: escrita en Java, corre en la JVM, es la que se modea con código.
- Bedrock Edition: escrita en C++ (consolas, móviles, Windows). Se extiende con add-ons, no con mods de código.

Nosotros vamos a Java Edition. Bedrock lo vemos después como alternativa.

---

## No hay Unity ni Unreal

Minecraft Java no usa un motor comercial. Es un motor propio, escrito por Mojang, que se apoya en pocas librerías:

- LWJGL: el puente de Java hacia OpenGL, GLFW (ventana e input) y OpenAL (audio).
- Netty: la red.
- Brigadier, DataFixerUpper, Gson: comandos, migración de datos, JSON.

Que el motor sea propio y chico es justo lo que hace posible el modding.

---

## El reloj: 20 ticks por segundo

La lógica del juego avanza en pasos fijos llamados ticks:

- 20 ticks por segundo, es decir 50 ms por tick.
- En un tick se mueven entidades, crecen cultivos, avanzan hornos, se aplica física de fluidos.
- El render va aparte y corre lo más rápido que pueda: los FPS no cambian la lógica.

Si tu código tarda más de 50 ms en un tick, el servidor se atrasa. Eso se llama lag de TPS y es culpa del mod, no de la compu.

---

## Siempre hay un cliente y un servidor

Incluso en un mundo de un solo jugador:

- Se levanta un servidor integrado en el mismo proceso.
- El cliente le habla por paquetes, igual que a un servidor remoto.
- El servidor manda: él tiene el estado real del mundo.
- El cliente tiene una copia parcial para dibujar y predecir.

Esta separación es la primera fuente de bugs al modear: código que corre en el lado equivocado o estado que nunca se sincroniza.

---

## El mundo: chunks y secciones

- El mundo se divide en chunks de 16 por 16 bloques, de techo a piso.
- Cada chunk se corta en secciones de 16 por 16 por 16.
- Altura actual: de -64 a 319, o sea 384 bloques.
- Cada sección guarda sus bloques con una paleta: una lista de los estados que aparecen ahí, más índices chicos hacia esa lista.

Por eso una sección de aire puro no pesa casi nada, y por eso tocar bloques es barato pero no gratis.

![Bordes de chunk marcados en el mundo: cada celda es una columna de 16 por 16 que el juego carga y guarda como una unidad.](/teorico/chunks-bordes.png)

---

## Cuánto mide el mundo

![De la capa -64 a la 319: 384 bloques de alto, con el nivel del mar en la 62 y la roca madre abajo de todo.](/teorico/altura-del-mundo.png)

Ese rango es dato de diseño: un bloque que generás fuera de él no existe. Y ojo, el Nether y el End cortan en la capa 255.

---

## Bloques: tres cosas que se confunden

- `Block`: una sola instancia para todo el juego. El bloque de piedra es un objeto, no un objeto por cada piedra del mundo.
- `BlockState`: la combinación concreta de propiedades, inmutable. Una escalera tiene estados por orientación, forma y agua.
- `BlockEntity`: el extra para bloques que necesitan guardar datos o correr lógica por tick (cofre, horno, cartel).

Regla práctica: si tu bloque necesita memoria, necesita un `BlockEntity`. Y si no la necesita, no se lo pongas.

![La misma escalera de roble. Su orientacion es parte del BlockState, no un bloque aparte.](/teorico/escalera-norte.png)

---

## Entidades

- Todo lo que se mueve y no es bloque: mobs, ítems en el piso, flechas, el jugador.
- Cada una tiene posición, hitbox, un tick propio y datos sincronizados hacia el cliente.
- Viven en el chunk que las contiene: si el chunk se descarga, dejan de existir hasta que vuelva.

Las entidades son caras. Mil entidades hacen más daño al rendimiento que mil bloques.

---

## Cómo se dibuja el mundo

El terreno no se dibuja cubo por cubo:

- Cada sección de chunk se compila a una malla de triángulos y se sube a la placa de video.
- Esa malla se rehace sólo cuando algún bloque de la sección cambia.
- Se descarta lo que no se ve: cara contra cara, fuera de cámara, detrás de otros chunks.
- Mojang viene reescribiendo su capa de render, Blaze3D, para separar el juego del backend gráfico.

Conclusión para nosotros: un bloque que cambia de estado 20 veces por segundo obliga a recompilar su sección 20 veces. Eso se nota.

![Distancia de render de 32 chunks. Todo lo que se ve ahi son mallas ya compiladas y subidas a la placa.](/teorico/distancia-render.png)

---

## Casi todo el contenido es JSON

Minecraft ya es data-driven. Fuera de código vive:

- Resource pack: texturas, modelos de bloque e ítem, blockstates, idiomas, sonidos.
- Data pack: recetas, loot tables, avances, tags, generación de mundo, encantamientos.

Tu mod es, en gran parte, un resource pack más un data pack más el código que registra lo que no se puede declarar.

---

## Datos del ítem: componentes

Las versiones recientes reemplazaron el NBT suelto por componentes de ítem: piezas tipadas y declaradas (daño, encantamientos, nombre, comida, etc.).

- Más fácil de leer y de declarar desde JSON.
- Pero rompió casi todo el código viejo que andaba por internet.

Moraleja que vale para todo el proyecto: un tutorial sin número de versión es un tutorial roto.

---

## Java, bytecode y la JVM

Minecraft se distribuye como un `.jar`: bytecode, no código fuente.

- La JVM carga clases en tiempo de ejecución, una por una, cuando se usan.
- Entre que se lee el `.class` y que se ejecuta, alguien puede modificar esos bytes.

Ese hueco es, literalmente, donde entra el modding. No parcheamos archivos del juego: parcheamos las clases al cargarlas, en memoria.

---

## Ofuscación y mappings

El `.jar` que descarga el launcher viene ofuscado: las clases y los métodos se llaman `a`, `b`, `c`.

- Mojang publica mappings oficiales desde 1.14.4, así que hay nombres reales disponibles.
- Fabric usa además Yarn, con nombres de la comunidad.
- NeoForge usa los oficiales, más Parchment para nombres de parámetros.

Por eso no se programa contra el `.jar` del launcher: el entorno de desarrollo baja el juego, le aplica los mappings y recién ahí se puede leer.
