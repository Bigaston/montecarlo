import { Chart } from "chart.js/auto";
import { Battle } from "./class/Battle";
import { Player } from "./class/Player";
import "./style.css";

const j1 = new Player("Player1");
const j2 = new Player("Player2");

j1.generateDeck();
j2.generateDeck();

console.log(j1);
console.log(j2);

let nbVictoryJ1 = 0;
let nbTourParty = [];

for (let i = 0; i < 1000; i++) {
  let battle = new Battle(j1, j2);
  let result = battle.startBattle();

  nbTourParty.push(result.nbTour);

  if (result.winner === j1.name) {
    nbVictoryJ1++;
  }
}

console.log("");
console.log("====================================");
console.log("Winrate de " + j1.name + ": " + (nbVictoryJ1 / 1000) * 100 + "%");
console.log(
  "Moyenne de tour par partie: " +
    nbTourParty.reduce((a, b) => a + b) / 1000 +
    " tours"
);

let cardCount: { [key: string]: number } = {};

j1.deck.forEach((card) => {
  if (cardCount[card.cost + ""]) cardCount[card.cost + ""]++;
  else cardCount[card.cost + ""] = 1;
});

const data: { cost: number; count: number }[] = [];

for (let cost in cardCount) {
  data.push({ cost: parseInt(cost), count: cardCount[cost] });
}

new Chart(document.getElementById("plot") as HTMLCanvasElement, {
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
