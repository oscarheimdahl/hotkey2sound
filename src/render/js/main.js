const { ipcRenderer } = require('electron');
const { ipcMain } = require('electron/main');
let hotkeysData = JSON.parse(store.get('hotkeys'));
buildRowsFromStore();

const newHotkey = document.getElementById('new-hotkey');

newHotkey.addEventListener('click', () => {
  const keys = Object.keys(hotkeysData);
  let lastKey = keys[keys.length - 1];
  if (lastKey) lastKey++;
  else lastKey = 0;
  hotkeysData[lastKey] = {
    hotkey: '',
    sound: '',
  };
  buildRowsFromStore();
});

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

ipcRenderer.on('playSound', (_, target) => {
  const soundNr = target.charAt(target.length - 1);
  const sound = document.getElementById('sound-' + soundNr);
  sound.currentTime = 0;
  sound.play().catch((err) => showCantPlaySound(target));
});

function showCantPlaySound(target) {
  const nr = target.charAt(target.length - 1);
  document.getElementById(`change-path-${nr}`).className = 'change-path-error';
  setTimeout(
    () => (document.getElementById(`change-path-${nr}`).className = ''),
    500
  );
}

function buildRowsFromStore() {
  document.getElementsByClassName('hotkeys')[0].innerHTML = '';
  document.getElementById('sounds').innerHTML = '';
  ipcRenderer.send('clearAllHotkeys');
  Object.keys(hotkeysData).forEach((hotkeyIndex) => {
    const hotkey = hotkeysData[hotkeyIndex].hotkey;
    const sound = hotkeysData[hotkeyIndex].sound;
    const newRow = buildNewRow(hotkeyIndex, hotkey, sound);
    const newSound = createElementFromHTML(
      `<audio id="sound-${hotkeyIndex}" src="${sound}"></audio>`
    );
    document.getElementsByClassName('hotkeys')[0].appendChild(newRow);
    document.getElementById('sounds').appendChild(newSound);
    setListeners(hotkeyIndex);
    ipcRenderer.send('hotkeyChange', {
      target: `hotkey-${hotkeyIndex}`,
      shift: hotkey.includes('shift'),
      control: hotkey.includes('control'),
      alt: hotkey.includes('alt'),
      key: hotkey.charAt(hotkey.length - 1),
    });
    hotkeyIndex++;
  });
  store.set('hotkeys', JSON.stringify(hotkeysData));
}

function buildNewRow(hotkeyIndex, hotkey, sound) {
  return createElementFromHTML(`
  <div class="h2s-row">
  <div class="input-row">
    <input placeholder="Click to set..." ${
      hotkey ? 'disabled' : ''
    } value="${hotkey}"
    id="hotkey-${hotkeyIndex}" type="text" />
    <img
      class="clear-button"
      style="display: ${hotkey ? 'inline-block' : 'none'}"
      id="clear-hotkey-${hotkeyIndex}"
      src="./assets/images/close.png"
    />
  </div>
  <div class="path-row">
    <p path="${sound}" id="path-${hotkeyIndex}">${cleanPath(sound)}</p>
    <button
      style="display: ${sound ? 'none' : 'block'}"
      id="change-path-${hotkeyIndex}"
    >
      Change
    </button>
    <img
      class="clear-button"
      style="display: ${sound ? 'inline-block' : 'none'}"
      id="clear-path-${hotkeyIndex}"
      src="./assets/images/close.png"
    />
  </div>
  <div class="delete-row-button">
    <img
      class="delete-row"
      id="delete-row-${hotkeyIndex}"
      src="./assets/images/close.png"
    />
  </div>
</div>`);
}

function cleanPath(path) {
  return path.substr(path.lastIndexOf('\\') + 1, path.length);
}

function setListeners(index) {
  document.getElementById(`hotkey-${index}`).onkeydown = hotkey;
  document
    .getElementById(`change-path-${index}`)
    .addEventListener('click', (e) => updatePath(getIDIndex(e.target.id)));
  document
    .getElementById(`clear-hotkey-${index}`)
    .addEventListener('click', (e) => clearHotkey(getIDIndex(e.target.id)));
  document
    .getElementById(`clear-path-${index}`)
    .addEventListener('click', (e) => clearPath(getIDIndex(e.target.id)));
  document
    .getElementById(`delete-row-${index}`)
    .addEventListener('click', (e) => deleteRow(getIDIndex(e.target.id)));
}

function getIDIndex(id) {
  words = id.split('-');
  return words[words.length - 1];
}

function deleteRow(index) {
  delete hotkeysData[index];
  buildRowsFromStore();
}

function updatePath(index) {
  ipcRenderer.send('dialog', index);
}

ipcRenderer.on('path', (_, { index, path }) => {
  hotkeysData[index].sound = path;
  buildRowsFromStore();
});

function clearPath(index) {
  hotkeysData[index].sound = '';
  buildRowsFromStore();
}

function hotkey(e) {
  e.preventDefault();
  if (e.target.value) return;
  if (e.code.substr(0, 3) !== 'Key' && e.code.substr(0, 5) !== 'Digit') return;
  const shift = e.getModifierState('Shift');
  const control = e.getModifierState('Control');
  const alt = e.getModifierState('Alt');
  if (!shift && !control && !alt) return;
  const key = e.code.charAt(e.code.length - 1);
  const nr = e.target.id.charAt(e.target.id.length - 1);
  hotkeysData[nr].hotkey = formatShownHotkey(shift, control, alt, key);
  buildRowsFromStore();
}

function formatShownHotkey(shift, control, alt, key) {
  const shiftString = shift ? 'shift + ' : '';
  const controlString = control ? 'control + ' : '';
  const altString = alt ? 'alt + ' : '';
  return controlString + shiftString + altString + key;
}

ipcRenderer.on('newHotkey', (_, { target, hotkey }) => {
  document.getElementById(target).setAttribute('hotkey', hotkey);
});

function clearHotkey(index) {
  hotkeysData[index].hotkey = '';
  buildRowsFromStore();
}
