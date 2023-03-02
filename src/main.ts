import { Chart } from "chart.js/auto";
// import { Application } from "pixi.js";
import { Battle } from "./class/Battle";
import { Card } from "./class/Card";
import { log, setLog } from "./class/Logger";
import { Player } from "./class/Player";
import { NB_GAME, NB_GENERATION } from "./Params";
import "./style.css";

// Simulation
setLog(false);

let result = document.getElementById("result") as HTMLDivElement;

let deckHasBeenImportedj1 = false;
let deckHasBeenImportedj2 = false;

const j1 = new Player("Player1");
const j2 = new Player("Player2");

document.getElementById("importDeckButtonj1")!.addEventListener("click", () => {
  let deck = document.getElementById("importDeckj1") as HTMLTextAreaElement;
  j1.importDeck(deck.value);

  deckHasBeenImportedj1 = true;
});

document.getElementById("importDeckButtonj2")!.addEventListener("click", () => {
  let deck = document.getElementById("importDeckj2") as HTMLTextAreaElement;
  j2.importDeck(deck.value);

  deckHasBeenImportedj2 = true;
});

async function startGeneration() {
  result.innerHTML = "";
  console.log("Start Generation");

  if (!deckHasBeenImportedj1) j1.generateDeck();
  if (!deckHasBeenImportedj2) j2.generateDeck();

  generatePlot(j1.deck, j2.deck, "First Deck");

  log(j1);
  log(j2);

  let nbVictoryJ1 = 0;
  let nbTourParty = [];
  let nbTour = [];
  let winRates = [];
  let lastWinRates = [];

  let lastWinRate = 0;
  let lastDeck: Card[] = [];

  for (let generation = 0; generation < NB_GENERATION; generation++) {
    console.log("=== Generation" + generation + " ===");

    // Change Deck
    j1.replaceDeck();

    nbVictoryJ1 = 0;
    nbTourParty = [];

    for (let i = 0; i < NB_GAME; i++) {
      log("=== Game" + i + " ===");

      let bat = new Battle(j1, j2);
      let result = await bat.startBattle();

      nbTourParty.push(result.nbTour);

      if (result.winner === j1.name) {
        nbVictoryJ1++;
      }
    }

    log("");
    log("====================================");
    log("Winrate de " + j1.name + ": " + (nbVictoryJ1 / NB_GAME) * 100 + "%");
    log(
      "Moyenne de tour par partie: " +
        nbTourParty.reduce((a, b) => a + b) / NB_GAME +
        " tours"
    );

    nbTour.push(nbTourParty.reduce((a, b) => a + b) / NB_GAME);
    winRates.push(nbVictoryJ1 / NB_GAME);

    if (nbVictoryJ1 / NB_GAME > lastWinRate) {
      console.log(
        "🟩 Keep | Winrate: " + nbVictoryJ1 / NB_GAME + ">" + lastWinRate
      );

      lastWinRate = nbVictoryJ1 / NB_GAME;
      lastDeck = [...j1.deck];
    } else {
      console.log(
        "❌ Rollback | Winrate: " + nbVictoryJ1 / NB_GAME + "<" + lastWinRate
      );

      j1.deck = [...lastDeck];
    }

    lastWinRates.push(lastWinRate);
  }

  console.log(j1.deck);

  let div = document.getElementById("finalDeck") as HTMLDivElement;
  div.innerHTML = "";

  j1.deck
    .sort((a, b) => a.cost - b.cost)
    .forEach((card) => {
      div.appendChild(card.toText());
    });

  generatePlot(j1.deck, j2.deck, "Final Deck");
  console.log(nbTour);

  let p = document.createElement("p");
  p.innerHTML = "Winrate";
  result.appendChild(p);

  let canvas = document.createElement("canvas");
  result.appendChild(canvas);

  new Chart(canvas, {
    type: "line",
    data: {
      labels: winRates.map((_w, i) => i),
      datasets: [
        {
          label: "Winrate",
          data: winRates,
          pointStyle: false,
        },
        {
          label: "Winrate Limite",
          data: lastWinRates,
          pointStyle: false,
        },
      ],
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 1,
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Winrate Evolution",
        },
      },
    },
  });

  console.log(j1.exportDeck());
}

document.getElementById("startGeneration")!.addEventListener("click", () => {
  startGeneration();
});

function generatePlot(deck1: Card[], deck2: Card[], title: string) {
  let can = document.createElement("canvas");
  result.appendChild(can);

  let cardCountj1: { [key: string]: number } = {};
  let cardCountj2: { [key: string]: number } = {};

  deck1.forEach((card) => {
    if (cardCountj1[card.cost + ""]) cardCountj1[card.cost + ""]++;
    else cardCountj1[card.cost + ""] = 1;
  });

  deck2.forEach((card) => {
    if (cardCountj2[card.cost + ""]) cardCountj2[card.cost + ""]++;
    else cardCountj2[card.cost + ""] = 1;
  });

  const dataj1: { cost: number; count: number }[] = [];
  const dataj2: { cost: number; count: number }[] = [];

  for (let cost in cardCountj1) {
    dataj1.push({ cost: parseInt(cost), count: cardCountj1[cost] });
  }

  for (let cost in cardCountj2) {
    dataj2.push({ cost: parseInt(cost), count: cardCountj1[cost] });
  }

  new Chart(can, {
    type: "bar",
    data: {
      labels: [0, 1, 2, 3, 4, 5, 6],
      datasets: [
        {
          label: "J1",
          data: dataj1.map((row) => row.count),
        },
        {
          label: "J2",
          data: dataj2.map((row) => row.count),
        },
      ],
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 15,
        },
      },
      plugins: {
        title: {
          display: true,
          text: title,
        },
      },
    },
  });
}
