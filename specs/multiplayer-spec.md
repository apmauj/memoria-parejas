# Spec V2 — Multiplayer Local por Turnos (GitHub Pages Compatible)

## Objetivo

Implementar un sistema multiplayer local simple para el juego de memoria educativo, permitiendo que:

* jueguen de 1 a 4 personas,
* compartan el mismo dispositivo,
* jueguen por turnos,
* acumulen puntaje individual,
* al finalizar se genere un ranking.

IMPORTANTE:
El juego debe seguir siendo:

* 100% frontend,
* sin backend,
* compatible con GitHub Pages,
* ejecutable offline opcionalmente.

---

# Alcance de la V2

## Incluir

* Multiplayer local por turnos
* Configuración de jugadores
* Score individual
* Cambio automático de turno
* Ranking final
* HUD multiplayer
* Pantalla final con ganador

---

# NO incluir

* Backend
* WebSockets
* Login
* Multiplayer online
* Servidor
* Base de datos remota

---

# Compatibilidad Técnica

## Debe funcionar en:

* GitHub Pages
* Navegadores modernos
* Tablets
* PCs
* Modo touch

---

# Concepto de Juego Multiplayer

Todos los jugadores usan:

* el mismo tablero,
* la misma pantalla,
* el mismo mouse/touch.

Los jugadores juegan:

```txt id="3bmn0o"
POR TURNOS
```

---

# Flujo General

```txt id="9o5fzw"
1. Elegir cantidad de jugadores
2. Escribir nombres
3. Cargar imágenes
4. Iniciar partida
5. Jugadores alternan turnos
6. Se acumulan puntos individuales
7. Finaliza partida
8. Mostrar ranking final
```

---

# Configuración Inicial

## Pantalla “Jugadores”

### Selector

Cantidad de jugadores:

* 1
* 2
* 3
* 4

---

# Inputs de Nombre

## Ejemplo

```txt id="cbdbx6"
JUGADOR 1: SOFIA
JUGADOR 2: JUAN
JUGADOR 3: MARTINA
JUGADOR 4: LUCAS
```

---

# Validaciones

## Requisitos

* mínimo 1 nombre válido,
* nombres únicos deseable,
* máximo 12 caracteres recomendado.

---

# Estructura de Datos

## Player

```js id="cpr1yv"
{
  id: 1,
  name: "SOFIA",
  score: 0,
  matches: 0,
  mistakes: 0,
  streak: 0,
  turnsPlayed: 0
}
```

---

# Sistema de Turnos

## Regla principal

Solo un jugador puede jugar a la vez.

---

# Indicador Visual

Debe mostrarse claramente:

```txt id="f9y0vw"
TURNO DE SOFIA
```

---

# Recomendación UX

## Resaltar jugador actual

* borde brillante,
* color especial,
* avatar iluminado,
* animación suave.

---

# Reglas de Turno

## Si el jugador acierta

### Opción recomendada (más divertida)

El jugador:

```txt id="zc9bne"
SIGUE JUGANDO
```

hasta fallar.

---

## Si falla

* pierde turno,
* cartas se ocultan,
* siguiente jugador juega.

---

# Orden de Turnos

## Sistema circular

```txt id="w0cqg6"
1 → 2 → 3 → 4 → 1
```

---

# Score Multiplayer

## Cada jugador tiene:

* puntos,
* parejas encontradas,
* errores,
* racha.

---

# Sistema de Puntos

## Recomendado

| Acción                | Puntos |
| --------------------- | ------ |
| Pareja correcta       | +100   |
| Primer intento rápido | +50    |
| Racha                 | +25    |
| Error                 | -10    |

---

# Restricciones

## Nunca permitir:

```txt id="g2qh1l"
score < 0
```

---

# HUD Multiplayer

## Panel superior o lateral

Cada jugador debe tener:

* nombre,
* puntos,
* parejas,
* color/avatar.

---

# Ejemplo Visual

```txt id="x8efwq"
SOFIA ⭐ 320
JUAN ⭐ 180
LUCAS ⭐ 90
```

---

# Ranking Dinámico

## Deseable

El HUD puede reordenarse automáticamente según score.

---

# Animaciones Multiplayer

## Cuando cambia turno

Mostrar transición:

```txt id="nh5ovj"
AHORA JUEGA JUAN
```

---

# Duración sugerida

Entre:

```txt id="fgknbn"
1 y 2 segundos
```

---

# Fin de Partida

## Condición

Todas las parejas descubiertas.

---

# Pantalla Final

## Mostrar

### Ranking completo

```txt id="oc5byi"
🥇 SOFIA - 850
🥈 JUAN - 600
🥉 MARTINA - 450
```

---

# Mostrar también

* cantidad de parejas,
* errores,
* precisión,
* tiempo total.

---

# Cálculo de Precisión

## Fórmula

\text{Precisión} = \frac{\text{Aciertos}}{\text{Intentos}} \times 100

---

# Bonus Opcional

## Premio especial

### Categorías

* Mejor memoria
* Menos errores
* Más rápido
* Mejor racha

---

# Modo 1 Jugador

## Debe seguir funcionando

El multiplayer local NO reemplaza:

```txt id="8m76br"
single player
```

---

# Configuración de Dificultad

## Compatible con multiplayer

| Modo    | Pares |
| ------- | ----- |
| Fácil   | 4     |
| Medio   | 6     |
| Difícil | 8     |
| Experto | 12    |

---

# Recomendaciones de UX Infantil

## Importante

Cuando cambia turno:

* pausar interacción brevemente,
* evitar clicks accidentales,
* mostrar feedback visual grande.

---

# Sistema de Colores

## Recomendado

Cada jugador:

* tiene color propio,
* avatar simple,
* ícono.

Ejemplo:

* Azul
* Verde
* Amarillo
* Rojo

---

# Avatares Simples (Deseable)

## Opciones

* estrella,
* dinosaurio,
* gato,
* cohete.

---

# Persistencia Local

## Deseable

Guardar:

* últimos jugadores,
* mejores scores,
* configuraciones.

Usar:

```txt id="e8rz9d"
localStorage
```

---

# Ranking Histórico Local

## Opcional

Tabla:

* nombre,
* puntaje,
* fecha.

---

# Arquitectura Recomendada

```txt id="z22mhv"
/js
  game.js
  board.js
  multiplayer.js
  score.js
  storage.js
```

---

# Multiplayer.js — Responsabilidades

## Debe manejar:

* jugadores,
* turnos,
* score,
* ranking,
* cambio de jugador,
* fin de partida.

---

# Estados del Juego

```txt id="jlwm2r"
SETUP
PLAYING
TURN_TRANSITION
FINISHED
```

---

# Lógica Recomendada

## Variable actual

```js id="smbtqg"
let currentPlayerIndex = 0;
```

---

# Cambio de Turno

```js id="7b8brv"
currentPlayerIndex =
  (currentPlayerIndex + 1) % players.length;
```

---

# Requisitos de Accesibilidad

## Importantes

* Letras grandes
* Alto contraste
* Indicador de turno MUY visible
* Compatible touch
* Tiempo suficiente para lectura

---

# Sonidos Multiplayer

## Recomendados

### Cambio turno

“ding”

### Victoria

fanfarria suave

### Error

sonido corto amigable

---

# Responsive

## Tablets MUY importantes

El HUD debe:

* reacomodarse,
* evitar tapar tablero.

---

# Layout Recomendado

## Desktop

HUD lateral.

## Tablet/Móvil

HUD horizontal arriba.

---

# Recomendaciones Técnicas

## IMPORTANTE

No usar:

* frameworks pesados,
* backend,
* dependencias innecesarias.

---

# Stack Ideal

## Simple y portable

* HTML
* CSS
* JS Vanilla

Compatible con:

```txt id="ggm6uq"
GitHub Pages
```

---

# Funcionalidades Deseables Futuras

## V3

* Equipos
* Cooperativo
* Temporizador por turno
* Minitorneos
* Estadísticas avanzadas

---

# MVP Multiplayer Local

## Para considerar V2 completa

Debe incluir:

✅ 1–4 jugadores
✅ Turnos automáticos
✅ Score individual
✅ Ranking final
✅ Cambio visual de turno
✅ Compatible touch
✅ Funciona en GitHub Pages

---

# Recomendación Importante de Diseño

Para niños pequeños, el multiplayer competitivo funciona mejor si:

* las penalizaciones son suaves,
* todos reciben feedback positivo,
* incluso el último lugar recibe celebración.

---

# Sugerencia UX Muy Valiosa

En vez de:

```txt id="w13c1u"
PERDISTE
```

usar:

```txt id="xpphzw"
¡MUY BIEN JUGADO!
```

y destacar:

* aciertos,
* progreso,
* participación,
* mejora.
