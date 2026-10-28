# BYTE HQ

Una oficina virtual 3D con un pequeño robot, luces cálidas y espacio para las ideas. Construida con React, TypeScript, Vite, Three.js, React Three Fiber y Drei. Toda la habitación y BYTE son geometría procedural: no se descargan modelos, fuentes ni texturas de servicios externos en tiempo de ejecución.

## Aplicación de Windows (.exe)

La distribución de escritorio es **BYTE-HQ-0.1.0-Windows-x64.exe**, un ejecutable portátil para Windows 10/11 de 64 bits. No necesita instalar Node.js ni iniciar una terminal: abre el archivo con doble clic. Incluye la interfaz 3D y el adaptador local. Las preferencias se conservan en el perfil local de la aplicación.

Al abrirse, la aplicación inicia el adaptador en `127.0.0.1:8787`; los ejemplos de eventos de este documento funcionan sin cambios. Al cerrar la ventana, también cierra su adaptador. Solo se permite una instancia: abrirla de nuevo enfoca la ventana existente. Si el puerto está ocupado por `npm run dev` u otra herramienta, cierra ese proceso antes de iniciar el ejecutable. El ejecutable no está firmado con un certificado de editor y Windows puede mostrar un aviso de editor desconocido.

Para generar el ejecutable desde el código fuente:

```powershell
npm ci
npm run dist:win
```

El resultado se guarda en `release`. Para probar la ventana de Electron desde el código, usa `npm run desktop`. La interfaz de escritorio mantiene el renderizador aislado, sin acceso a Node.js, y carga solo archivos incluidos en la aplicación. Las comprobaciones automatizadas validan también el servidor de archivos de escritorio y los eventos sobre la compilación de producción. La ejecución nativa del `.exe` debe comprobarse en Windows; el entorno de desarrollo en la nube utiliza Linux.

## Descargar desde GitHub Actions

En GitHub abre **Actions → BYTE HQ — ejecutable de Windows**, selecciona la ejecución más reciente que haya terminado correctamente y descarga **BYTE-HQ-Windows-x64** en la sección **Artifacts**. Inicia sesión con tu cuenta de GitHub para descargarlo. Extrae el ZIP y abre el archivo `BYTE-HQ-0.1.0-Windows-x64.exe`; no necesitas instalar Node.js.

El flujo de la rama `codex/byte-hq-windows` compila el ejecutable en Windows, abre esa aplicación real, comprueba la escena y un evento externo, y guarda una captura junto al ejecutable. La descarga de Actions se conserva durante 30 días y se puede regenerar ejecutando el flujo de nuevo. El campo de resultados de cada ejecución muestra si la comprobación nativa pasó o falló.

## Iniciar en Windows

1. Instala **Node.js 22.12 o superior** (también funciona con Node 24 LTS) y Git.
2. Abre PowerShell en la carpeta donde quieras guardar el proyecto:

```powershell
git clone https://github.com/luisfabricio7771/Chatgpt-office.git
cd Chatgpt-office
npm ci
npm run dev
```

Abre la dirección que imprime Vite (normalmente `http://localhost:5173`). El comando inicia tanto la web como el adaptador local. Usa `Ctrl+C` para detenerlos. Necesitas un navegador con WebGL y aceleración por hardware. Para trabajar con archivos aún no publicados en GitHub, copia esta carpeta a Windows y ejecuta los mismos comandos desde `npm ci`.

## Explorar

- Arrastra la habitación para rotar; usa la rueda o los botones para acercarte. El botón de restablecer recupera el encuadre inicial.
- Haz clic en BYTE para escucharlo, en las pantallas para abrir la actividad, en la lámpara para cambiar la luz y en la ventana para alternar día/noche.
- Elige uno de los seis estados de demostración o activa su alternancia automática. La simulación siempre se identifica y no aumenta las tareas reales.
- Activa lluvia, iluminación o acabado pixel art. Las preferencias se guardan en localStorage, con un respaldo seguro si el navegador bloquea el almacenamiento.
- El modo cine oculta la interfaz y mueve suavemente la cámara. Sal con `Escape` o el botón de salida.
- El reloj de la habitación usa la hora real del navegador. En la estantería vive una pequeña reliquia RPG.

## Conectar un agente local

La aplicación **no lee los estados internos de ChatGPT ni de Codex**. Un agente o backend autorizado debe emitir eventos. Una conexión abierta solo confirma el adaptador; hasta recibir un evento, la interfaz continúa indicando simulación.

El adaptador escucha **solo en loopback** (`127.0.0.1:8787`), valida los eventos, limita su tamaño y rechaza orígenes web ajenos a localhost. Está pensado para uso local de un solo usuario, sin autenticación. No lo expongas públicamente. Para producción, añade un gateway autenticado con HTTPS/WSS y una política explícita de orígenes.

### Evento de prueba en PowerShell

Con `npm run dev` en otra terminal:

```powershell
$evento = @{ state = 'coding'; message = 'Construyendo componentes...'; id = 'trabajo-001-coding' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:8787/event' -Method Post -ContentType 'application/json; charset=utf-8' -Body ([System.Text.Encoding]::UTF8.GetBytes($evento))

$evento = @{ state = 'success'; message = 'Implementación finalizada'; id = 'trabajo-001-success' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:8787/event' -Method Post -ContentType 'application/json; charset=utf-8' -Body ([System.Text.Encoding]::UTF8.GetBytes($evento))
```

### Protocolo JSON

```json
{
  "id": "tarea-001-pensando",
  "state": "thinking",
  "message": "Analizando la arquitectura..."
}
```

- `state`, obligatorio: `idle`, `thinking`, `coding`, `debugging`, `success`, `break`.
- `message`, opcional: hasta 280 caracteres, siempre se representa como texto.
- `id`, opcional: hasta 100 caracteres. Usa un ID único por evento; los IDs repetidos no vuelven a contabilizarse (ventana de 1000 IDs en memoria).
- Los éxitos externos incrementan el contador de sesión; sin ID, repetir `success` consecutivamente cuenta una sola vez. No se cuentan líneas de código, horas ni otras métricas inventadas.
- `POST /event` acepta `application/json` y devuelve `202` al difundirlo. `GET /health` comprueba el adaptador.
- `ws://127.0.0.1:8787/events` acepta y difunde los mismos eventos JSON. La web usa el proxy WebSocket de Vite en `/events`. No hay reproducción de eventos antiguos al conectar.
- Si se desconecta el adaptador, la web vuelve a simulación y reintenta cada cuatro segundos. El contador de la sesión permanece; recargar la página lo reinicia.

Para enviar un evento por WebSocket desde Node:

```js
import WebSocket from "ws";
const socket = new WebSocket("ws://127.0.0.1:8787/events");
socket.on("open", () => {
  socket.send(
    JSON.stringify({
      state: "debugging",
      message: "Revisando una prueba...",
      id: "prueba-2",
    }),
  );
  socket.close();
});
```

Variables opcionales: `BYTE_PORT` cambia el puerto del adaptador (el proxy de Vite usa 8787 por defecto; si lo cambias, actualiza su destino). `VITE_BYTE_WS_URL` permite configurar una URL WebSocket diferente antes de iniciar/compilar. No se requieren claves de API.

## Comprobaciones

```powershell
npm run typecheck
npm test
npm run build
npm run preview
```

`preview` sirve la compilación web, sin el proxy de desarrollo. Para eventos en preview, inicia `npm run adapter` y compila con una URL explícita:

```powershell
$env:VITE_BYTE_WS_URL = 'ws://127.0.0.1:8787/events'
npm run build
npm run preview
```

Sin adaptador, la oficina y la simulación siguen funcionando. Las pruebas cubren validación, deduplicación, contador, desconexión y difusión real HTTP/WebSocket. Las pruebas de navegador requieren el servidor activo y Chromium:

```powershell
npx playwright install chromium
$env:CHROMIUM_PATH = ''
npm run test:e2e
```

## Organización

- `src/scene/Office.tsx`: habitación, iluminación de escritorio, pantallas, reloj, lluvia y accesorios.
- `src/scene/Byte.tsx`: mascota y transiciones amortiguadas de sus seis estados.
- `src/scene/World.tsx`: renderizador, cámara ortográfica, controles, sombras y fallback WebGL.
- `src/activity/`: protocolo, estado independiente del renderizado y conexión con reintentos.
- `src/App.tsx`, `styles.css`: interfaz en español, actividad y preferencias.
- `scripts/adapter.mjs`: puente local HTTP/WebSocket.

La escena reduce la resolución real del framebuffer con DPR 0.8, desactiva antialias y escala con bordes nítidos. La opción de preferencias permite un acabado más suave. Geometría simple, texturas pequeñas y sombras acotadas limitan el coste; el rendimiento depende del equipo y no se garantiza 60 FPS. La primera versión prioriza la oficina, el personaje y la integración funcional; no incorpora audio ni servicios en la nube.
