# Spec V2 — Multiplayer para Juego Infantil de Memoria Educativo

## Objetivo

Agregar funcionalidades multijugador al juego de memoria educativo, permitiendo:

* partidas locales,
* partidas online,
* interacción cooperativa y competitiva,
* experiencia segura para niños,
* sincronización en tiempo real.

El multiplayer debe priorizar:

* simplicidad,
* baja fricción,
* UX infantil,
* facilidad para familias/docentes.

---

# Objetivos de Diseño

## Prioridades

### 1. Fácil de usar

Un niño debe poder:

* crear partida,
* unirse,
* jugar,
  sin conocimientos técnicos.

---

### 2. Seguro

Evitar:

* chats abiertos,
* contenido libre,
* exposición pública.

---

### 3. Social

Favorecer:

* cooperación,
* aprendizaje conjunto,
* juego familiar.

---

# Arquitectura General

## Frontend

* HTML/CSS/JS
* WebSocket client

## Backend sugerido

Node.js + WebSocket server.

Opciones:

* Socket.IO
* Colyseus
* Firebase Realtime
* Supabase Realtime

---

# Modos Multiplayer

| Modo          | Tipo    |
| ------------- | ------- |
| Local Hotseat | Offline |
| Online 1 vs 1 | Online  |
| Cooperativo   | Online  |
| Aula/Clase    | Online  |
| Torneo        | Online  |

---

# 1. Modo Local (Hotseat)

## Objetivo

Dos o más niños jugando en el mismo dispositivo.

## Funcionamiento

* Los jugadores alternan turnos.
* El tablero es compartido.
* El score se separa por jugador.

## Reglas

* Si acierta:

  * sigue jugando.
* Si falla:

  * cambia turno.

## UI

Panel superior:

```txt
TURNO DE SOFÍA
```

---

# 2. Multiplayer Online 1 vs 1

## Flujo

### Crear Sala

Jugador:

* escribe nombre,
* crea sala.

El sistema genera:

* código corto,
* QR opcional.

Ejemplo:

```txt
AB7K
```

---

### Unirse a Sala

Segundo jugador:

* ingresa código,
* entra a partida.

---

# Estados de Sala

```txt
WAITING
READY
PLAYING
FINISHED
DISCONNECTED
```

---

# Mecánica Online

## Turnos

### Si acierta:

* mantiene turno.

### Si falla:

* turno cambia automáticamente.

---

# Sincronización

## Debe sincronizar:

* cartas reveladas,
* cartas acertadas,
* score,
* turno actual,
* tiempo,
* fin de partida.

---

# Eventos WebSocket

## Cliente → Servidor

```js
CREATE_ROOM
JOIN_ROOM
START_GAME
FLIP_CARD
MATCH_FOUND
END_TURN
PLAYER_READY
LEAVE_ROOM
```

---

## Servidor → Cliente

```js
ROOM_CREATED
PLAYER_JOINED
GAME_STARTED
CARD_REVEALED
MATCH_SUCCESS
MATCH_FAILED
TURN_CHANGED
GAME_FINISHED
PLAYER_DISCONNECTED
```

---

# Modelo de Datos Multiplayer

## Player

```js
{
  id: "socket-id",
  name: "SOFIA",
  score: 350,
  matches: 4,
  connected: true
}
```

---

## Room

```js
{
  roomId: "AB7K",
  players: [],
  gameState: {},
  currentTurn: 0,
  status: "PLAYING"
}
```

---

# Reglas de Juego Online

## Validación centralizada

IMPORTANTE:
El servidor debe validar:

* coincidencias,
* score,
* turnos.

Nunca confiar únicamente en frontend.

---

# Anti-Cheat Básico

## Validaciones

* impedir doble click rápido,
* impedir revelar 3 cartas,
* impedir acciones fuera de turno.

---

# 3. Modo Cooperativo

## Objetivo

Todos juegan juntos contra el tablero.

## Características

* score compartido,
* sin turnos,
* cronómetro común,
* meta grupal.

Ideal para:

* padres + hijos,
* aula escolar,
* terapia educativa.

---

# 4. Modo Aula / Classroom

## Objetivo

Un docente controla múltiples jugadores.

---

# Funcionalidades

## Docente puede:

* crear sala,
* elegir dificultad,
* cargar imágenes,
* iniciar partida,
* ver progreso de alumnos.

---

# Vista Docente

## Panel con:

* jugadores conectados,
* score individual,
* tiempo,
* ranking,
* actividad.

---

# Funcionalidades Deseables

## Congelar partida

```txt
PAUSE GAME
```

---

## Forzar reinicio

---

## Expulsar jugador

---

# 5. Ranking Online

## Modos

### Global

Top scores.

### Por aula

Ranking privado.

### Familiar

Ranking local familiar.

---

# Base de Datos Sugerida

## Opciones

* Firebase
* Supabase
* PostgreSQL

---

# Tablas

## users

```sql
id
name
avatar
created_at
```

---

## matches

```sql
id
room_id
date
winner
duration
```

---

## scores

```sql
id
user_id
score
matches
errors
```

---

# UX Multiplayer

## Indicadores Visuales

### Turno actual

Glow/color alrededor del jugador.

---

### Jugador desconectado

Ícono gris:

```txt
DESCONECTADO
```

---

### Esperando jugador

Animación amigable.

---

# Diseño de Lobby

## Elementos

* código sala grande,
* botón copiar,
* QR,
* lista jugadores,
* READY status.

---

# Reconexión

## Requisito importante

Si un jugador pierde conexión:

* intentar reconectar automáticamente.

Timeout sugerido:

```txt
30 segundos
```

---

# Audio Multiplayer

## Eventos

* jugador entra,
* turno cambia,
* victoria,
* error.

---

# Accesibilidad Multiplayer

## Requisitos

* feedback visual + sonoro,
* indicadores grandes,
* turnos claros,
* nombres legibles.

---

# Seguridad Infantil

## MUY IMPORTANTE

NO incluir:

* chat libre,
* mensajes personalizados,
* subida pública de imágenes.

---

# Comunicación Segura

## Opciones recomendadas

### Emojis rápidos

Ejemplo:

* 👍
* 🎉
* 😊
* ⭐

---

### Mensajes predefinidos

* “¡BIEN!”
* “TU TURNO”
* “EXCELENTE”

---

# Performance

## Objetivos

### Latencia

Menor a:

```txt
150ms
```

---

### Sincronización

Las cartas deben reflejar cambios casi instantáneamente.

---

# Compatibilidad

## Debe funcionar en:

* Chrome,
* Firefox,
* Edge,
* tablets,
* celulares.

---

# Escalabilidad

## MVP Multiplayer

2 jugadores.

---

## Futuro

Hasta:

```txt
20+ jugadores
```

Modo aula.

---

# Arquitectura Sugerida

## Frontend

```txt
/game
/lobby
/room
/multiplayer
```

---

## Backend

```txt
/socket
/rooms
/game-engine
/auth
```

---

# Flujo Completo Online

```txt
1. Jugador crea sala
2. Obtiene código
3. Otro jugador entra
4. Ambos READY
5. Comienza partida
6. Turnos sincronizados
7. Score actualizado realtime
8. Fin partida
9. Ranking final
```

---

# Funcionalidades Futuras (V3)

## Avatares

Personajes infantiles.

---

## Reacciones animadas

Mini stickers.

---

## Coop con voz

WebRTC opcional.

---

## Modo historia

Resolver tableros cooperativamente.

---

# Recomendación Técnica Importante

## Para MVP online:

Usar:

* frontend estático,
* Socket.IO,
* Node.js,
* rooms simples en memoria.

---

## Evitar inicialmente:

* microservicios,
* arquitectura compleja,
* auth pesada.

---

# MVP Multiplayer Recomendado

## Incluir SOLO

### Online 1v1

* lobby,
* código sala,
* sincronización,
* score,
* turnos.

### Local Hotseat

### Ranking local

---

# Dejar para V3

* cuentas reales,
* chat,
* matchmaking,
* perfiles,
* amigos,
* torneos,
* cross-platform.

---

# Criterios de Aceptación

## Multiplayer V2 completo cuando:

* Dos usuarios pueden conectarse.
* Ambos ven el mismo tablero.
* Los turnos se sincronizan.
* El score se actualiza correctamente.
* El juego finaliza sin desincronización.
* Reconexión básica funciona.
* Compatible con tablets y desktop.

---

# Sugerencia Estratégica Importante

Para este tipo de juego infantil, el modo más fuerte probablemente NO sea competitivo.

El modo:

```txt
PADRE + HIJO COOPERATIVO
```

puede transformarse en la característica diferencial más poderosa del proyecto.

Especialmente si agregas:

* lectura en voz,
* fotos familiares,
* recompensas,
* progreso educativo.
