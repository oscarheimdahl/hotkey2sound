const { app, BrowserWindow, globalShortcut, dialog } = require('electron');
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

const playSound = (target) => {
  settingsWindow.webContents.send('playSound', target);
};

ipcMain.on('commandChange', (_, { target, shift, control, alt, key, old }) => {
  const hotkeyString = renderHotkeyToGlobal(shift, control, alt, key);
  if (old && globalShortcut.isRegistered(old)) globalShortcut.unregister(old);
  const ret = globalShortcut.register(hotkeyString, () => {
    console.log(hotkeyString + ' is pressed');
    playSound(target);
  });
  notifyNewHotkey(target, hotkeyString);
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

ipcMain.on('dialog', async (_, target) => {
  console.log('dialog');
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
  });
  settingsWindow.webContents.send('path', { target, path: filePaths[0] });
});

app.on('ready', init);
