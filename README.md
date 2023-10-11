# Wager Wire

### To do
- Get rid of PK/SK shit - also, in bets.week.tsx, in the navigate function, use the bet object's week, not the local getNFLWeek function
- Edit display name and password
- Grab game results -- add to game object
- Scoring lambda -- things to consider -- individual bets (result: win/loss/null) AND the whole slip (profit, scoringComplete) gets scored (run a few times per day on the weekend), only score for that weeks' games -- once scoring is complete for a game, update user's profile
- Standardize timing for frontend
- games lock at individual times
- "more team data" on wager page
- document