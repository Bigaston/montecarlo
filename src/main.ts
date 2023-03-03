import { Chart } from "chart.js/auto";
import html2canvas from "html2canvas";
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

document.getElementById("removeRemovedCard")!.addEventListener("click", () => {
  Card.resetRemovedCards();
  console.log("Removed Cards: ", Card.getRemovedCards());
});

async function startGeneration() {
  result.innerHTML = "";
  console.log("Start Generation");

  if (!deckHasBeenImportedj1) j1.generateDeck(true);
  console.log(Card.allCards);

  if (!deckHasBeenImportedj2) j2.generateDeck();

  Card.allCards = Card.generateSetList();

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
    let removedCard = j1.replaceDeck();

    nbVictoryJ1 = 0;
    nbTourParty = [];

    for (let i = 0; i < NB_GAME; i++) {
      log("=== Game" + i + " ===");

      let bat = new Battle(j1, j2);
      let result = bat.startBattle();

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

      Card.addRemovedCards(removedCard[0]);
    } else {
      console.log(
        "❌ Rollback | Winrate: " + nbVictoryJ1 / NB_GAME + "<" + lastWinRate
      );

      j1.deck = [...lastDeck];
      Card.addRemovedCards(removedCard[1]);
    }

    lastWinRates.push(lastWinRate);
  }

  let div = document.getElementById("finalDeck") as HTMLDivElement;
  div.innerHTML = "";

  j1.deck
    .sort((a, b) => a.cost - b.cost)
    .forEach((card) => {
      div.appendChild(card.toText());
    });

  generatePlot(j1.deck, j2.deck, "Final Deck");

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

  canvas = document.createElement("canvas");
  result.appendChild(canvas);

  new Chart(canvas, {
    type: "line",
    data: {
      labels: nbTour.map((_w, i) => i),
      datasets: [
        {
          label: "Nombre de tour/match",
          data: nbTour,
          pointStyle: false,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Nb Tour Evolution",
        },
      },
    },
  });

  console.log(Card.nbParty);
  console.log(Card.getRemovedCardsSortBanalized());
  console.log(j1.exportDeck());
  download("deck_" + Date.now() + ".json", j1.exportDeck());

  setTimeout(takeScreenshot, 1000);
}

document.getElementById("startGeneration")!.addEventListener("click", () => {
  startGeneration();
});

document.getElementById("startGenerationx10")!.addEventListener("click", () => {
  for (let i = 0; i < 10; i++) {
    console.log("=== Generation" + i + " ===");
    startGeneration();
  }
});

function generatePlot(deck1: Card[], deck2: Card[], title: string) {
  let can = document.createElement("canvas");
  result.appendChild(can);

  let cost1 = deck1.map((c) => c.cost);
  let cost2 = deck2.map((c) => c.cost);

  const counts1: { [key: number]: number } = {};
  const counts2: { [key: number]: number } = {};

  for (const num of cost1) {
    counts1[num] = counts1[num] ? counts1[num] + 1 : 1;
  }

  for (const num of cost2) {
    counts2[num] = counts2[num] ? counts2[num] + 1 : 1;
  }

  console.log(counts1);
  console.log(counts2);

  new Chart(can, {
    type: "bar",
    data: {
      labels: ["0", "1", "2", "3", "4", "5", "6"],
      datasets: [
        {
          label: "J1",
          data: counts1,
        },
        {
          label: "J2",
          data: counts2,
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

function download(filename: string, text: string) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:application/json;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function takeScreenshot() {
  html2canvas(document.querySelector("#capture") as HTMLDivElement).then(
    (canvas) => {
      // document.body.appendChild(canvas);
      canvas.toBlob((blob) => {
        blobToDataURL(blob as Blob).then((dataUrl) => {
          var element = document.createElement("a");
          element.setAttribute("href", dataUrl);
          element.setAttribute("download", "graph_" + Date.now() + ".png");

          element.style.display = "none";
          document.body.appendChild(element);

          element.click();

          document.body.removeChild(element);
        });
      });
    }
  );
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (_e) => resolve(reader.result as string);
    reader.onerror = (_e) => reject(reader.error);
    reader.onabort = (_e) => reject(new Error("Read aborted"));
    reader.readAsDataURL(blob);
  });
}
