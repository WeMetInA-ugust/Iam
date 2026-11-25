const verses = [
  ["The wheels on the bus go round and round", "Round and round", "Round and round"],
  ["The wheels on the bus go round and round", "All through the town"],
  ["The wipers on the bus go swish swish swish", "Swish swish swish", "Swish swish swish"],
  ["The wipers on the bus go swish swish swish", "All through the town"],
  ["The horn on the bus goes beep beep beep", "Beep beep beep", "Beep beep beep"],
  ["The horn on the bus goes beep beep beep", "All through the town"],
  ["The doors on the bus go open and shut", "Open and shut", "Open and shut"],
  ["The doors on the bus go open and shut", "All through the town"],
  ["The babies on the bus go wawa wawa", "Wa wa wa", "Wa wa wa"],
  ["The babies on the bus go wawa wawa", "All through the town"],
  ["The people on the bus go bounce bounce bounce", "Bounce bounce bounce", "Bounce bounce bounce"],
  ["The people on the bus go bounce bounce bounce", "All through the town"],
  ["The driver on the bus says move on back", "Move on back", "Move on back"],
  ["The driver on the bus says move on back", "All through the town"],
  ["The moms and dads on the bus say shh shh shh", "Shh shh shh", "Shh shh shh"],
  ["The moms and dads on the bus say shh shh shh", "All through the town"]
];

const stage = document.getElementById('stage');
const lyricsEl = document.getElementById('lyrics');
const verseLabel = document.getElementById('verseLabel');
const soundButton = document.getElementById('soundButton');

let audioContext;
let timer = null;
let active = false;

function renderLines(lines) {
  lyricsEl.innerHTML = '';
  lines.forEach((line, lineIndex) => {
    const lineEl = document.createElement('div');
    lineEl.style.flexBasis = '100%';
    lineEl.style.whiteSpace = 'nowrap';
    line.split(/\s+/).forEach(word => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      lineEl.appendChild(span);
    });
    lyricsEl.appendChild(lineEl);
  });
}

function getAudioContext() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function chirp(kind, index) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain).connect(ctx.destination);
  osc.type = kind === 'beep' ? 'square' : 'triangle';
  const base = kind === 'beep' ? 330 : 196 + (index % 6) * 18;
  osc.frequency.setValueAtTime(base, now);
  if (kind !== 'beep') osc.frequency.exponentialRampToValueAtTime(base * 1.12, now + .12);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(.055, now + .015);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .18);
  osc.start(now); osc.stop(now + .19);
}

async function play() {
  if (active) return;
  active = true;
  soundButton.classList.add('hidden');
  stage.classList.add('animate');
  const ctx = getAudioContext();

  const verseSeconds = 180 / verses.length;
  let globalIndex = 0;

  for (let v = 0; v < verses.length && active; v++) {
    verseLabel.textContent = `Verse ${v + 1}`;
    renderLines(verses[v]);
    const words = [...lyricsEl.querySelectorAll('.word')];

    const wordMs = Math.max(260, verseSeconds * 1000 / words.length);
    for (let i = 0; i < words.length && active; i++) {
      words.forEach((w, j) => w.classList.toggle('active', j === i));
      words.forEach((w, j) => w.classList.toggle('done', j < i));
      if (i % 4 === 0) chirp(v === 4 ? 'beep' : 'beat', globalIndex++);
      await new Promise(resolve => { timer = setTimeout(resolve, wordMs); });
    }
  }

  stage.classList.remove('animate');
  verseLabel.textContent = 'Thank you for singing!';
  lyricsEl.innerHTML = '<div class="word active" style="flex-basis:100%">The end — great singing!</div>';
  soundButton.querySelector('.button-label').textContent = 'Play again';
  soundButton.classList.remove('hidden');
  active = false;
}

soundButton.addEventListener('click', play);
renderLines(["The wheels on the bus", "go round and round"]);
