import { app, BrowserWindow, Tray, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import './server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;
let tray = null;

function createWindow() {
    win = new BrowserWindow({
        show: false,
        width: 1000,
        height: 700,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    // Use local build file
    // win.loadURL('http://localhost:5173');
    // win.loadFile(path.join(__dirname, "../dist/index.html"));

    const isDev = !app.isPackaged;
    const indexPath = isDev
        ? 'http://localhost:5173'
        : path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html');

    if (isDev) {
        win.loadURL(indexPath);
    } else {
        win.loadFile(indexPath);
    }

    if (!process.argv.includes('--autostart')) {
        win.once('ready-to-show', () => {
            win.show();
        });
    }

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
        args: ['--autostart'],
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

