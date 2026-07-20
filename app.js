// ---------- Utilitaires ----------
function shuffle(arr){
  const a = arr.slice();
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(pool, n){
  return shuffle(pool).slice(0, Math.min(n, pool.length));
}

const DIFFICULTY_LABELS = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' };

// ---------- Modes ----------
const MODES = {
  qcm: {
    label: 'Quiz classique',
    sub: 'QCM sur le lore',
    pool: QCM_QUESTIONS,
    icon: 'Q'
  },
  difficile: {
    label: 'Mode difficile',
    sub: 'Réponses libres · 3 erreurs maximum',
    pool: QCM_DIFFICILE_QUESTIONS,
    icon: '⚔'
  }
};

const SESSION_LENGTH = 20;

// ---------- État ----------
var state = {
  screen: 'menu',
  mode: null,

  questions: [],
  index: 0,

  answers: [],

  // uniquement utilisé en mode difficile
  errors: 0,
  maxErrors: 3
};

const root = document.getElementById('root');

// ---------- Menu ----------
function renderMenu(){
  root.innerHTML = `
    <header class="top">
      <div>
        <p class="brand-eyebrow">Encyclopédie non-officielle · Fan quiz</p>
        <h1>Runeterra <span>Lore Quiz</span></h1>
      </div>
    </header>

    <p class="menu-intro">Choisis ton mode de jeu.</p>

    <div class="mode-grid" id="modeGrid"></div>

    <footer>Quiz de trivia créé pour les fans — League of Legends et son univers appartiennent à Riot Games.</footer>
  `;

  const grid = document.getElementById('modeGrid');

  Object.entries(MODES).forEach(([key, m]) => {
    const card = document.createElement('button');
    card.className = 'mode-card';
    card.innerHTML = `
      <span class="mode-icon">${m.icon}</span>
      <span class="mode-label">${m.label}</span>
      <span class="mode-sub">${m.sub}</span>
      <span class="mode-count">${m.pool.length} questions en banque</span>
    `;
    card.addEventListener('click', () => startGame(key));
    grid.appendChild(card);
  });
}

// ---------- Démarrage partie ----------
function startGame(modeKey){
  const mode = MODES[modeKey];

  state.screen = 'playing';
  state.mode = modeKey;

  state.questions = pickRandom(
    mode.pool,
    modeKey === 'qcm' ? SESSION_LENGTH : mode.pool.length
  ).map(q => {
    const copy = { ...q };
    if(modeKey === 'qcm'){
      copy.shuffledOptions = null;
      copy.correctShuffled = null;
      copy._lastPick = null;
    }
    return copy;
  });

  state.index = 0;
  state.answers = new Array(state.questions.length).fill(null);
  state.errors = 0;

  render();
}

// ---------- Rendu : Jeu ----------
function renderGame(){
  const isDifficile = state.mode === 'difficile';

  root.innerHTML = `
    <header class="top compact">
      <div>
        <p class="brand-eyebrow">${MODES[state.mode].label}</p>
        <h1 class="game-title">Runeterra <span>Lore Quiz</span></h1>
      </div>

      <div class="header-actions">
        <button class="btn danger" id="backToMenuBtn">Quitter la partie</button>
        <div class="score-box">
          Score
          <b id="scoreDisplay">${scoreDisplayText()}</b>
        </div>
      </div>
    </header>

    <div class="layout ${isDifficile ? 'single' : ''}">
      <nav class="dots" id="dotsNav"></nav>
      <main class="card" id="card"></main>
    </div>

    <footer>Quiz de trivia créé pour les fans — League of Legends et son univers appartiennent à Riot Games.</footer>
  `;

  if(isDifficile){
    const nav = document.getElementById('dotsNav');
    if(nav) nav.style.display = 'none';
  } else {
    buildDots();
  }

  renderQuestion();

  document.getElementById('backToMenuBtn').addEventListener('click', () => {
    if(confirm("Quitter la partie en cours ? Ta progression sera perdue.")){
      state.screen = 'menu';
      state.mode = null;
      state.questions = [];
      state.index = 0;
      state.answers = [];
      state.errors = 0;
      render();
    }
  });
}

// ---------- Navigation questions (mode QCM uniquement) ----------
function buildDots(){
  const nav = document.getElementById('dotsNav');
  nav.innerHTML = '';

  state.questions.forEach((q, i) => {
    const b = document.createElement('button');
    b.className = 'dot-btn';
    b.textContent = i + 1;
    b.addEventListener('click', () => {
      state.index = i;
      renderQuestion();
      updateDots();
    });
    nav.appendChild(b);
  });

  updateDots();
}

function updateDots(){
  const btns = document.querySelectorAll('.dot-btn');
  btns.forEach((b, i) => {
    b.classList.remove('current', 'correct', 'wrong');
    if(state.answers[i] === true) b.classList.add('correct');
    if(state.answers[i] === false) b.classList.add('wrong');
    if(i === state.index) b.classList.add('current');
  });
}

// ---------- Score ----------
function countCorrect(){
  return state.answers.filter(a => a === true).length;
}

function scoreDisplayText(){
  return state.mode === 'difficile'
    ? `${countCorrect()} réussies · ${state.errors}/${state.maxErrors} erreurs`
    : `${countCorrect()} / ${state.questions.length}`;
}

function updateScore(){
  const el = document.getElementById('scoreDisplay');
  if(el) el.textContent = scoreDisplayText();
}

// ---------- Question actuelle ----------
function renderQuestion(){
  const card = document.getElementById('card');
  const item = state.questions[state.index];

  if(state.mode === 'qcm') renderQCM(card, item);
  else if(state.mode === 'difficile') renderDifficile(card, item);
}

// ---------- Boutons navigation QCM ----------
function navButtonsHTML(){
  const isLast = state.index === state.questions.length - 1;
  const answered = state.answers[state.index] !== null;
  return `
    <div class="nav-buttons">
      <button class="btn" id="prevBtn" ${state.index === 0 ? 'disabled' : ''}>← Précédent</button>
      <button class="btn primary" id="nextBtn" ${answered ? '' : 'disabled'}>${isLast ? 'Voir le résultat' : 'Suivant →'}</button>
    </div>
  `;
}

function bindNavButtons(){
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');

  if(prev){
    prev.addEventListener('click', () => {
      state.index--;
      renderQuestion();
      updateDots();
    });
  }

  if(next){
    next.addEventListener('click', () => {
      if(state.index === state.questions.length - 1){
        renderFinal();
      } else {
        state.index++;
        renderQuestion();
        updateDots();
      }
    });
  }
}

// ---------- MODE QCM ----------
function renderQCM(card, item){
  const answered = state.answers[state.index] !== null;

  card.innerHTML = `
    <div class="question-meta">
      <span class="difficulty ${item.difficulty}">${DIFFICULTY_LABELS[item.difficulty] || ''}</span>
    </div>

    <p class="question">${item.question}</p>

    <div class="options" id="optionsWrap"></div>
    <div class="feedback" id="feedback"></div>

    ${navButtonsHTML()}
  `;

  // Mélange les options une seule fois par question
  if(!item.shuffledOptions){
    item.shuffledOptions = shuffle(
      item.options.map((text, index) => ({
        text: text,
        correct: index === item.correct
      }))
    );
    item.correctShuffled = item.shuffledOptions.findIndex(x => x.correct);
  }

  const wrap = document.getElementById('optionsWrap');
  const letters = ['A', 'B', 'C', 'D'];

  item.shuffledOptions.forEach((option, idx) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.innerHTML = `<span class="letter">${letters[idx]}</span><span>${option.text}</span>`;

    if(answered){
      b.disabled = true;
      if(idx === item.correctShuffled) b.classList.add('is-correct');
      if(item._lastPick === idx && idx !== item.correctShuffled) b.classList.add('is-wrong');
    }

    b.addEventListener('click', () => {
      if(answered) return;
      item._lastPick = idx;
      state.answers[state.index] = idx === item.correctShuffled;
      updateScore();
      updateDots();
      renderQuestion();
    });

    wrap.appendChild(b);
  });

  showFeedback(answered, state.answers[state.index], item.explanation);
  bindNavButtons();
}

// ---------- MODE DIFFICILE ----------
function renderDifficile(card, item){
  const answered = state.answers[state.index] !== null;

  card.innerHTML = `
    <div class="question-meta">
      <span class="difficulty hard">${DIFFICULTY_LABELS.hard}</span>
      <div class="life-counter">
        Erreurs
        ${renderLives()}
      </div>
    </div>

    <p class="question">${item.question}</p>

    <input
      id="answerInput"
      class="opt"
      placeholder="Ta réponse..."
      autocomplete="off"
      ${answered ? 'disabled' : ''}
    />

    <button class="btn primary" id="validateAnswer" ${answered ? 'disabled' : ''}>Valider</button>

    <div class="feedback" id="feedback"></div>

    <div class="nav-buttons" id="difficileNav"></div>
  `;

  const input = document.getElementById('answerInput');

  if(!answered){
    input.focus();

    const submit = () => {
      const value = input.value.trim();
      if(!value) return;
      submitDifficileAnswer(value, item);
    };

    document.getElementById('validateAnswer').addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
      if(e.key === 'Enter'){
        e.preventDefault();
        submit();
      }
    });
  } else {
    showFeedback(true, state.answers[state.index], buildDifficileFeedback(item));
    renderDifficileNav();
  }
}

function submitDifficileAnswer(value, item){
  const correct = isAnswerCorrect(value, item);
  state.answers[state.index] = correct;
  if(!correct) state.errors++;
  updateScore();
  renderQuestion();
}

function buildDifficileFeedback(item){
  const correct = state.answers[state.index];
  let txt = '';
  if(!correct){
    txt += `Réponse attendue : <b>${item.answer}</b><br>`;
  }
  txt += item.explanation || '';
  return txt;
}

function renderLives(){
  let html = '';
  for(let i = 0; i < state.maxErrors; i++){
    html += `<span class="life ${i < state.errors ? 'lost' : 'active'}">♥</span>`;
  }
  return html;
}

function renderDifficileNav(){
  const wrap = document.getElementById('difficileNav');
  const gameOver = state.errors >= state.maxErrors;
  const isLast = state.index === state.questions.length - 1;

  if(gameOver || isLast){
    wrap.innerHTML = `<button class="btn primary" id="seeResultBtn" style="margin-left:auto;">Voir le résultat</button>`;
    document.getElementById('seeResultBtn').addEventListener('click', renderFinal);
  } else {
    wrap.innerHTML = `<button class="btn primary" id="nextDifficileBtn" style="margin-left:auto;">Question suivante →</button>`;
    document.getElementById('nextDifficileBtn').addEventListener('click', () => {
      state.index++;
      renderQuestion();
    });
  }
}

// ---------- Validation réponse difficile (tolérance aux fautes) ----------
function normalizeText(text){
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

function levenshtein(a, b){
  const matrix = [];

  for(let i = 0; i <= b.length; i++){ matrix[i] = [i]; }
  for(let j = 0; j <= a.length; j++){ matrix[0][j] = j; }

  for(let i = 1; i <= b.length; i++){
    for(let j = 1; j <= a.length; j++){
      if(b[i - 1] === a[j - 1]){
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function isAnswerCorrect(userAnswer, item){
  const user = normalizeText(userAnswer);
  const possibleAnswers = [item.answer, ...(item.acceptedAnswers || [])];

  return possibleAnswers.some(answer => {
    const expected = normalizeText(answer);
    if(user === expected) return true;

    const distance = levenshtein(user, expected);
    const maxDistance =
      expected.length <= 5 ? 1 :
      expected.length <= 10 ? 2 :
      3;

    return distance <= maxDistance;
  });
}

// ---------- Feedback ----------
function showFeedback(answered, isCorrect, explanation){
  const fb = document.getElementById('feedback');
  if(!fb || !answered) return;

  fb.classList.add('show');
  fb.innerHTML = isCorrect
    ? `<b>Correct.</b> ${explanation || ''}`
    : `<b>Pas tout à fait.</b> ${explanation || ''}`;
}

// ---------- Écran final ----------
function renderFinal(){
  state.screen = 'final';

  const correctCount = countCorrect();
  const total = state.questions.length;

  let title, msg;

  if(state.mode === 'difficile'){
    if(state.errors >= state.maxErrors){
      title = 'Défaite';
      msg = `Tu as atteint les ${state.maxErrors} erreurs autorisées, avec ${correctCount} bonne(s) réponse(s) à ton actif.`;
    } else {
      title = 'Expert du Lore';
      msg = `Tu as répondu à l'intégralité des ${total} questions du mode difficile sans épuiser tes ${state.maxErrors} vies, avec ${correctCount} bonnes réponses.`;
    }
  } else {
    if(correctCount === total){
      title = 'Maître du Lore';
      msg = "Runeterra n'a plus aucun secret pour toi.";
    } else if(correctCount >= total * 0.75){
      title = 'Érudit de Runeterra';
      msg = "Un score solide — tu connais l'univers sur le bout des doigts.";
    } else if(correctCount >= total * 0.5){
      title = 'Voyageur curieux';
      msg = "Une bonne base, mais quelques régions te réservent encore des surprises.";
    } else {
      title = 'Apprenti explorateur';
      msg = "L'aventure ne fait que commencer — Runeterra est vaste.";
    }
  }

  const tallyHTML = state.mode === 'difficile'
    ? `${correctCount}<span> bonnes réponses</span>`
    : `${correctCount}<span>/${total}</span>`;

  root.innerHTML = `
    <header class="top compact">
      <div>
        <p class="brand-eyebrow">${MODES[state.mode].label}</p>
        <h1 class="game-title">Runeterra <span>Lore Quiz</span></h1>
      </div>
    </header>

    <main class="card">
      <div class="final">
        <p class="theme-tag" style="text-align:center;">Résultat final</p>
        <div class="tally">${tallyHTML}</div>
        <h2>${title}</h2>
        <p>${msg}</p>
        <div class="final-buttons">
          <button class="btn primary" id="replayBtn">Rejouer</button>
          <button class="btn" id="menuBtn">Menu</button>
        </div>
      </div>
    </main>

    <footer>Quiz de trivia créé pour les fans — League of Legends et son univers appartiennent à Riot Games.</footer>
  `;

  document.getElementById('replayBtn').addEventListener('click', () => startGame(state.mode));
  document.getElementById('menuBtn').addEventListener('click', () => {
    state.screen = 'menu';
    state.mode = null;
    render();
  });
}

// ---------- Routeur ----------
function render(){
  if(state.screen === 'menu') renderMenu();
  else if(state.screen === 'playing') renderGame();
  else if(state.screen === 'final') renderFinal();
}

render();
