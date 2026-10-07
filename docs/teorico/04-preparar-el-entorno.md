# 4. Preparar el entorno

Dejar la máquina lista para trabajar.

---

## Checklist

Antes de escribir una línea:

1. JDK 21 instalado y seleccionado (Temurin o el de tu distro).
2. IntelliJ IDEA Community con el plugin Minecraft Development.
3. Git configurado con nombre y correo.
4. Cuenta de Minecraft Java para poder entrar al juego de prueba.
5. Cuenta en Modrinth y en CurseForge, que son de donde sale todo lo demás.
6. Espacio en disco: contar unos 5 GB entre caché de Gradle, juego descompilado y mundos.

---

## Paso a paso

1. Verificar Java: `java -version` tiene que decir 21.
2. Generar el proyecto desde la plantilla oficial de Fabric, con el mod id y la versión de Minecraft que fijamos.
3. Abrir la carpeta en IntelliJ y esperar que Gradle termine de importar.
4. Correr `./gradlew runClient` desde la terminal del IDE.
5. Entrar a un mundo nuevo y confirmar que el mod aparece en la lista de mods.
6. Crear la cuenta de Modrinth y la de CurseForge, con un correo que vayas a seguir teniendo el año que viene.
7. Hacer el primer commit recién cuando eso funcione.

El objetivo de hoy no es un mod bueno. Es que el juego arranque desde tu código.

---

## Para qué las dos cuentas

Son los dos repositorios de mods del mundo Java, y los vamos a usar desde el primer día, no sólo al final:

- Bajar `Fabric API` y las librerías que use el proyecto, en la versión exacta.
- Leer la página de un mod parecido al que querés hacer: qué versiones soporta, qué dependencias declara.
- Publicar el mod cuando esté, que es parte de la entrega.

Modrinth es más limpio y tiene su propia app de instancias. CurseForge tiene el catálogo histórico más grande. Tener las dos cuesta cinco minutos.

---

## Problemas típicos del primer arranque

- Java equivocado: hay dos JDK instalados y Gradle usa el otro. Se fija en la configuración de Gradle del proyecto.
- Descarga a medias: borrar la caché del proyecto y volver a importar.
- Falta `Fabric API` en el entorno de desarrollo: hay que declararla como dependencia, no sólo como mod instalado.
- Carpetas con acentos o espacios en la ruta: mover el proyecto.
- Antivirus bloqueando el juego de pruebas.

---

## Prompts maestros

Un prompt flojo pide código. Un prompt maestro define el trabajo.

Los cinco que siguen tienen la misma anatomía:

1. Contexto fijo: versión, loader, equipo. Vive en `CLAUDE.md`.
2. Reglas de trabajo: qué puede hacer y qué no.
3. Objetivo con criterio de aceptación.
4. Verificación: qué corro o qué miro en el juego para comprobarlo.

Si falta el punto 4 no es un prompt, es un deseo.

---

## El contexto va en el repo: `CLAUDE.md`

En la raíz del repo del equipo, no en el chat. Claude Code lo lee solo al abrir el proyecto; con otra herramienta se pega al empezar la conversación.

```
Proyecto: mod de Minecraft Java Edition, materia de 2do BT.
Minecraft {1.21.1} - Loader Fabric - Java 21 - IntelliJ Community
Equipo de {3} personas. Trabajamos por semana, con demo al final.
Sabemos Java basico y objetos. No sabemos la API de Minecraft.

Como quiero que trabajes:
- Respondeme en espanol.
- Un cambio por vez, el mas chico que se pueda probar.
- Antes de darme una API, decime si es de mi version o si dudas.
- No me des un archivo entero si alcanzan tres lineas.
- Terminas siempre diciendo como lo pruebo en el juego.
```

Que viva en el repo y no en la cabeza de uno cambia tres cosas: nadie vuelve a explicar el proyecto en cada charla, que es de donde salen casi todas las respuestas de la versión equivocada; cuando alguien sube la versión de Minecraft lo corrige ahí y queda corregido para todo el equipo; y entra al historial de Git, así que se ve cómo fue cambiando.

Es el mismo archivo que usamos en esta materia para que la IA sepa con qué está trabajando.

---

## Prompt 1: armar el entorno

```
{contexto, si tu herramienta no lee CLAUDE.md}

Sistema operativo: {Windows / macOS / Linux, y version}
Salida de java -version: {pegar}

Guiame a dejar el entorno andando, de a un paso por mensaje.

Reglas:
1. Un paso por mensaje. Cerra cada paso con el comando o la pantalla
   con la que verifico que salio bien, y espera mi respuesta.
2. Antes de darme versiones de Fabric Loader, Fabric API o Loom,
   avisame que las confirme en la documentacion oficial, porque
   cambian seguido.
3. Si algo depende de mi sistema operativo, preguntame.
4. Cada comando viene con una linea que explica que hace.
5. No me escribas codigo del mod todavia.

Listo cuando ./gradlew runClient abra Minecraft con mi mod vacio
cargado y yo pueda decir para que sirve cada archivo generado.

Empeza preguntandome lo que te falte.
```

---

## Prompt 2: planificar el incremento

Antes de escribir código. Convierte una idea en algo que entra en una semana y se puede mostrar.

```
{contexto, si tu herramienta no lee CLAUDE.md}

Quiero sumar esto: {la funcionalidad en una frase, contada como la
vive el jugador}.

No me des codigo todavia. Planifiquemosla:
1. Partila en incrementos que se prueben en el juego por separado,
   del mas chico al mas grande.
2. Para cada uno escribi el criterio de aceptacion en una linea:
   "se verifica asi en el juego".
3. Marca cual conviene hacer primero y por que.
4. Decime que archivos toca ese primero.
5. Avisame si algo depende de la version o del lado, cliente o
   servidor.

Si no entra en una semana de tres personas, decimelo y proponeme
una version mas chica que si entre.
```

---

## Prompt 3: escribir el incremento

```
{contexto, si tu herramienta no lee CLAUDE.md}

Incremento: {el que elegimos en el paso anterior}
Criterio de aceptacion: {la linea que escribimos}
Codigo actual relevante: {pegar los archivos, no describirlos}

Trabajemos de a uno:
1. Decime que vas a cambiar y por que, antes de escribirlo.
2. Dame el cambio mas chico que cumpla el criterio. Diff o fragmento,
   no el archivo completo.
3. Explicame cada linea nueva como si la tuviera que defender yo en
   la demo del viernes.
4. Decime como lo pruebo en el juego, paso por paso.
5. Proponeme el mensaje de commit.

Si para cumplir el criterio hace falta tocar mas de dos archivos,
pará y decime por que.
```

---

## Prompt 4: cuando algo se rompe

```
{contexto, si tu herramienta no lee CLAUDE.md}

Que estaba haciendo: {...}
Comando que corri: {...}

Stack trace completo:
{pegar todo, no una linea}

Archivos relevantes:
{pegar el contenido, no describirlo}

Antes de proponer una solucion: decime en dos frases que esta
pasando y por que, y de donde lo sacaste leyendo el stack trace.
Recien despues dame el cambio mas chico que lo arregle.

Si el stack trace no alcanza para saberlo, pedime lo que te falte
en vez de adivinar.
```

---

## Prompt 5: cerrar la semana

Para el viernes, antes de la demo y de escribir la bitácora.

```
{contexto, si tu herramienta no lee CLAUDE.md}

Esta semana hicimos: {pegar los mensajes de commit}
El hito de la semana era: {el de la clase 6}

Ayudame a cerrar:
1. Decime que del hito quedo cumplido y que no, sin suavizarlo.
2. Marcame el codigo que escribimos a las apuradas y que nos va a
   doler en dos semanas.
3. Proponeme tres lineas para la bitacora: que buscabamos, que
   funciono, que tuvimos que corregirte.
4. Decime con que conviene arrancar el lunes.

No me felicites. Esto es para decidir que hacemos el lunes.
```

---

## Cómo se nota un prompt flojo

- Pide "hazme un mod de X" y recibe trescientas líneas que no compilan.
- No dice la versión, y la respuesta mezcla API de tres versiones.
- Pide el archivo entero, y pierde los cambios propios de ayer.
- No pide verificación, y el error aparece tres cambios después.
- Acepta la primera respuesta sin leerla, y la defiende mal en la demo.

El patrón es siempre el mismo: cuanto más grande el pedido, más caro el error.

---

## La IA entra al proyecto

En este proyecto se trabaja con IA, en serio y a la vista. No es un atajo tolerado: es parte de lo que vamos a practicar.

- Armar el entorno, leer errores, entender código descompilado: para eso es buenísima.
- Escribir código del mod con ella: sí, se espera que lo hagan.
- Lo que cambia no es si la usan, es cómo. Eso lo vemos en la última sección.
