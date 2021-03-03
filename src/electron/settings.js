const { BrowserWindow } = require('electron');
const path = require('path');
let window;
const buildSettingsWindow = () => {
  window = new BrowserWindow({
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  window.loadFile(path.join(__dirname, '../render/index.html'));

  window.once('ready-to-show', () => {
    window.show();
  });

  window.on('close', function (event) {
    event.preventDefault();
    window.hide();
  });
  return window;
};

module.exports = buildSettingsWindow;
