const { ipcRenderer } = require('electron');

const newHotkey = document.getElementById('new-hotkey');
let index = 1;

newHotkey.addEventListener('click', () => {
  index++;
  const newRow = createElementFromHTML(`
  <div class="h2s-row">
    <input id="hotkey-${index}" type="text" />
    <div class="path-row">
        <p id="path-${index}"></p>
        <button id="change-sound-location-${index}">Change</button>
    </div>
  </div>
`);
  const newSound = createElementFromHTML(`
<audio id="sound-${index}" src=""></audio>
`);
  document.getElementsByClassName('hotkeys')[0].appendChild(newRow);
  document.getElementById('sounds').appendChild(newSound);
  setListeners();
});

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild;
}

function setShownHotkey(target, shift, control, alt, key) {
  const shiftString = shift ? 'shift + ' : '';
  const controlString = control ? 'control + ' : '';
  const altString = alt ? 'alt + ' : '';
  target.value = controlString + shiftString + altString + key;
}

function hotkey(e) {
  e.preventDefault();
  if (e.code.substr(0, 3) !== 'Key' && e.code.substr(0, 5) !== 'Digit') return;
  const shift = e.getModifierState('Shift');
  const control = e.getModifierState('Control');
  const alt = e.getModifierState('Alt');
  const key = e.code.charAt(e.code.length - 1);
  const old = e.target.getAttribute('keybind');
  setShownHotkey(e.target, control, shift, alt, key);
  ipcRenderer.send('commandChange', {
    target: e.target.id,
    shift,
    control,
    alt,
    key: key,
    old,
  });
  e.target.blur();
}

ipcRenderer.on('playSound', (_, target) => {
  const soundNr = target.charAt(target.length - 1);
  console.log('sound-' + soundNr);
  const sound = document.getElementById('sound-' + soundNr);
  sound.currentTime = 0;
  sound.play();
});

ipcRenderer.on('newHotkey', (_, { target, hotkey }) => {
  document.getElementById(target).setAttribute('keybind', hotkey);
});

ipcRenderer.on('path', (_, { target, path }) => {
  const nr = target.charAt(target.length - 1);

  const sound1 = document.getElementById('sound-' + nr);
  const path1 = document.getElementById('path-' + nr);
  path1.innerText = '...' + path.substr(path.length - 20, path.length);
  sound1.setAttribute('src', path);
});

// const hotkey1 = document.getElementById('hotkey-1');
// hotkey1.onkeydown = hotkey;
// const changeSoundLocationButton = document.getElementById(
//   'change-sound-location-1'
// );

// changeSoundLocationButton.addEventListener('click', (e) => {
//   ipcRenderer.send('dialog', e.target.id);
// });

function setListeners() {
  //   const i = index;
  //   for (let i = 0; i < index; i++) {
  const hk = document.getElementById(`hotkey-${index}`);
  hk.onkeydown = hotkey;
  const changeSoundLocationButton = document.getElementById(
    `change-sound-location-${index}`
  );
  changeSoundLocationButton.addEventListener('click', (e) => {
    ipcRenderer.send('dialog', e.target.id);
  });
}

setListeners();
