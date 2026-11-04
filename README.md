LEADERBOARD + PLAYER STATS PAGE DOCUMENTATION

LEADERBAORD:
<img width="1321" height="567" alt="image" src="https://github.com/user-attachments/assets/1c49dc8f-9512-4019-8f44-fb5838808aaa" />
PLAYER STATS PAGE: 
<img width="740" height="607" alt="image" src="https://github.com/user-attachments/assets/7c329f7c-3753-4150-8178-02effe32c202" />

The leaderboard displays the rank of users, their usernames, total wins, and total guesses. It also displays the current number of players that are playing. The playerstats page displays those same statistics with the addition of total games and a win rate. These statistics are stored in Firestore and uses Realtime Database to keep track of user sessions. Users should be able to view the leaderboard in play page with live updated statistics and the navigate to their own personal statistics page. 

COMPONENTS:
- Leaderboard.tsx - responsible for displaying player stats on play page 
- PlayerSession.tsx - tracks active player connections using Realtime Database
- personalstats/page.tsx - displays users' personal stats on separate page

FUNCTIONS:
- initializePlayer() - create Firestore statistics document for new players (when they enter play)
- savePlayerGuess() - update guesses, wins, and total games using Firestore
- onSnapshot() - automatically update leaderboard through Firestore DB changes
- saveWord() - generate new round ID when a new word is saved
- sort() - ranks players on the leaderboard based on wins

DATABASE COLLECTIONS:
- playerStats - information on each player's stats
- game - new field "uniquegameID"






