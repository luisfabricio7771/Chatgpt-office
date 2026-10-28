const { app, BrowserWindow, dialog, session } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
let mainWindow;
let adapter;
let quitting = false;

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.whenReady().then(async () => {
    try {
      const modulePath = path.join(
        __dirname,
        "..",
        "scripts",
        "adapter-server.mjs",
      );
      const { startAdapter } = await import(pathToFileURL(modulePath).href);
      adapter = await startAdapter({
        port: Number(process.env.BYTE_PORT || 8787),
        assetsDir: path.join(__dirname, "..", "dist"),
      });
      session.defaultSession.setPermissionRequestHandler(
        (_contents, _permission, callback) => callback(false),
      );
      session.defaultSession.setPermissionCheckHandler(() => false);
      // The renderer runs the bundled UI only; it never receives Node.js access.
      mainWindow = new BrowserWindow({
        width: 1440,
        height: 1000,
        minWidth: 760,
        minHeight: 650,
        title: "BYTE HQ",
        backgroundColor: "#10151b",
        icon: path.join(__dirname, "icon.png"),
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          webSecurity: true,
        },
      });
      mainWindow.removeMenu();
      mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
      mainWindow.webContents.on("will-navigate", (event, url) => {
        if (new URL(url).origin !== adapter.url) event.preventDefault();
      });
      mainWindow.on("ready-to-show", () => mainWindow.show());
      await mainWindow.loadURL(adapter.url);
    } catch (error) {
      dialog.showErrorBox(
        "BYTE HQ no pudo abrirse",
        error.code === "EADDRINUSE"
          ? "El puerto local 8787 está ocupado. Cierra otra instancia del adaptador de BYTE HQ y vuelve a abrir la aplicación."
          : "No se pudo iniciar la oficina. Detalle: " + error.message,
      );
      app.quit();
    }
  });
  app.on("window-all-closed", () => app.quit());
  app.on("before-quit", (event) => {
    if (adapter && !quitting) {
      event.preventDefault();
      quitting = true;
      adapter.close().finally(() => app.quit());
    }
  });
}
