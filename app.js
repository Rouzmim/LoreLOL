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


// ---------- Modes ----------
const MODES = {
  qcm:{
    label:'Quiz classique',
    sub:'QCM sur le lore',
    pool:QCM_QUESTIONS,
    icon:'Q'
  },

  difficile:{
    label:'Mode difficile',
    sub:'Réponses libres · 3 erreurs maximum',
    pool:QCM_DIFFICILE_QUESTIONS,
    icon:'⚔'
  }
};


const SESSION_LENGTH = 20;


// ---------- État ----------
let state = {
  screen:'menu',
  mode:null,

  questions:[],
  index:0,

  answers:[],

  // uniquement utilisé en difficile
  errors:0,
  maxErrors:3
};


const root = document.getElementById('root');


// ---------- Menu ----------
function renderMenu(){

root.innerHTML = `

<header class="top">

<div>
<p class="brand-eyebrow">
Encyclopédie non-officielle · Fan quiz
</p>

<h1>
Runeterra <span>Lore Quiz</span>
</h1>

</div>

</header>


<p class="menu-intro">
Choisis ton mode de jeu.
</p>


<div class="mode-grid" id="modeGrid"></div>


<footer>
Quiz de trivia créé pour les fans — League of Legends et son univers appartiennent à Riot Games.
</footer>

`;


const grid=document.getElementById('modeGrid');


Object.entries(MODES).forEach(([key,m])=>{


const card=document.createElement('button');


card.className='mode-card';


card.innerHTML=`

<span class="mode-icon">
${m.icon}
</span>

<span class="mode-label">
${m.label}
</span>

<span class="mode-sub">
${m.sub}
</span>

<span class="mode-count">
${m.pool.length} questions en banque
</span>

`;


card.addEventListener('click',()=>startGame(key));


grid.appendChild(card);


});


}


// ---------- Démarrage partie ----------
function startGame(modeKey){

const mode = MODES[modeKey];


state.screen='playing';

state.mode=modeKey;


state.questions =
pickRandom(
mode.pool,
modeKey === 'qcm' ? SESSION_LENGTH : mode.pool.length
)
.map(q=>{

const copy={...q};


if(modeKey==='qcm'){

copy.shuffledOptions=null;
copy.correctShuffled=null;
copy._lastPick=null;

}


return copy;

});


state.index=0;

state.answers=
new Array(state.questions.length).fill(null);


state.errors=0;


render();

}// ---------- Rendu : Jeu ----------
function renderGame(){

root.innerHTML=`

<header class="top compact">

<div>

<p class="brand-eyebrow">
${MODES[state.mode].label}
</p>

<h1 class="game-title">
Runeterra <span>Lore Quiz</span>
</h1>

</div>


<div class="header-actions">

<button class="btn danger" id="backToMenuBtn">
Quitter la partie
</button>


<div class="score-box">

Score

<b id="scoreDisplay">
${
state.mode==='difficile'
?
`${countCorrect()} réussies · ${state.errors}/${state.maxErrors} erreurs`
:
`${countCorrect()} / ${state.questions.length}`
}
</b>

</div>

</div>


</header>


<div class="layout">

<nav class="dots" id="dotsNav"></nav>

<main class="card" id="card"></main>

</div>


<footer>
Quiz de trivia créé pour les fans — League of Legends et son univers appartiennent à Riot Games.
</footer>

`;


buildDots();

renderQuestion();


document
.getElementById('backToMenuBtn')
.addEventListener('click',()=>{


if(confirm("Quitter la partie en cours ?")){

state.screen='menu';
state.mode=null;
state.questions=[];
state.index=0;
state.answers=[];
state.errors=0;

render();

}


});


}



// ---------- Navigation questions ----------
function buildDots(){

const nav=document.getElementById('dotsNav');

nav.innerHTML='';


state.questions.forEach((q,i)=>{

const b=document.createElement('button');

b.className='dot-btn';

b.textContent=i+1;


b.addEventListener('click',()=>{

if(state.mode==='difficile') return;

state.index=i;

renderQuestion();

updateDots();

});


nav.appendChild(b);


});


updateDots();

}



function updateDots(){

const btns=document.querySelectorAll('.dot-btn');


btns.forEach((b,i)=>{

b.classList.remove(
'current',
'correct',
'wrong'
);


if(state.answers[i]===true)
b.classList.add('correct');


if(state.answers[i]===false)
b.classList.add('wrong');


if(i===state.index)
b.classList.add('current');


});


}



// ---------- Score ----------
function countCorrect(){

return state.answers.filter(a=>a===true).length;

}


function updateScore(){

const el=document.getElementById('scoreDisplay');

if(el)
el.textContent =
countCorrect()+" / "+state.questions.length;

}



// ---------- Question actuelle ----------
function renderQuestion(){

const card=document.getElementById('card');

const item=state.questions[state.index];


if(state.mode==='qcm')
renderQCM(card,item);


if(state.mode==='difficile')
renderDifficile(card,item);

}



// ---------- Boutons navigation QCM ----------
function navButtonsHTML(){

const isLast =
state.index===state.questions.length-1;


return `

<div class="nav-buttons">

<button class="btn" id="prevBtn"
${state.index===0?'disabled':''}>
← Précédent
</button>


<button class="btn primary" id="nextBtn">

${isLast?'Voir le résultat':'Suivant →'}

</button>


</div>

`;

}


function bindNavButtons(){

const prev=document.getElementById('prevBtn');

const next=document.getElementById('nextBtn');


if(prev){

prev.addEventListener('click',()=>{

state.index--;

renderQuestion();

updateDots();

});

}


if(next){

next.addEventListener('click',()=>{


if(state.index===state.questions.length-1){

renderFinal();

}

else{

state.index++;

renderQuestion();

updateDots();

}


});


}

}



// ---------- MODE QCM ----------
function renderQCM(card,item){


const answered =
state.answers[state.index]!==null;



card.innerHTML=`

<div class="question-meta">

<span class="difficulty ${item.difficulty}">
${item.difficulty}
</span>

</div>


<p class="question">
${item.question}
</p>


<div class="options" id="optionsWrap"></div>


<div class="feedback" id="feedback"></div>


${navButtonsHTML()}

`;



// Mélange options une seule fois

if(!item.shuffledOptions){


item.shuffledOptions =
shuffle(
item.options.map((text,index)=>({

text:text,

correct:index===item.correct

}))
);


item.correctShuffled =
item.shuffledOptions.findIndex(
x=>x.correct
);


}



const wrap=
document.getElementById('optionsWrap');


const letters=['A','B','C','D'];



item.shuffledOptions.forEach((option,idx)=>{


const b=document.createElement('button');


b.className='opt';


b.innerHTML=`

<span class="letter">
${letters[idx]}
</span>

<span>
${option.text}
</span>

`;



if(answered){

b.disabled=true;


if(idx===item.correctShuffled)

b.classList.add('is-correct');


if(item._lastPick===idx)

b.classList.add('is-wrong');


}



b.addEventListener('click',()=>{


if(answered)return;


item._lastPick=idx;


state.answers[state.index]
=
idx===item.correctShuffled;


updateScore();

updateDots();

renderQuestion();


});



wrap.appendChild(b);


});



showFeedback(
answered,
state.answers[state.index],
item.explanation
);


bindNavButtons();


}



// ---------- MODE DIFFICILE ----------
function renderDifficile(card,item){


card.innerHTML=`

<div class="question-meta">

<span class="difficulty hard">
Difficile
</span>


<span>
Erreurs : ${state.errors}/${state.maxErrors}
</span>

</div>


<p class="question">
${item.question}
</p>


<input
id="answerInput"
class="opt"
placeholder="Ta réponse..."
autocomplete="off"
/>


<button class="btn primary" id="validateAnswer">
Valider
</button>


<div class="feedback" id="feedback"></div>


`;



document
.getElementById('validateAnswer')
.addEventListener('click',()=>{


const input=
document
.getElementById('answerInput')
.value
.trim();


if(!input)return;



const correct =
isAnswerCorrect(
input,
item
);



if(correct){

state.answers[state.index]=true;


state.index++;


}

else{

state.errors++;

state.answers[state.index]=false;

if(state.errors>=state.maxErrors){
    renderFinal();
    return;
}

state.index++;

}


}



if(state.index>=state.questions.length){

renderFinal();

return;

}


renderQuestion();

});


}
// ---------- Validation réponse difficile ----------

function normalizeText(text){

return text
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.replace(/[^a-z0-9\s]/g,"")
.trim()
.replace(/\s+/g," ");

}



function levenshtein(a,b){

const matrix=[];


for(let i=0;i<=b.length;i++){

matrix[i]=[i];

}


for(let j=0;j<=a.length;j++){

matrix[0][j]=j;

}



for(let i=1;i<=b.length;i++){

for(let j=1;j<=a.length;j++){


if(b[i-1]===a[j-1]){

matrix[i][j]=matrix[i-1][j-1];

}

else{

matrix[i][j]=Math.min(

matrix[i-1][j-1]+1,

matrix[i][j-1]+1,

matrix[i-1][j]+1

);

}


}

}


return matrix[b.length][a.length];

}



function isAnswerCorrect(userAnswer,item){


const user =
normalizeText(userAnswer);



const possibleAnswers=[

item.answer,

...(item.acceptedAnswers || [])

];



return possibleAnswers.some(answer=>{


const expected =
normalizeText(answer);



if(user===expected)
return true;



const distance =
levenshtein(user,expected);



const maxDistance =
expected.length <= 5 ? 1 :
expected.length <= 10 ? 2 :
3;



return distance<=maxDistance;



});


}




// ---------- Feedback ----------
function showFeedback(answered,isCorrect,explanation){


const fb=document.getElementById('feedback');


if(!fb || !answered)
return;



fb.classList.add('show');


fb.innerHTML =
isCorrect

?

`<b>Correct.</b> ${explanation || ""}`

:

`<b>Pas tout à fait.</b> ${explanation || ""}`;


}



// ---------- Écran final ----------
function renderFinal(){


state.screen='final';


const correctCount=countCorrect();

const total=state.questions.length;



let title;

let msg;



if(state.mode==='difficile'){


if(state.errors>=state.maxErrors){

title="Défaite";

msg=
`Tu as atteint les ${state.maxErrors} erreurs autorisées.`;

}

else{

title="Expert du Lore";

msg=
"Tu as résisté aux questions les plus difficiles de Runeterra.";

}



}

else{


if(correctCount===total){

title="Maître du Lore";

msg=
"Runeterra n'a plus aucun secret pour toi.";

}

else if(correctCount>=total*0.75){

title="Érudit de Runeterra";

msg=
"Un score solide.";

}

else if(correctCount>=total*0.5){

title="Voyageur curieux";

msg=
"Encore quelques régions à explorer.";

}

else{

title="Apprenti explorateur";

msg=
"L'aventure commence.";

}


}



root.innerHTML=`

<header class="top compact">

<div>

<p class="brand-eyebrow">
${MODES[state.mode].label}
</p>


<h1 class="game-title">
Runeterra <span>Lore Quiz</span>
</h1>


</div>

</header>



<main class="card">

<div class="final">


<p class="theme-tag">
Résultat final
</p>


<div class="tally">

${correctCount}

<span>
/
${total}
</span>

</div>


<h2>
${title}
</h2>


<p>
${msg}
</p>



<div class="final-buttons">


<button class="btn primary" id="replayBtn">

Rejouer

</button>


<button class="btn" id="menuBtn">

Menu

</button>


</div>


</div>

</main>



<footer>
Quiz de trivia créé pour les fans — League of Legends et son univers appartiennent à Riot Games.
</footer>


`;



document
.getElementById('replayBtn')
.addEventListener('click',()=>{

startGame(state.mode);

});



document
.getElementById('menuBtn')
.addEventListener('click',()=>{

state.screen='menu';

state.mode=null;

render();

});


}




// ---------- Routeur ----------
function render(){

if(state.screen==='menu')
renderMenu();


else if(state.screen==='playing')
renderGame();


else if(state.screen==='final')
renderFinal();

}


render();
