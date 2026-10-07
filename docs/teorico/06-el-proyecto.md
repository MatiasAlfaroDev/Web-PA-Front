# 6. El proyecto

Alcance, calendario, uso de IA y entrega.

---

## Alcance

Un mod de Minecraft Java Edition, hecho en equipo, construido con IA como herramienta de trabajo.

- Fabric, versión de Minecraft fija para todo el grupo.
- Tema libre, pero con una idea que se pueda explicar en una frase.
- Chico y terminado le gana a grande y a medias. Siempre.
- Assets propios: modelos hechos en Blockbench, texturas hechas por ustedes.

Lo que no entra: multi-loader, portar a Bedrock, servidor público, mods de 200 ítems.

---

## El calendario

Cinco semanas, del lunes 5 de octubre al viernes 6 de noviembre. Cada semana va de lunes a viernes, y el viernes se muestra lo que haya. Ajustar por feriados.

1. 5 al 9 de octubre: entorno andando, mod vacío cargando, repo creado.
2. 12 al 16 de octubre: ítem, bloque, receta y textura. Idea cerrada y alcance escrito.
3. 19 al 23 de octubre: la mecánica central funcionando, aunque esté fea.
4. 26 al 30 de octubre: modelos y texturas propias, mensajes al jugador, balance. Congelamiento el viernes 30: después no entran funciones nuevas, sólo arreglos.
5. 2 al 6 de noviembre: pruebas en instancia limpia, README, bitácora, presentación. Entrega el viernes 6.

Son cinco semanas y no diez: por eso el alcance se cierra en la segunda, y lo que no entra se corta temprano, no el último día.

---

## Hitos que se controlan en clase

- Semana 1: `./gradlew runClient` abre el juego con el mod del equipo.
- Semana 2: un ítem y un bloque propios, con textura y nombre en español, y el alcance de una carilla en el repo.
- Semana 3: demo de la mecánica central, en vivo, en una compu del equipo.
- Semana 4: el mod se instala desde el `.jar` en una instancia limpia.
- Semana 5: presentación y entrega.

Un hito no cumplido no se arrastra en silencio: se avisa y se reordena el alcance.

---

## Cómo trabajamos con IA

La regla es una sola: la IA propone, ustedes deciden.

- Pedir siempre con la versión de Minecraft y el loader en el pedido.
- Pedir el cambio más chico posible, no archivos enteros.
- Antes de pegar código, leerlo y poder decir qué hace cada línea.
- Si no entendés una línea, preguntale por esa línea. Eso es usar bien la herramienta.
- Probar en el juego después de cada cambio, no después de diez.

---

## Bitácora de IA

Cada equipo entrega una bitácora en el repo, en `docs/bitacora.md`. No es un castigo, es parte del trabajo.

Una entrada por sesión de trabajo, corta:

- Qué querían lograr.
- El prompt que funcionó, pegado tal cual.
- Qué les devolvió la IA y qué tuvieron que corregir.
- Qué aprendieron del juego en el camino.

Al final del proyecto esa bitácora vale tanto como el código.

---

## Dónde la IA miente

Es predecible, y conviene saber dónde mirar:

- Mezcla versiones: te da la API de 1.16 para un proyecto de 1.21. Es el error más común y el más caro.
- Inventa métodos que suenan razonables y no existen.
- Da mixins que compilan y rompen otra cosa.
- Olvida el lado: te hace tocar el cliente cuando el dato vive en el servidor.
- Te propone una librería para algo que el juego ya hace.

El compilador y el juego corriendo son los únicos que no mienten.

---

## Cómo se evalúa

Si la IA escribe código, lo que se evalúa es el criterio. Cuatro cosas:

1. Funciona: se instala en una instancia limpia y hace lo que promete.
2. Lo entienden: cualquiera del equipo explica cualquier parte. Esto se pregunta en la presentación.
3. Proceso: commits, bitácora, alcance cumplido, hitos.
4. Oficio: assets propios, nombres claros, nada de código muerto pegado de más.

Un mod que anda y que nadie del equipo puede explicar vale menos que uno más chico y entendido.

---

## La entrega

Viernes 6 de noviembre, en el repo del equipo:

- El código, con `.gitignore` sano y sin `build/` ni `run/`.
- El `.jar` del mod, o las instrucciones exactas para generarlo.
- `README.md`: qué es, versión de Minecraft y loader, cómo instalarlo, quién hizo qué.
- `docs/bitacora.md`.
- Presentación de diez minutos: el mod en vivo, una decisión técnica que les costó, y una vez que la IA los mandó al lado equivocado.

---

## Lo que viene

- Hoy queda el entorno andando y el mod vacío cargando.
- Próxima clase: ítem, bloque y receta, con todos los archivos.
- Semana del 12: cada equipo defiende su idea y cierra el alcance.

Traigan el entorno funcionando. La clase que viene no se arma entornos.
