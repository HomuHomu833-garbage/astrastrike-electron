const { app, BrowserWindow, shell, Menu } = require('electron');
const { join } = require('path');
const os = require('os');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const gotTheLock = app.requestSingleInstanceLock();

const isWindows = os.platform() === 'win32';

const GAME_URL = 'https://astrastrike.fun';

let mainWindow = null;
let popupWindow = null;

const focusMainWindow = () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'Astra Strike',
    fullscreen: true,
    show: false,
    backgroundColor: '#0c1118',
    icon: join(__dirname, 'src', 'icons', isWindows ? 'icon.ico' : 'icon.icns'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: false,
      backgroundThrottling: true,
    },
  });

  win.loadURL(GAME_URL);

  win.once('ready-to-show', () => win.show());

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      win.webContents.toggleDevTools();
      event.preventDefault();
    } else if (input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    } else if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
      const force = input.shift || (input.key === 'F5' && input.control);
      if (force) win.webContents.reloadIgnoringCache();
      else win.webContents.reload();
      event.preventDefault();
    }
  });

  // added by Homura Akemi (HomuHomu833)
  win.webContents.setWindowOpenHandler(({ url, disposition }) => {
    let host = '';
    try {
      host = new URL(url).hostname;
    } catch {
      return { action: 'deny' };
    }

    const isAstraStrike = host === 'astrastrike.fun' || host.endsWith('.astrastrike.fun');
    // Sign-in providers must open in-app so their popup can talk back to the
    // opener (window.opener / postMessage) and complete the flow.
    const isAuth = /(?:^|\.)(?:google|gstatic|googleapis|apple|appleid|discord|discordapp)\.com$/.test(host);
    const isLinkClick = disposition === 'foreground-tab' || disposition === 'background-tab';

    // Plain external link clicks open in the system browser; popups (sign-in)
    // and astrastrike.fun windows stay in-app.
    if (!isAstraStrike && !isAuth && isLinkClick) {
      shell.openExternal(url);
      return { action: 'deny' };
    }

    // Reuse one window only for astrastrike.fun popups (Alt+Tab clone fix).
    // Auth popups get a fresh window so window.opener stays intact.
    if (isAstraStrike && popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.loadURL(url);
      popupWindow.focus();
      return { action: 'deny' };
    }

    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        width: 800,
        height: 600,
        parent: win,
        skipTaskbar: true,
        autoHideMenuBar: true,
        backgroundColor: '#0c1118',
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
          spellcheck: false,
        },
      },
    };
  });

  win.webContents.on('did-create-window', (child) => {
    popupWindow = child;
    child.on('closed', () => {
      if (popupWindow === child) popupWindow = null;
    });
  });

  win.on('closed', () => {
    if (mainWindow === win) mainWindow = null;
  });
  mainWindow = win;
  return win;
};

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', focusMainWindow);

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
