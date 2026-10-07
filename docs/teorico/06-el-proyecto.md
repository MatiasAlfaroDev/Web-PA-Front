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

Ocho semanas, del 7 de octubre al 27 de noviembre. Ajustar por feriados.

1. 7 al 11 de octubre: entorno andando, mod vacío cargando, repo creado.
2. 12 al 18: ítem, bloque, receta, textura. Todos los archivos, entendidos.
3. 19 al 25: idea cerrada y alcance escrito. Backlog en el repo.
4. 26 de octubre al 1 de noviembre: la mecánica central funcionando, aunque esté fea.

---

## El calendario, segunda mitad

5. 2 al 8 de noviembre: modelos y texturas propias reemplazando los placeholders.
6. 9 al 15: segunda mecánica, recetas, balance, mensajes al jugador.
7. 16 al 22: congelamiento el viernes 20. Después de esa fecha no entran funciones nuevas, sólo arreglos.
8. 23 al 27: pruebas en instancia limpia, README, bitácora, presentación. Entrega el viernes 27.

---

## Hitos que se controlan en clase

- Semana 1: `./gradlew runClient` abre el juego con el mod del equipo.
- Semana 2: un ítem y un bloque propios, con textura y nombre en español.
- Semana 3: documento de alcance de una carilla, en el repo.
- Semana 4: demo de la mecánica central, en vivo, en una compu del equipo.
- Semana 6: el mod se instala desde el `.jar` en una instancia limpia.
- Semana 8: presentación y entrega.

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

Viernes 27 de noviembre, en el repo del equipo:

- El código, con `.gitignore` sano y sin `build/` ni `run/`.
- El `.jar` del mod, o las instrucciones exactas para generarlo.
- `README.md`: qué es, versión de Minecraft y loader, cómo instalarlo, quién hizo qué.
- `docs/bitacora.md`.
- Presentación de diez minutos: el mod en vivo, una decisión técnica que les costó, y una vez que la IA los mandó al lado equivocado.

---

## Lo que viene

- Hoy queda el entorno andando y el mod vacío cargando.
- Próxima clase: ítem, bloque y receta, con todos los archivos.
- Semana del 19: cada equipo defiende su idea y cierra el alcance.

Traigan el entorno funcionando. La clase que viene no se arma entornos.
