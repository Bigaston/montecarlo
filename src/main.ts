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

let deckHasBeenImported = false;

const j1 = new Player("Player1");
const j2 = new Player("Player2");

document.getElementById("importDeckButton")!.addEventListener("click", () => {
  let deck = document.getElementById("importDeck") as HTMLTextAreaElement;
  j2.importDeck(deck.value);

  deckHasBeenImported = true;
});

async function startGeneration() {
  result.innerHTML = "";
  console.log("Start Generation");

  j1.generateDeck();

  if (!deckHasBeenImported) j2.generateDeck();

  console.log(j2.exportDeck());

  generatePlot(j1.deck, "P1 Deck");

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

  generatePlot(j1.deck, "P1 Final Deck");
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
        },
        {
          label: "Winrate Limite",
          data: lastWinRates,
        },
      ],
    },
  });

  console.log(j1.exportDeck());
}

document.getElementById("startGeneration")!.addEventListener("click", () => {
  startGeneration();
});

function generatePlot(deck: Card[], title: string) {
  let p = document.createElement("p");
  p.innerHTML = title;
  result.appendChild(p);

  let canvas = document.createElement("canvas");
  result.appendChild(canvas);

  let cardCount: { [key: string]: number } = {};

  deck.forEach((card) => {
    if (cardCount[card.cost + ""]) cardCount[card.cost + ""]++;
    else cardCount[card.cost + ""] = 1;
  });

  const data: { cost: number; count: number }[] = [];

  for (let cost in cardCount) {
    data.push({ cost: parseInt(cost), count: cardCount[cost] });
  }

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: data.map((row) => row.cost),
      datasets: [
        {
          label: "Card per cost",
          data: data.map((row) => row.count),
        },
      ],
    },
  });
}
