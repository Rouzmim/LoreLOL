const QUESTIONS = [
{l:'A', tag:'Ionia', q:"De quelle région vient Ahri, la championne au charme envoûtant et aux neuf queues ?", opts:["Ionia","Freljord","Noxus","Piltover"], correct:0, note:"Ahri est originaire d'Ionia, une région imprégnée de magie spirituelle."},
{l:'B', tag:'Bilgewater', q:"La cité portuaire de Bilgewater est surtout réputée pour abriter...", opts:["des mages de guerre","des pirates et chasseurs de primes","des ingénieurs hextech","des chevaliers sacrés"], correct:1, note:"Bilgewater est une ville-port sans foi ni loi, terrain de jeu des pirates et des chasseurs de primes."},
{l:'C', tag:'Piltover', q:"Camille, l'Ombre d'Acier, est une agente d'élite au service de...", opts:["la maison Kiramman, à Piltover","la Ligue des Ombres noxienne","l'Institut de Guerre","le clergé de Targon"], correct:0, note:"Camille protège les intérêts de la maison Kiramman, l'une des grandes familles de Piltover."},
{l:'D', tag:'Demacia', q:"Le royaume de Demacia est historiquement connu pour interdire et persécuter...", opts:["la magie","le commerce extérieur","la musique","les voyages en mer"], correct:0, note:"Demacia se méfie profondément de la magie, qu'elle considère comme une menace à contrôler."},
{l:'E', tag:'Exploration', q:"Ezreal, l'explorateur intrépide, est surtout connu pour...", opts:["ses expéditions dans des ruines anciennes et dangereuses","son règne sur le Freljord","son poste d'amiral à Bilgewater","sa fonction de conseiller à Piltover"], correct:0, note:"Ezreal parcourt Runeterra à la recherche de reliques et de ruines oubliées."},
{l:'F', tag:'Freljord', q:"Le Freljord est une région caractérisée par...", opts:["un climat glacial et des tribus rivales","des jungles tropicales denses","des cités flottantes","un désert sans fin"], correct:0, note:"Le Freljord est une terre gelée où plusieurs tribus se disputent le pouvoir."},
{l:'G', tag:'Bilgewater', q:"Gangplank a autrefois régné en tant que...", opts:["roi de Bilgewater","général suprême de Noxus","Grand Mage d'Ionia","Héraut de Targon"], correct:0, note:"Gangplank a dirigé Bilgewater d'une main de fer avant d'en être chassé."},
{l:'H', tag:'Piltover', q:"Le professeur Heimerdinger, inventeur yordle, est étroitement associé à la ville de...", opts:["Piltover","Bandle City","Icathia","le Mont Targon"], correct:0, note:"Heimerdinger est l'un des fondateurs historiques du Haut Conseil de Piltover."},
{l:'I', tag:'Ionia', q:"Ionia est une région principalement connue pour...", opts:["son lien spirituel profond avec la nature et la magie","son industrie chimique florissante","ses armées de fer et sa discipline militaire","sa flotte de pirates redoutée"], correct:0, note:"Ionia est un archipel où la magie et la nature sont intimement liées à la culture locale."},
{l:'J', tag:'Zaun / Piltover', q:"Dans le lore, Jinx est la sœur de...", opts:["Vi","Caitlyn","Ekko","Sevika"], correct:0, note:"Vi et Jinx (Powder) ont grandi ensemble dans les bas-fonds de Zaun."},
{l:'K', tag:'Noxus', q:"Katarina appartient à la famille Du Couteau, tristement célèbre à...", opts:["Noxus","Demacia","Ionia","Shurima"], correct:0, note:"Les Du Couteau sont une lignée d'assassins influents au sein de l'empire de Noxus."},
{l:'L', tag:'Histoire', q:"Dans le lore original, la Ligue des Légendes fut fondée pour...", opts:["régler les conflits entre nations par des duels de champions plutôt que par la guerre","organiser des tournois sportifs annuels","former de jeunes mages","faciliter le commerce entre les régions"], correct:0, note:"L'idée fondatrice était de canaliser les rivalités politiques en affrontements contrôlés, épargnant des vies."},
{l:'M', tag:'Royaume des morts', q:"Mordekaiser règne en seigneur absolu sur...", opts:["un royaume des morts qu'il domine par la force","le trône de Demacia","la cité de Zaun","le sommet du Mont Targon"], correct:0, note:"Mordekaiser s'est taillé un royaume dans un plan de l'au-delà, où il impose sa loi aux âmes égarées."},
{l:'N', tag:'Noxus', q:"Contrairement à Demacia, l'empire de Noxus valorise avant tout...", opts:["la force et le mérite, peu importe l'origine","la pureté du sang noble","le pacifisme absolu","le commerce maritime pacifique"], correct:0, note:"Noxus prône une ascension par la force et le mérite, où même un esclave peut s'élever au pouvoir."},
{l:'O', tag:'Freljord', q:"Ornn est un dieu-forgeron associé à...", opts:["le Freljord et le travail du métal","Bilgewater et la mer","Shurima et le désert","Piltover et la technologie"], correct:0, note:"Ornn forge dans les entrailles du Freljord, façonnant montagnes et armes légendaires."},
{l:'P', tag:'Piltover', q:"Piltover est traditionnellement surnommée...", opts:["la Cité du Progrès","la Cité des Ombres","la Cité Éternelle","la Cité Flottante"], correct:0, note:"Piltover cultive une image de vitrine du progrès scientifique et technologique."},
{l:'Q', tag:'Demacia', q:"Quinn, l'éclaireuse et sa compagne aigle Valor, sert...", opts:["Demacia","Noxus","Zaun","Ixtal"], correct:0, note:"Quinn est une éclaireuse d'élite au service du royaume de Demacia."},
{l:'R', tag:'Cosmologie', q:"Runeterra désigne...", opts:["le monde entier où se déroule tout l'univers de League of Legends","une seule ville du jeu","le nom d'une arme légendaire","un titre honorifique porté par les rois"], correct:0, note:"Runeterra est le nom de la planète qui rassemble toutes les régions et cultures du jeu."},
{l:'S', tag:'Shurima', q:"L'empire désertique de Shurima fut autrefois dirigé par...", opts:["l'empereur Azir","le roi Jarvan","le Haut Conseil de Piltover","la reine Ashe"], correct:0, note:"Azir fut l'empereur ascendant de l'antique Shurima, avant sa chute."},
{l:'T', tag:'Targon', q:"Le Mont Targon est un lieu où...", opts:["des mortels peuvent s'élever au rang d'Aspects, porteurs du pouvoir des étoiles","se trouve la capitale de Demacia","les Zaunites extraient le hextech","les pirates cachent leurs trésors"], correct:0, note:"Gravir Targon peut transformer un mortel en Aspect, incarnation d'une puissance céleste."},
{l:'U', tag:'Noxus / Zaun', q:"Urgot était autrefois...", opts:["un exécuteur de Noxus, trahi et jeté dans les égouts de Zaun","un roi du Freljord","un mage d'Ionia","un amiral de Bilgewater"], correct:0, note:"Urgot a servi Noxus comme redoutable exécuteur avant d'être trahi par l'empire lui-même."},
{l:'V', tag:'Le Néant', q:"Le Néant (le Void) est une force qui menace Runeterra en...", opts:["dévorant et corrompant tout ce qu'il touche","apportant la paix entre les nations rivales","renforçant la magie de tous les mages","cultivant des terres fertiles"], correct:0, note:"Le Néant est une puissance destructrice venue des profondeurs, qui consume la matière et la vie."},
{l:'W', tag:'Ionia', q:"Wukong, le Singe Rusé, est un guerrier lié à...", opts:["Ionia et l'art du bâton","Noxus et l'épée lourde","le Freljord et la hache","Piltover et les inventions"], correct:0, note:"Wukong manie le bâton avec l'agilité et la ruse propres aux traditions martiales d'Ionia."},
{l:'X', tag:'Demacia', q:"Xin Zhao est le fidèle Sceau-Gardien du prince...", opts:["Jarvan IV de Demacia","Azir de Shurima","Viego des Îles Obscures","Swain de Noxus"], correct:0, note:"Xin Zhao a juré fidélité au prince Jarvan IV et veille personnellement sur sa sécurité."},
{l:'Y', tag:'Bandle City', q:"Les yordles, petites créatures magiques facétieuses, sont originaires de...", opts:["Bandle City","Zaun","Icathia","Bilgewater"], correct:0, note:"Bandle City est le foyer mystérieux et changeant des yordles."},
{l:'Z', tag:'Zaun', q:"La cité souterraine de Zaun est surtout connue pour...", opts:["son industrie chimique florissante mais toxique, la chimtech","son armée impériale disciplinée","ses temples sacrés bien gardés","ses glaciers éternels"], correct:0, note:"Zaun prospère grâce à la chimtech, une industrie aussi puissante que dangereuse pour ses habitants."}
];

let current = 0;
let answers = new Array(QUESTIONS.length).fill(null); // null | true | false
let lastWrongIndex = {};

const runeNav = document.getElementById('runeNav');
const card = document.getElementById('card');
const scoreDisplay = document.getElementById('scoreDisplay');

function buildNav(){
  runeNav.innerHTML = '';
  QUESTIONS.forEach((q, i) => {
    const b = document.createElement('button');
    b.className = 'rune-btn';
    b.textContent = q.l;
    b.setAttribute('aria-label', 'Question ' + q.l);
    b.addEventListener('click', () => { current = i; render(); });
    runeNav.appendChild(b);
  });
}

function updateNavStates(){
  const btns = runeNav.querySelectorAll('.rune-btn');
  btns.forEach((b, i) => {
    b.classList.remove('current','correct','wrong');
    if(answers[i] === true) b.classList.add('correct');
    else if(answers[i] === false) b.classList.add('wrong');
    if(i === current && current < QUESTIONS.length) b.classList.add('current');
  });
}

function updateScore(){
  const correctCount = answers.filter(a => a === true).length;
  scoreDisplay.textContent = correctCount + ' / ' + QUESTIONS.length;
}

function selectedWrongIndex(item){
  return lastWrongIndex[item.l];
}

function renderQuestion(){
  const item = QUESTIONS[current];
  const answered = answers[current] !== null;

  card.innerHTML = `
    <p class="dropcap">${item.l}</p>
    <p class="theme-tag">${item.tag}</p>
    <p class="question">${item.q}</p>
    <div class="options" id="optionsWrap"></div>
    <div class="feedback" id="feedback"></div>
    <div class="nav-buttons">
      <button class="btn" id="prevBtn" ${current === 0 ? 'disabled' : ''}>← Précédent</button>
      <button class="btn primary" id="nextBtn" ${answered ? '' : 'disabled'}>${current === QUESTIONS.length - 1 ? 'Voir le résultat' : 'Suivant →'}</button>
    </div>
  `;

  const wrap = document.getElementById('optionsWrap');
  const letters = ['A','B','C','D'];
  item.opts.forEach((optText, idx) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.innerHTML = `<span class="letter">${letters[idx]}</span><span>${optText}</span>`;
    if(answered){
      b.disabled = true;
      if(idx === item.correct) b.classList.add('is-correct');
      else if(answers[current] === false && idx === selectedWrongIndex(item)) b.classList.add('is-wrong');
    }
    b.addEventListener('click', () => selectOption(idx));
    wrap.appendChild(b);
  });

  const fb = document.getElementById('feedback');
  if(answered){
    fb.classList.add('show');
    fb.innerHTML = (answers[current] ? '<b>Correct.</b> ' : '<b>Pas tout à fait.</b> ') + item.note;
  }

  document.getElementById('prevBtn').addEventListener('click', () => { current--; render(); });
  document.getElementById('nextBtn').addEventListener('click', () => {
    if(current === QUESTIONS.length - 1) renderFinal();
    else { current++; render(); }
  });
}

function selectOption(idx){
  const item = QUESTIONS[current];
  if(answers[current] !== null) return;
  const isCorrect = idx === item.correct;
  answers[current] = isCorrect;
  if(!isCorrect) lastWrongIndex[item.l] = idx;
  updateNavStates();
  updateScore();
  renderQuestion();
}

function renderFinal(){
  const correctCount = answers.filter(a => a === true).length;
  let title, msg;
  if(correctCount === QUESTIONS.length){ title = 'Maître du Lore'; msg = "Runeterra n'a plus aucun secret pour toi, de A à Z."; }
  else if(correctCount >= 19){ title = 'Érudit de Runeterra'; msg = "Un score solide — tu connais l'univers sur le bout des doigts."; }
  else if(correctCount >= 12){ title = 'Voyageur curieux'; msg = "Une bonne base, mais quelques régions te réservent encore des surprises."; }
  else { title = 'Apprenti explorateur'; msg = "L'aventure ne fait que commencer — Runeterra est vaste."; }

  card.innerHTML = `
    <div class="final">
      <p class="theme-tag" style="text-align:center;">Résultat final</p>
      <div class="tally">${correctCount}<span>/${QUESTIONS.length}</span></div>
      <h2>${title}</h2>
      <p>${msg}</p>
      <button class="btn primary" id="restartBtn">Recommencer le quiz</button>
    </div>
  `;
  document.querySelectorAll('.rune-btn').forEach(b => b.classList.remove('current'));
  document.getElementById('restartBtn').addEventListener('click', () => {
    answers = new Array(QUESTIONS.length).fill(null);
    lastWrongIndex = {};
    current = 0;
    updateNavStates();
    updateScore();
    render();
  });
}

function render(){
  updateNavStates();
  renderQuestion();
}

buildNav();
updateScore();
render();
