import arc from "@architect/functions";
import fetch from "node-fetch";
import { DateTime } from "luxon";

async function updateWinnerBasedOnScores() {
  const scoresResponse = await fetch(
    "https://api.the-odds-api.com/v4/sports/americanfootball_nfl/scores/?apiKey=e58eb82afa5b0c9444b013c1afbf0a4d&daysFrom=3",
  );
  const scoresData = await scoresResponse.json();
  const db = await arc.tables();

  for (const gameScore of scoresData) {
    if (!gameScore.completed || !gameScore.scores) continue;

    const week = getNFLWeek(
      DateTime.fromISO(gameScore.commence_time, { zone: "UTC" }),
    ).toString();

    const game = await db.game.get({ week: week, id: gameScore.id });
    if (!game) {
      console.log(`Game ${gameScore.id} not found for week ${week}`);
      continue;
    }

    const homeScore = parseInt(
      gameScore.scores.find((score) => score.name === gameScore.home_team)
        ?.score || "0",
    );
    const awayScore = parseInt(
      gameScore.scores.find((score) => score.name === gameScore.away_team)
        ?.score || "0",
    );

    const actualDifference = awayScore - homeScore;
    const spreadDifference = game.team1Spread;

    let winner;
    if (actualDifference - spreadDifference < 0) {
      console.log(
        `${gameScore.home_team} wins ATS with score ${homeScore} - ${awayScore}. Actual difference was ${actualDifference} and spread difference was ${spreadDifference}`,
      );
      winner = 1;
    } else if (actualDifference - spreadDifference > 0) {
      console.log(
        `${gameScore.away_team} wins ATS with score ${awayScore} - ${homeScore}. Actual difference was ${actualDifference} and spread difference was ${spreadDifference}`,
      );
      winner = 2;
    } else {
      console.log(
        `${gameScore.home_team}-${gameScore.away_team} pushes with score ${homeScore} - ${awayScore}`,
      );
      continue;
    }

    await db.game.put({ ...game, winner });
  }
}

export async function handler() {
  try {
    await updateWinnerBasedOnScores();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Game winners updated successfully.",
      }),
    };
  } catch (error) {
    console.error("Error updating game winners:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to update game winners." }),
    };
  }
}

const getNFLWeek = (today = DateTime.utc()) => {
  if (today.weekday === 2 && today.hour < 5) {
    today = today.minus({ days: 1 });
  }
  const startOfSeason = DateTime.fromISO("2023-09-05", { zone: "UTC" });
  const daysSinceStart = today.diff(startOfSeason, "days").days;
  return Math.floor(daysSinceStart / 7) + 1;
};
