import { app, BrowserWindow, Tray, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import '../server/server.js';

// Rebuild __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;
let tray = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Use local build file
    // win.loadURL('http://localhost:5173');
  win.loadFile(path.join(__dirname, "../dist/index.html"));
  win.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      win.hide();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  tray = new Tray(path.join(__dirname, 'icon.png')); // Make sure icon.png exists
  const trayMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => win.show() },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);
  tray.setToolTip('Yankit');
  tray.setContextMenu(trayMenu);

  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else win.show();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Intentionally empty to allow background tray
  }
});

