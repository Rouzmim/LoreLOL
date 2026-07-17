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

const MODES = {
  qcm: { label: 'Quiz classique', sub: 'QCM sur le lore', pool: QCM_QUESTIONS, icon: 'Q' },
  vf:  { label: 'Vrai ou Faux',   sub: 'Affirmations à trancher', pool: VF_QUESTIONS, icon: 'V' },
  qsq: { label: 'Qui suis-je ?',  sub: 'Indices progressifs', pool: QSQ_QUESTIONS, icon: '?' }
};
const SESSION_LENGTH = 20;

// ---------- État ----------
let state = {
  screen: 'menu',   // 'menu' | 'playing' | 'final'
  mode: null,
  questions: [],
  index: 0,
  answers: [],       // true/false/null par question
  cluesRevealed: []  // pour le mode qui-suis-je : nombre d'indices affichés par question
};

const root = document.getElementById('root');

// ---------- Rendu : Menu ----------
function renderMenu(){
  root.innerHTML = `
    <header class="top">
      <div>
        <p class="brand-eyebrow">Encyclopédie non-officielle · Fan quiz</p>
        <h1>Runeterra <span>Lore Quiz</span></h1>
      </div>
    </header>
    <p class="menu-intro">Choisis un mode de jeu. Chaque partie tire ${SESSION_LENGTH} questions au hasard dans la banque.</p>
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

// ---------- Démarrage d'une partie ----------
// ---------- Démarrage d'une partie ----------
function startGame(modeKey){
  const mode = MODES[modeKey];

  state.screen = 'playing';
  state.mode = modeKey;

  state.questions = pickRandom(mode.pool, SESSION_LENGTH).map(q => {
    const copy = {...q};

    // Réinitialisation uniquement pour le mode QCM
    if(modeKey === 'qcm'){
      copy.shuffledOptions = null;
      copy.correctShuffled = null;
      copy._lastPick = null;
    }

    return copy;
  });

  state.index = 0;
  state.answers = new Array(state.questions.length).fill(null);
  state.cluesRevealed = new Array(state.questions.length).fill(1);

  render();
}

// ---------- Rendu : Jeu ----------
function renderGame(){
  root.innerHTML = `
    <header class="top compact">
      <div>
        <p class="brand-eyebrow">${MODES[state.mode].label}</p>
        <h1 class="game-title">Runeterra <span>Lore Quiz</span></h1>
      </div>
      <div class="score-box">
        Score
        <b id="scoreDisplay">${countCorrect()} / ${state.questions.length}</b>
      </div>
    </header>
    <div class="layout">
      <nav class="dots" id="dotsNav" aria-label="Progression"></nav>
      <main class="card" id="card"></main>
    </div>
    <footer>Quiz de trivia créé pour les fans — League of Legends et son univers appartiennent à Riot Games.</footer>
  `;
  buildDots();
  renderQuestion();
}

function buildDots(){
  const nav = document.getElementById('dotsNav');
  nav.innerHTML = '';
  state.questions.forEach((q, i) => {
    const b = document.createElement('button');
    b.className = 'dot-btn';
    b.textContent = i + 1;
    b.addEventListener('click', () => { state.index = i; renderQuestion(); updateDots(); });
    nav.appendChild(b);
  });
  updateDots();
}

function updateDots(){
  const btns = document.querySelectorAll('.dot-btn');
  btns.forEach((b, i) => {
    b.classList.remove('current', 'correct', 'wrong');
    if(state.answers[i] === true) b.classList.add('correct');
    else if(state.answers[i] === false) b.classList.add('wrong');
    if(i === state.index) b.classList.add('current');
  });
}

function countCorrect(){
  return state.answers.filter(a => a === true).length;
}

function updateScore(){
  const el = document.getElementById('scoreDisplay');
  if(el) el.textContent = countCorrect() + ' / ' + state.questions.length;
}

function renderQuestion(){
  const card = document.getElementById('card');
  const item = state.questions[state.index];
  const answered = state.answers[state.index] !== null;

  if(state.mode === 'qcm') renderQCM(card, item, answered);
  else if(state.mode === 'vf') renderVF(card, item, answered);
  else if(state.mode === 'qsq') renderQSQ(card, item, answered);
}

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
  document.getElementById('prevBtn').addEventListener('click', () => {
    state.index--; renderQuestion(); updateDots();
  });
  document.getElementById('nextBtn').addEventListener('click', () => {
    if(state.index === state.questions.length - 1) renderFinal();
    else { state.index++; renderQuestion(); updateDots(); }
  });
}

// ---------- Mode QCM ----------
function renderQCM(card, item, answered){

  const difficultyLabel = {
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile"
  };

  card.innerHTML = `
    <div class="question-meta">
  <span class="difficulty ${item.difficulty}">
    ${difficultyLabel[item.difficulty] || ""}
  </span>
</div>

<p class="question">${item.question}</p>

    <div class="options" id="optionsWrap"></div>
    <div class="feedback" id="feedback"></div>
    ${navButtonsHTML()}
  `;
const shuffledOptions = shuffle(
  item.options.map((text, index) => ({
    text: text,
    correct: index === item.correct
  }))
);

const correctShuffled = shuffledOptions.findIndex(o => o.correct);
  const wrap = document.getElementById('optionsWrap');
  const letters = ['A','B','C','D'];
item.shuffledOptions.forEach((option, idx) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.innerHTML = `<span class="letter">${letters[idx]}</span><span>${option.text}</span>`;

    if(answered){
      b.disabled = true;

      if(idx === item.correctShuffled) {
        b.classList.add('is-correct');
      }
      else if(item._lastPick === idx) {
        b.classList.add('is-wrong');
      }
    }

    b.addEventListener('click', () => {
      if(state.answers[state.index] !== null) return;

      item._lastPick = idx;

      const isCorrect = idx === item.correctShuffled;

      state.answers[state.index] = isCorrect;

      updateScore();
      updateDots();
      renderQuestion();
    });

    wrap.appendChild(b);
});
  showFeedback(answered, state.answers[state.index], item.explanation);
  bindNavButtons();
}

// ---------- Mode Vrai / Faux ----------
function renderVF(card, item, answered){
  card.innerHTML = `
    <p class="theme-tag">${item.region}</p>
    <p class="question">${item.statement}</p>
    <div class="options vf-options" id="optionsWrap"></div>
    <div class="feedback" id="feedback"></div>
    ${navButtonsHTML()}
  `;
  const wrap = document.getElementById('optionsWrap');
  [{label:'Vrai', val:true},{label:'Faux', val:false}].forEach(choice => {
    const b = document.createElement('button');
    b.className = 'opt vf-opt';
    b.textContent = choice.label;
    if(answered){
      b.disabled = true;
      if(choice.val === item.correct) b.classList.add('is-correct');
      else if(item._lastPick === choice.val) b.classList.add('is-wrong');
    }
    b.addEventListener('click', () => {
      if(state.answers[state.index] !== null) return;
      item._lastPick = choice.val;
      const isCorrect = choice.val === item.correct;
      state.answers[state.index] = isCorrect;
      updateScore(); updateDots(); renderQuestion();
    });
    wrap.appendChild(b);
  });
  showFeedback(answered, state.answers[state.index], item.explanation);
  bindNavButtons();
}

// ---------- Mode Qui-suis-je ----------
function renderQSQ(card, item, answered){
  const revealed = state.cluesRevealed[state.index];
  card.innerHTML = `
    <p class="theme-tag">Qui suis-je ?</p>
    <div class="clues" id="cluesWrap"></div>
    <div class="options" id="optionsWrap"></div>
    <div class="feedback" id="feedback"></div>
    ${navButtonsHTML()}
  `;
  const cluesWrap = document.getElementById('cluesWrap');
  item.clues.slice(0, revealed).forEach((c, i) => {
    const p = document.createElement('p');
    p.className = 'clue';
    p.innerHTML = `<span class="clue-index">Indice ${i + 1}</span>${c}`;
    cluesWrap.appendChild(p);
  });
  if(!answered && revealed < item.clues.length){
    const moreBtn = document.createElement('button');
    moreBtn.className = 'btn reveal-btn';
    moreBtn.textContent = 'Révéler l\'indice suivant';
    moreBtn.addEventListener('click', () => {
      state.cluesRevealed[state.index]++;
      renderQuestion();
    });
    cluesWrap.appendChild(moreBtn);
  }

  const wrap = document.getElementById('optionsWrap');
  const letters = ['A','B','C','D'];
 item.options.forEach((optText, idx) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.innerHTML = `<span class="letter">${letters[idx]}</span><span>${optText}</span>`;
    if(answered){
      b.disabled = true;
      if(idx === item.correct) b.classList.add('is-correct');
      else if(item._lastPick === idx) b.classList.add('is-wrong');
    }
    b.addEventListener('click', () => {
      if(state.answers[state.index] !== null) return;
      item._lastPick = idx;
      const isCorrect = idx === item.correctShuffled;
      state.answers[state.index] = isCorrect;
      state.cluesRevealed[state.index] = item.clues.length;
      updateScore(); updateDots(); renderQuestion();
    });
    wrap.appendChild(b);
  });
  showFeedback(answered, state.answers[state.index], item.explanation);
  bindNavButtons();
}

// ---------- Feedback partagé ----------
function showFeedback(answered, isCorrect, explanation){
  const fb = document.getElementById('feedback');
  if(answered){
    fb.classList.add('show');
    fb.innerHTML = (isCorrect ? '<b>Correct.</b> ' : '<b>Pas tout à fait.</b> ') + explanation;
  }
}

// ---------- Écran final ----------
function renderFinal(){
  state.screen = 'final';
  const correctCount = countCorrect();
  const total = state.questions.length;
  let title, msg;
  if(correctCount === total){ title = 'Maître du Lore'; msg = "Runeterra n'a plus aucun secret pour toi."; }
  else if(correctCount >= total * 0.75){ title = 'Érudit de Runeterra'; msg = "Un score solide — tu connais l'univers sur le bout des doigts."; }
  else if(correctCount >= total * 0.5){ title = 'Voyageur curieux'; msg = "Une bonne base, mais quelques régions te réservent encore des surprises."; }
  else { title = 'Apprenti explorateur'; msg = "L'aventure ne fait que commencer — Runeterra est vaste."; }

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
        <div class="tally">${correctCount}<span>/${total}</span></div>
        <h2>${title}</h2>
        <p>${msg}</p>
        <div class="final-buttons">
          <button class="btn primary" id="replayBtn">Rejouer (${MODES[state.mode].label})</button>
          <button class="btn" id="menuBtn">Choisir un autre mode</button>
        </div>
      </div>
    </main>
    <footer>Quiz de trivia créé pour les fans — League of Legends et son univers appartiennent à Riot Games.</footer>
  `;
  document.getElementById('replayBtn').addEventListener('click', () => startGame(state.mode));
  document.getElementById('menuBtn').addEventListener('click', () => { state.screen = 'menu'; render(); });
}

// ---------- Routeur ----------
function render(){
  if(state.screen === 'menu') renderMenu();
  else if(state.screen === 'playing') renderGame();
  else if(state.screen === 'final') renderFinal();
}

render();
