import { Chart } from "chart.js/auto";
import { Battle } from "./class/Battle";
import { Card } from "./class/Card";
import { log, setLog } from "./class/Logger";
import { Player } from "./class/Player";
import "./style.css";

const NB_GAME = 1000;
const NB_GENERATION = 1000;
setLog(false);

let result = document.getElementById("result") as HTMLDivElement;

async function startGeneration() {
  result.innerHTML = "";
  console.log("Start Generation");

  let j1 = new Player("Player1");
  const j2 = new Player("Player2");

  j1.generateDeck();
  j2.generateDeck();

  console.log(j1.deckDiffer(j2.deck));

  generatePlot(j1.deck, "P1 Deck");

  log(j1);
  log(j2);

  let nbVictoryJ1 = 0;
  let nbTourParty = [];
  let nbTour = [];

  let lastWinRate = 0;
  let lastDeck: Card[] = [];
  let firstj1 = j1.copy();

  for (let generation = 0; generation < NB_GENERATION; generation++) {
    console.log("=== Generation" + generation + " ===");

    // Change Deck
    j1.replaceDeck();

    nbVictoryJ1 = 0;
    nbTourParty = [];

    for (let i = 0; i < NB_GAME; i++) {
      log("=== Game" + i + " ===");

      let battle = new Battle(j1, j2);
      let result = await battle.startBattle();

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

    if (nbVictoryJ1 / NB_GAME > lastWinRate) {
      console.log("Winrate: " + nbVictoryJ1 / NB_GAME + ">" + lastWinRate);
      console.log("Keep");

      lastWinRate = nbVictoryJ1 / NB_GAME;
      lastDeck = [...j1.deck];
    } else {
      console.log("Winrate: " + nbVictoryJ1 / NB_GAME + "<" + lastWinRate);
      console.log("Rollback");
      j1.deck = [...lastDeck];
    }
  }

  console.log(j1.deck);
  console.log(firstj1.deckDiffer(j1.deck));
  console.log(nbTour);

  generatePlot(j1.deck, "P1 Final Deck");
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
