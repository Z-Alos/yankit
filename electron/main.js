import { app, BrowserWindow, Tray, Menu } from 'electron';
import path from 'path';
import '../server/server.js';

let win;
let tray = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadURL('http://localhost:5173');

  win.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      win.hide();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  tray = new Tray(path.join(__dirname, 'icon.png')); // Add your icon here
  const trayMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => win.show() },
    { label: 'Quit', click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip('My Electron App');
  tray.setContextMenu(trayMenu);

  // Start at login, hidden
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else win.show();
  });
});

app.on('window-all-closed', () => {
  // Keep background running on all OS except macOS
  if (process.platform !== 'darwin') {
    // Do nothing to keep app running
  }
});

