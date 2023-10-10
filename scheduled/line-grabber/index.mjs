import arc from "@architect/functions";
import fetch from "node-fetch";
import { DateTime } from "luxon";

async function fetchGameLinesFromVegasAPI() {
  const response = await fetch(
    "https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=e58eb82afa5b0c9444b013c1afbf0a4d&bookmakers=draftkings&markets=spreads&oddsFormat=american",
  );
  const data = await response.json();
  const db = await arc.tables();

  for (const game of data) {
    if (game.commence_time < Date.now()) continue;
    const week = getNFLWeek(
      DateTime.fromISO(game.commence_time, { zone: "UTC" }),
    );
    const thisGame = {
      id: game.id,
      week: week.toString(),
      team1: game.home_team,
      team2: game.away_team,
      team1Url: getTeamLogoURL(game.home_team),
      team2Url: getTeamLogoURL(game.away_team),
      date: formatDate(game.commence_time),
    };

    if (game.bookmakers[0]?.markets[0]?.outcomes[0]?.name === game.home_team) {
      thisGame.team1Spread = game.bookmakers[0]?.markets[0]?.outcomes[0]?.point;
      thisGame.team2Spread = game.bookmakers[0]?.markets[0]?.outcomes[1]?.point;
    } else {
      thisGame.team1Spread = game.bookmakers[0]?.markets[0]?.outcomes[1]?.point;
      thisGame.team2Spread = game.bookmakers[0]?.markets[0]?.outcomes[0]?.point;
    }

    await db.game.put(thisGame);
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

const formatDate = (dateObj) => {
  const centralTime = DateTime.fromISO(dateObj, { zone: "UTC" }).setZone(
    "America/Chicago",
  );

  const dayName = centralTime.toFormat("EEEE");
  const hours = centralTime.toFormat("h");
  const minutes = centralTime.toFormat("mm");
  const period = centralTime.toFormat("a");

  return `${dayName} @ ${hours}:${minutes}${period}`;
};

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
