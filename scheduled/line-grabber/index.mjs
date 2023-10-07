import arc from "@architect/functions";
import fetch from "node-fetch";

async function fetchGameLinesFromVegasAPI() {
  const response = await fetch(
    "https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=e58eb82afa5b0c9444b013c1afbf0a4d&bookmakers=draftkings&markets=spreads&oddsFormat=american",
  );
  const data = await response.json();
  const db = await arc.tables();

  for (const game of data) {
    const week = getNFLWeek(new Date(game.commence_time));
    if(game.commence_time < Date.now()) continue;
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

    console.log(thisGame);
    await db.game.put(thisGame);
  }

}

fetchGameLinesFromVegasAPI();

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
  const centralTime = new Date(
    dateObj.toLocaleString("en-US", { timeZone: "America/Chicago" }),
  );

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = days[centralTime.getDay()];
  let hours = centralTime.getHours();
  let minutes = centralTime.getMinutes();

  let period = "am";
  if (hours >= 12) {
    period = "pm";
    if (hours > 12) hours -= 12;
  }
  if (hours === 0) hours = 12;
  if (minutes < 10) minutes = "0" + minutes;

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

const getNFLWeek = (today = new Date()) => {
  const daysSinceStart =
    (today.valueOf() - new Date("2023-09-05").valueOf()) / 1000 / 60 / 60 / 24;
  return Math.floor(daysSinceStart / 7) + 1;
};
