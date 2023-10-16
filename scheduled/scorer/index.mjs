import arc from "@architect/functions";
import { DateTime } from "luxon";

async function updateUserProfit(userId, profit) {
  const table = await arc.tables();
  const user = await table.user.get({ id: userId });
  if (!user) throw new Error(`User with id ${userId} not found.`);

  console.log(`Adding ${profit} profit to user ${userId}`);
  user.totalProfit += profit;
  await table.users.put(user);
}

async function scoreBetsForWeek(week) {
  const table = await arc.tables();

  const weekBets = await table.bet.query({
    IndexName: "byWeek",
    KeyConditionExpression: "sk = :weekVal",
    ExpressionAttributeValues: {
      ":weekVal": week.toString(),
    },
  });

  for (const bet of weekBets.Items) {
    let totalProfit = 0;

    for (const betSlipItem of bet.betSlip) {
      const gameDetails = await table.game.get({
        id: betSlipItem.gameId,
        week: bet.week,
      });

      if (gameDetails && gameDetails.winner !== 0) {
        if (gameDetails.winner === betSlipItem.teamId) {
          totalProfit += betSlipItem.units;
        }
        else {
          totalProfit -= betSlipItem.units;
        }
      }
    }

    // Update individual bet's profit and mark it as scored
    bet.profit = totalProfit;
    bet.scoringComplete = true;
    await table.bets.put(bet);

    // Update the user's total profit
    await updateUserProfit(bet.userId, totalProfit);
  }
}

export async function handler(event) {
  try {
    const currentWeek = event.week || getLastNFLWeek();
    await scoreBetsForWeek(currentWeek);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Bets and user profits updated successfully.",
      }),
    };
  } catch (error) {
    console.error("Error scoring bets:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to score bets." }),
    };
  }
}

const getLastNFLWeek = (today = DateTime.utc()) => {
  if (today.weekday === 2 && today.hour < 5) {
    today = today.minus({ days: 1 });
  }
  const startOfSeason = DateTime.fromISO("2023-09-05", { zone: "UTC" });
  const daysSinceStart = today.diff(startOfSeason, "days").days;
  return Math.floor(daysSinceStart / 7);
};
