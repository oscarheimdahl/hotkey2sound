const { app, BrowserWindow, globalShortcut, dialog } = require('electron');
const Store = require('electron-store');
Store.initRenderer();
const { ipcMain } = require('electron/main');
const buildMenuIcon = require('./menuIcon.js');
const buildSettingsWindow = require('./settings.js');
require('electron-reload')(__dirname + '/../render/');

if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

let settingsWindow;

const init = () => {
  buildMenuIcon(showSettingsWindow, app.quit);
  settingsWindow = buildSettingsWindow();
};

const showSettingsWindow = () => {
  if (!settingsWindow) return;
  settingsWindow.show();
};

ipcMain.on('hotkeyChange', (_, { target, shift, control, alt, key, old }) => {
  const hotkeyString = renderHotkeyToGlobal(shift, control, alt, key);
  if (!hotkeyString) return;
  const ret = globalShortcut.register(hotkeyString, () => {
    settingsWindow.webContents.send('playSound', target);
  });
  notifyNewHotkey(target, hotkeyString);
});

ipcMain.on('clearAllHotkeys', () => {
  globalShortcut.unregisterAll();
});

ipcMain.on('clearHotkey', (_, hotkey) => {
  if (hotkey && globalShortcut.isRegistered(hotkey))
    globalShortcut.unregister(hotkey);
});

const notifyNewHotkey = (target, hotkey) => {
  settingsWindow.webContents.send('newHotkey', { target, hotkey });
};

const renderHotkeyToGlobal = (shift, control, alt, key) => {
  const shiftString = shift ? 'Shift+' : '';
  const controlString = control ? 'CommandOrControl+' : '';
  const altString = alt ? 'Alt+' : '';
  return shiftString + controlString + altString + key;
};

ipcMain.on('dialog', async (_, index) => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
  });
  if (!filePaths || !filePaths[0]) return;
  settingsWindow.webContents.send('path', { index, path: filePaths[0] });
});

app.on('ready', init);
