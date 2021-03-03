const { Tray, Menu } = require('electron');
const path = require('path');
let menuIcon;
const buildMenuIcon = (showSettingsWindow, quit) => {
  menuIcon = new Tray(path.join(__dirname, '../icons/menuIcon.png'));
  const menu = new Menu.buildFromTemplate([
    {
      label: 'Settings',
      click: showSettingsWindow,
    },
    { type: 'separator' },
    { label: 'Quit', click: quit },
  ]);
  menuIcon.setContextMenu(menu);
};

module.exports = buildMenuIcon;
