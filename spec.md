# Spec Funcional — Juego Infantil de Memoria Educativo (HTML/CSS/JS)

## Objetivo del Proyecto

Desarrollar un videojuego educativo infantil tipo “Memoria” ejecutable en navegador web (HTML/CSS/JavaScript puro), orientado a niños en etapa inicial de lectura.

El juego debe combinar:

* reconocimiento visual,
* asociación imagen → palabra,
* memoria,
* refuerzo positivo,
* interfaz accesible y amigable.

---

# Concepto del Juego

El usuario deberá encontrar parejas de cartas.

Cada pareja estará formada por:

1. una carta con imagen,
2. una carta con el nombre correspondiente a esa imagen.

Ejemplo:

* Carta A → foto de “Juan”
* Carta B → texto “JUAN”

Cuando ambas coinciden:

* quedan descubiertas,
* se suman puntos,
* se reproduce feedback positivo.

Cuando no coinciden:

* se ocultan nuevamente luego de una breve animación.

---

# Público Objetivo

Niños de:

* 4 a 9 años aproximadamente.

Por eso el diseño debe priorizar:

* simplicidad,
* letras grandes,
* navegación intuitiva,
* feedback visual/sonoro claro,
* mínima cantidad de texto.

---

# Stack Tecnológico

## Frontend

* HTML5
* CSS3
* JavaScript Vanilla

## Opcional futuro

* LocalStorage
* PWA (instalable)
* Exportable a APK vía Capacitor/Cordova

---

# Requisitos Funcionales

## 1. Pantalla Inicial

### Elementos

* Logo/título del juego
* Input para nombre del jugador
* Botón “COMENZAR”
* Botón “CARGAR IMÁGENES”
* Selector de dificultad

### Validaciones

* El nombre no puede estar vacío.
* Debe haber mínimo 2 pares cargados.

---

# 2. Carga de Imágenes Personalizadas

## Objetivo

Permitir que padres/docentes carguen imágenes desde la PC.

## Comportamiento

El usuario podrá seleccionar múltiples archivos:

* JPG
* PNG
* WEBP

## Generación Automática de Parejas

El sistema:

1. toma la imagen,
2. extrae el nombre del archivo,
3. elimina extensión,
4. convierte el texto a MAYÚSCULAS,
5. crea automáticamente:

   * carta imagen,
   * carta texto.

Ejemplo:

```txt
juan.png → JUAN
mama.jpg → MAMA
perro.webp → PERRO
```

---

# 3. Tablero del Juego

## Distribución

Grid responsive.

### Dificultades sugeridas

| Dificultad | Pares | Grid |
| ---------- | ----- | ---- |
| Fácil      | 4     | 4x2  |
| Media      | 6     | 4x3  |
| Difícil    | 8     | 4x4  |

---

# 4. Mecánica de Juego

## Flujo

### Paso 1

Jugador hace click en una carta.

### Paso 2

Carta se da vuelta.

### Paso 3

Jugador selecciona segunda carta.

### Paso 4 — Validación

#### Si coinciden:

* quedan visibles,
* sumar puntos,
* sonido positivo,
* animación feliz,
* incrementar contador de parejas.

#### Si NO coinciden:

* esperar 1 segundo,
* volver a ocultar,
* restar puntos leves,
* sonido suave de error.

---

# 5. Sistema de Puntaje

## Variables

### Puntos Base

* Coincidencia correcta: +100

### Bonus

* Coincidencia al primer intento: +50
* Racha de aciertos: multiplicador

### Penalización

* Error: -10

### Nunca bajar de:

```txt
0 puntos
```

---

# 6. Panel de Score (HUD)

Visible permanentemente.

## Debe mostrar:

* Nombre del jugador
* Puntaje actual
* Parejas encontradas
* Intentos
* Errores
* Tiempo transcurrido
* Racha actual

---

# 7. Fin de Partida

## Condición

Todas las parejas encontradas.

## Mostrar

* Puntaje final
* Tiempo total
* Estrellas/ranking
* Mensaje motivacional

Ejemplos:

* “¡EXCELENTE!”
* “¡MUY BIEN!”
* “¡SEGUÍ PRACTICANDO!”

---

# 8. Ranking Local

## Deseable

Guardar localmente:

* nombre,
* puntaje,
* fecha.

Usar:

```txt
localStorage
```

---

# Requisitos de UX/UI

## Tipografía

Muy importante:
usar fuente en MAYÚSCULAS amigable para niños.

## Recomendadas

* Atkinson Hyperlegible
* Lexend
* Comic Neue
* Fredoka
* Baloo 2

## Regla

Todo texto visible:

```txt
text-transform: uppercase;
```

---

# Diseño Visual

## Estilo

* Colorido
* Simple
* Alto contraste
* Bordes redondeados
* Íconos grandes

## Evitar

* Mucho texto
* Interfaces complejas
* Menús pequeños

---

# Animaciones

## Deseables

* Flip de cartas
* Glow al acertar
* Shake suave al errar
* Confetti al ganar

---

# Audio

## Sonidos sugeridos

* Flip carta
* Acierto
* Error suave
* Victoria

## Importante

Debe existir:

```txt
Botón SILENCIAR
```

---

# Accesibilidad

## Requisitos importantes

### Fuente grande

Mínimo:

```txt
18px
```

### Soporte táctil

Compatible con tablets.

### Contraste

WCAG AA deseable.

### Tiempo de lectura

No ocultar demasiado rápido las cartas incorrectas.

---

# Arquitectura Sugerida

```txt
/index.html
/css
   styles.css
/js
   game.js
   board.js
   score.js
   storage.js
/assets
```

---

# Modelo de Datos

## Carta

```js
{
  id: 1,
  type: "image", // o "text"
  pairId: "juan",
  value: "JUAN",
  image: "blob/url",
  matched: false,
  revealed: false
}
```

---

# Estados del Juego

```txt
INIT
LOADING
PLAYING
PAUSED
FINISHED
```

---

# Requisitos Técnicos

## Compatibilidad

* Chrome
* Firefox
* Edge
* Tablets Android/iPad

---

# Performance

## Objetivo

* carga instantánea,
* animaciones fluidas,
* responsive.

---

# Funcionalidades Extra Recomendadas

## 1. Modo Voz (MUY recomendado)

Cuando se descubre una carta:

* leer el nombre usando SpeechSynthesis API.

Ejemplo:

```js
speechSynthesis.speak(...)
```

Esto ayuda muchísimo en alfabetización.

---

## 2. Categorías

Permitir packs:

* familia,
* animales,
* colores,
* números,
* objetos.

---

## 3. Modo Cooperativo

2 jugadores alternando turnos.

---

## 4. Niveles Adaptativos

Aumentar dificultad automáticamente.

---

## 5. Modo Docente/Padres

Pantalla donde:

* cargan imágenes,
* administran sets,
* guardan colecciones.

---

# Requisitos Deseables

## Responsive

Debe funcionar:

* desktop,
* tablet,
* celular horizontal.

---

# Seguridad

## Importante

Las imágenes:

* no se suben a servidor,
* se procesan localmente.

Usar:

```js
URL.createObjectURL()
```

---

# Flujo Completo del Usuario

```txt
1. Ingresa nombre
2. Carga imágenes
3. Selecciona dificultad
4. Presiona comenzar
5. Encuentra parejas
6. Ve puntaje en tiempo real
7. Completa tablero
8. Guarda récord
```

---

# Ideas Extra que Pueden Hacerlo Mucho Mejor

## “Álbum Familiar”

Que los padres carguen:

* fotos familiares,
* mascotas,
* compañeros,
* docentes.

Esto vuelve el juego extremadamente atractivo para niños.

---

## Modo “Aprender a Leer”

Cuando se encuentra el par:

* mostrar la palabra grande,
* separarla en sílabas,
* reproducir pronunciación.

Ejemplo:

```txt
SO-FÍ-A
```

---

## Sistema de Recompensas

Desbloquear:

* stickers,
* estrellas,
* medallas,
* fondos.

---

# MVP Recomendado (Primera Versión)

## Incluir SOLO:

* carga de imágenes,
* pares imagen/texto,
* tablero,
* score,
* nombre jugador,
* sonidos,
* responsive.

## Dejar para V2:

* ranking online,
* perfiles,
* multiplayer,
* packs descargables.

---

# Criterios de Aceptación

## El juego se considera completo cuando:

* Se pueden cargar imágenes locales.
* Se generan pares automáticamente.
* El tablero funciona correctamente.
* Las cartas coincidentes permanecen visibles.
* El score se actualiza en tiempo real.
* El juego funciona en desktop y tablet.
* El usuario puede finalizar una partida completa sin errores.

---

# Nombre Tentativo del Juego

* “ENCONTRÁ LA PAREJA”
