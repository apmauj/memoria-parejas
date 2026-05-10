# Memoria de Parejas

Un juego de memoria educativo para niños, refactorizado con estructura modular y nuevas funcionalidades.

## 🎮 Características

- **Juego de memoria clásico**: Encuentra los pares de cartas
- **Dos modos de juego**:
  - **Por defecto**: Usa emojis predefinidos con palabras comunes
  - **Personalizado**: Carga tus propias imágenes
- **Dificultades**: Fácil (4 pares), Medio (6 pares), Difícil (8 pares)
- **Funcionalidades educativas**:
  - Separación silábica automática
  - Síntesis de voz para pronunciar palabras
  - Sistema de puntuación con rachas
- **Efectos visuales**: Animaciones, confeti al ganar, sonidos
- **Sistema de ranking**: Guarda los mejores puntajes localmente
- **Código QR**: Comparte el juego fácilmente
- **Accesibilidad**: Navegación por teclado, etiquetas ARIA

## 🚀 Despliegue en GitHub Pages

Para habilitar GitHub Pages:

1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Pages**
3. En **Source**, selecciona **Deploy from a branch**
4. Selecciona la rama **deploy** y carpeta **/(root)**
5. Haz clic en **Save**

El juego estará disponible en: `https://[tu-usuario].github.io/memoria-parejas/`

## 📁 Estructura del Proyecto

```
memoria-parejas/
├── index.html           # Estructura HTML principal
├── memo.html            # Archivo original (para referencia)
├── README.md            # Este archivo
├── .nojekyll           # Para compatibilidad con GitHub Pages
└── assets/
    ├── css/
    │   └── styles.css  # Estilos CSS organizados
    └── js/
        └── script.js   # Lógica del juego en JavaScript
```

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesibilidad
- **CSS3**: Animaciones, diseño responsivo, variables CSS
- **JavaScript ES6+**: Lógica del juego, Web Audio API, Canvas API
- **Bibliotecas externas**:
  - Font Awesome (iconos)
  - Google Fonts (tipografía)
  - QRCode.js (generación de códigos QR)

## 🎯 Cómo Jugar

1. **Ingresa tu nombre** en la pantalla de inicio
2. **Elige la dificultad** (fácil, medio, difícil)
3. **Selecciona el modo**:
   - **Juego por defecto**: Juega con palabras y emojis predefinidos
   - **Juego personalizado**: Arrastra y suelta imágenes para crear tus propios pares
4. **Encuentra los pares**: Haz clic en las cartas para voltearlas
5. **Gana puntos**: Obtén puntos por aciertos y rachas consecutivas
6. **Comparte tu puntuación**: Usa el código QR para compartir el juego

## 🎨 Personalización

### Cambiar colores del tema
Edita las variables CSS en `styles.css`:

```css
:root {
  --primary-color: #FF6B35;
  --secondary-color: #00B894;
  --accent-color: #FDCB6E;
  --bg-color: #FEF6E8;
  --text-color: #3D2C1E;
}
```

### Agregar nuevas palabras por defecto
Edita el array `DEFAULT_PAIRS` en `script.js`:

```javascript
const DEFAULT_PAIRS = [
  { name: 'TU_PALABRA', emoji: '🎯', syllables: 'TU-SÍ-LA-BAS' },
  // ... más palabras
];
```

## 📱 Características de Accesibilidad

- Navegación completa por teclado
- Etiquetas ARIA descriptivas
- Contraste de colores adecuado
- Texto alternativo en imágenes
- Síntesis de voz integrada

## 🔧 Desarrollo Local

Para ejecutar el juego localmente:

1. Clona el repositorio
2. Abre `index.html` en tu navegador web
3. No se requieren dependencias adicionales (las bibliotecas externas se cargan desde CDN)

## 📊 Sistema de Puntuación

- **Puntos base**: 100 puntos por pareja encontrada
- **Bonificación primer intento**: +50 puntos si aciertas en el primer intento de una racha
- **Multiplicador de racha**: +25% por cada acierto consecutivo
- **Penalización por error**: -10 puntos por error

## 🎉 Créditos

Juego refactorizado aplicando principios DRY y mejores prácticas de desarrollo web.

---

¡Diviértete aprendiendo con Memoria de Parejas! 🎮✨