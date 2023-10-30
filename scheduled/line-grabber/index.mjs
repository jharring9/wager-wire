import arc from "@architect/functions";
import fetch from "node-fetch";
import { DateTime } from "luxon";

const API_URL =
  "https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/";
const API_KEY = "e58eb82afa5b0c9444b013c1afbf0a4d";

async function fetchGameLinesFromVegasAPI() {
  const res = await fetch(
    `${API_URL}?apiKey=${API_KEY}&bookmakers=draftkings&markets=spreads&oddsFormat=american`,
  );

  if (res.status !== 200) {
    throw new Error(`Failed to fetch data from Vegas API: HTTP ${res.status}`);
  }

  const data = await res.json();
  const db = await arc.tables();

  for (const game of data) {
    if (game.commence_time < Date.now()) continue;

    const gameDate = DateTime.fromISO(game.commence_time, { zone: "UTC" });
    const isHomeTeamFirst =
      game.bookmakers[0]?.markets[0]?.outcomes[0]?.name === game.home_team;

    const gameRecord = {
      id: game.id,
      week: getNFLWeek(gameDate).toString(),
      team1: game.home_team,
      team2: game.away_team,
      team1Url: getTeamLogoURL(game.home_team),
      team2Url: getTeamLogoURL(game.away_team),
      date: gameDate.toISO(),
      team1Spread:
        game.bookmakers[0]?.markets[0]?.outcomes[isHomeTeamFirst ? 0 : 1]
          ?.point,
      team1Price:
        game.bookmakers[0]?.markets[0]?.outcomes[isHomeTeamFirst ? 0 : 1]
          ?.price,
      team2Spread:
        game.bookmakers[0]?.markets[0]?.outcomes[isHomeTeamFirst ? 1 : 0]
          ?.point,
      team2Price:
        game.bookmakers[0]?.markets[0]?.outcomes[isHomeTeamFirst ? 1 : 0]
          ?.price,
    };

    await db.game.put(gameRecord);
  }
}

export async function handler() {
  try {
    await fetchGameLinesFromVegasAPI();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Game lines fetched and saved successfully.",
      }),
    };
  } catch (error) {
    console.error("Error fetching game lines:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch game lines." }),
    };
  }
}

const getTeamLogoURL = (
  fullName,
  baseURL = "https://wagerwire-webassets.s3.amazonaws.com/",
) => {
  const nameParts = fullName.split(" ");
  const teamName = nameParts[nameParts.length - 1].toLowerCase();
  return `${baseURL}${teamName}.png`;
};

const getNFLWeek = (today = DateTime.utc()) => {
  if (today.weekday === 2 && today.hour < 5) {
    today = today.minus({ days: 1 });
  }
  const startOfSeason = DateTime.fromISO("2023-09-05", { zone: "UTC" });
  const daysSinceStart = today.diff(startOfSeason, "days").days;
  return Math.floor(daysSinceStart / 7) + 1;
};
