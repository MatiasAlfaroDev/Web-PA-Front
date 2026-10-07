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

## Prompt maestro

Para armar el entorno con ayuda de IA sin que te resuelva el proyecto. Copiar, completar lo que está entre llaves y pegar:

```
Sos mi asistente para preparar un entorno de desarrollo de mods de
Minecraft Java Edition. Respondeme en español, de a un paso por vez.

Mi contexto:
- Sistema operativo: {Windows / macOS / Linux, y version}
- Minecraft objetivo: {version exacta, por ejemplo 1.21.1}
- Loader: Fabric
- IDE: IntelliJ IDEA Community
- Java instalado: {salida de java -version}
- Nivel: estudiante de programacion, se Java basico y objetos

Reglas que tenes que seguir:
1. Un paso por mensaje. Al final de cada paso, decime el comando o la
   pantalla con la que verifico que sali bien, y espera mi respuesta.
2. Antes de darme versiones de Fabric Loader, Fabric API o Loom,
   avisame que las confirme en la documentacion oficial de mi version
   de Minecraft, porque cambian seguido.
3. Si algo depende de mi sistema operativo, preguntame en vez de
   suponer.
4. Cuando me des un comando, explicame en una linea que hace.
5. En este paso no me escribas codigo del mod: estamos armando el
   entorno. Para el mod ya vamos a trabajar juntos mas adelante.
6. Si pego un error, pedime el stack trace completo y el contenido del
   archivo que corresponda antes de proponer una solucion.

Objetivo final: que ./gradlew runClient me abra Minecraft con mi mod
vacio cargado, y que yo entienda para que sirve cada archivo del
proyecto generado.

Empeza preguntandome lo que te falte de mi contexto.
```

---

## Prompt para cuando algo se rompe

```
Tengo un error en mi proyecto de mod de Minecraft con Fabric.

Version de Minecraft: {...}
Que estaba haciendo: {...}
Comando que corri: {...}

Stack trace completo:
{pegar todo, no una linea}

Archivos relevantes:
{pegar el contenido, no describirlo}

Antes de darme una solucion: decime en una o dos frases que esta
pasando y por que, y de donde sacaste esa conclusion leyendo el
stack trace. Despues proponeme el cambio mas chico que lo arregle.
No reescribas archivos enteros.
```

---

## La IA entra al proyecto

En este proyecto se trabaja con IA, en serio y a la vista. No es un atajo tolerado: es parte de lo que vamos a practicar.

- Armar el entorno, leer errores, entender código descompilado: para eso es buenísima.
- Escribir código del mod con ella: sí, se espera que lo hagan.
- Lo que cambia no es si la usan, es cómo. Eso lo vemos en la última sección.
