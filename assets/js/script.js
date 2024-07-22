// -------- SCRIPT DEL GIOCO ----------//

// oggetto che definisce il numero di carte per ogni livello di difficoltà
const levels = {
  easy: 8,
  medium: 12,
  hard: 16,
};

// Array di immagini che verranno utilizzate all'interno delle carte

const images = [
    "/assets/img/cards/image1.png",
    "/assets/img/cards/image2.png",
    "/assets/img/cards/image3.png",
    "/assets/img/cards/image4.png",
    "/assets/img/cards/image5.png",
    "/assets/img/cards/image6.png",
    "/assets/img/cards/image7.png",
    "/assets/img/cards/image8.png"
];


//------ VARIABILI -------//

//memorizza il primo elemento selezionato
let firstCard = null;
// memorizza il secondo elemento selezionato
let secondCard = null;
// variabile flag per evitare ulteriori clic quando due carte sono in fase di controllo
let boardLocked = false;
// variabile della board
const board = document.getElementById("board");

//conteggio del numero di coppie e degli errori commessi
let matches = 0;
let errors = 0;

//--------- FUNZIONE CHE AVVIA IL GIOCO -----------//
function startGame(level) {
  //calcolo il numero di coppie di carte in base al livello selezionato
  const imageCouple = levels[level] / 2;

  //per pulire il tabellone di gioco e resettare i contatori
  board.innerHTML = "";
  matches = 0;
  errors = 0;
  updateErrorCount();

  //Seleziono le emoji necessarie per il livello
  const selectedImages = images.slice(0, imageCouple);
  const cardValues = [...selectedImages, ...selectedImages];

  //Creo un array di elementi in coppia e li mescolo
  cardValues.sort(() => Math.random() - 0.5);

  // Col ciclo foreach creo le carte, imposto i valori e aggiungo i click event
  cardValues.forEach((src) => {
    const card = document.createElement("div");  
    card.classList.add("card");
    card.dataset.value = src;
  
    const frontImg = document.createElement('img');
    frontImg.src = src;
    // Aggiungo una classe per distinguere il fronte
    frontImg.classList.add('front');
    frontImg.classList.add('rounded'); 

    const backImg = document.createElement('img');
    // Immagine del punto interrogativo
    backImg.src = "/assets/img/cards/question.jpg";
    // Aggiungo una classe per distinguere il retro
    backImg.classList.add('back');
    backImg.classList.add('rounded');

    card.appendChild(frontImg);
    card.appendChild(backImg);
  
    card.addEventListener('click', flipCard);
    board.appendChild(card);
  });

  // Mostra tutte le carte per 3 secondi
  boardLocked = true;
  const frontImages = document.querySelectorAll('.card img.front');
  const backImages = document.querySelectorAll('.card img.back');

  frontImages.forEach(img => img.classList.remove('hidden'));
  backImages.forEach(img => img.classList.add('hidden'));
  setTimeout(() => {
    frontImages.forEach(img => img.classList.add('hidden'));
    backImages.forEach(img => img.classList.remove('hidden'));
    boardLocked = false;
  }, 3000);
}

// --------- FUNZIONE PER MOSTRARE TUTTE LE CARTE ALL'INIZIO -----------//
function showAllCardsTemporarily() {
    const frontImages = document.querySelectorAll('.card img.front');
    const backImages = document.querySelectorAll('.card img.back');
  
    frontImages.forEach(img => img.classList.remove('hidden'));
    backImages.forEach(img => img.classList.add('hidden'));
  
    setTimeout(() => {
      frontImages.forEach(img => img.classList.add('hidden'));
      backImages.forEach(img => img.classList.remove('hidden'));
      boardLocked = false;
    }, 3000);
  }

//--------------- FUNZIONE CHE PARTE AL CLICK SULLE CARTE ----------------//
function flipCard() {
  playAudio("/assets/audio/mouse-click.mp3")
  //se il tabellone è bloccato o se questa carta cliccata è già stata selezionata o se è già stata matchata
  if (boardLocked || this === firstCard || this.classList.contains("matched"))
    return;
    // Mostra l'immagine della carta
    const frontImg = this.querySelector('img.front');
    const backImg = this.querySelector('img.back');
    frontImg.classList.remove('hidden');
    backImg.classList.add('hidden'); 
    this.classList.add('flipped');

  // se non è la prima carta
  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  // richiamo la funzione per controllare che le carte siano una copia
  checkForMatch();
}

// Funzione per gira nuovamente le carte se non corrispondono
function unflipCards() {
    firstCard.querySelector('img.front').classList.add('hidden');
    firstCard.querySelector('img.back').classList.remove('hidden');
    secondCard.querySelector('img.front').classList.add('hidden');
    secondCard.querySelector('img.back').classList.remove('hidden');
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetBoard();
  }
//--------------- FUNZIONE CHE CONTROLLA SE LE CARTE SCOPERTE SONO UGUALI ------------//
function checkForMatch() {
  // se il valore della prima carta è uguale al valore della seconda
  if (firstCard.dataset.value === secondCard.dataset.value) {
    //aggiungi la classe 'matched' ad entrambe le carte
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    // ed incrementi il contatore di carte matchate
    matches += 2;
    // richiamo la funzione per riprodurre il suono delle carte accoppiate
    playAudio("/assets/audio/matched.mp3")
    resetBoard();
    
    // e se la variabile matches è uguale alla lunghezza delle carte presenti nel DOM
    if (matches === document.querySelectorAll(".card").length) {
      //compare una modale di vittoria dopo 5 secondi
      setTimeout(() => {
        winAudio();
        const winModal = new bootstrap.Modal(document.getElementById('winModal'));
        const modalBody = document.querySelector('.modal-body');
        let errorsDom = errors;
        modalBody.innerHTML=`Complimenti! Hai completato la partita.<div class="text-info">Hai compiuto ${errorsDom} errori.</div>`;
        winModal.show();
        }, 500);
    }

    // altrimenti se non c'è corrispondenza
  } else {
    // il tabellone è bloccato
    boardLocked = true;
    // aumenta il contatore degli errori
    errors++;
    updateErrorCount();
    playAudio("/assets/audio/error.mp3")
    // si girano nuovamente le carte dopo 1 secondo
    setTimeout(unflipCards, 1000);
  }
}

//------------ FUNZIONE PER RIAVVIARE IL GIOCO ------------//

function reloadGame() {
    location.reload();
}

//------------ FUNZIONI PER GESTIRE LE CARTE NON MATCHATE ----------------//

// funzione per resettare le variabili di stato del gioco
function resetBoard() {
  firstCard = null;
  secondCard = null;
  boardLocked = false;
}

// Funzione per aggiornare il conteggio degli errori e mostrarli in schermo
function updateErrorCount() {
  document.getElementById("errors").innerText = `Errori: ${errors}`;
}


//------------------ FUNZIONI PER IL SUONO -----------------------//
// Variabili
const backgroundMusic = document.getElementById("background-music");
const audioGame = document.getElementById("volume-control");
const output = document.getElementById("value");
const clickSound = document.getElementById("click-sound");
const audioLevel = document.querySelectorAll(".level")

// Riproduco una musica di sottofondo all'avvio della pagina
document.addEventListener("DOMContentLoaded", () => {
  // Imposto il volume iniziale al 50%
  const volume = 0.5;
  backgroundMusic.volume = volume;
  // Aggiorna l'output del volume a 50%
  output.innerHTML = volume * 100;
  const playBackgroundMusic = () => {
    backgroundMusic.play().catch((error) => {
      console.error(
        "Errore durante la riproduzione della musica di sottofondo:",
        error
      );
    });
  };
  // riproduco la musica di sottofondo automaticamente
  playBackgroundMusic();
  // Aggiungo un ascoltatore di eventi per garantire che la musica possa iniziare se l'autoplay fallisce
  document.body.addEventListener("click", playBackgroundMusic, { once: true });
});

audioGame.oninput = function () {
  output.innerHTML = Math.round(this.value * 100); // Mostra il volume come percentuale intera
};

audioGame.addEventListener("input", (event) => {
  const volume = event.target.value;
  backgroundMusic.volume = volume;
  clickSound.volume = volume;
  const percentage = Math.round(volume * 100); // Calcola il volume come percentuale intera
  const color = `linear-gradient(90deg, rgb(99,57,237) ${percentage}%, rgb(214,214,214) ${percentage}%)`;
  audioGame.style.background = color;
});

// per riprodurre il suono al button del livello
document.querySelectorAll(".level").forEach((level) => {
  level.addEventListener("click", () => {
    clickSound.play().catch((error) => {
      console.error(
        "Errore durante la riproduzione del suono di click:",
        error
      );
    });
    startGame(level.id);
  });
});

// funzione per riprodurre i suoni al click
function playAudio(sound) {
    let audio = new Audio(sound);
    audio.oncanplaythrough = function () {
        audio.play();
    }
    return audio;
}

// funzione per riprodurre il suono della modale dopo la vittoria
function winAudio() {
    backgroundMusic.pause();
    playAudio('/assets/audio/game-bonus.mp3');
}
