# Mayhem Stats

## Brief Description

This is a [react native](https://reactnative.dev/) application for my Ultimate Frisbee team to manage our games' stats and players attendance.

---

## Backend

The backend for this app is a [Node.js](https://nodejs.org/en/) server that uses [Express](https://expressjs.com/) for routing and [SQL](https://www.mysql.com/) for the database. The server is hosted on [Render](https://render.com/) and the database is hosted on [alwaysdata](https://www.alwaysdata.com/en/).

---

## App Preview

Table of Contents

- [Login](#login)
- [Main Menu](#main-menu)
- [View Games](#view-games)
- [Game Home](#game-home)
  - [Start / Continue Recording](#start-/-continue-recording)
  - [Game Events](#game-events)
  - [Game Stats](#game-stats)
  - [Game Player Stats](#game-player-stats)
- [Overall Stats](#overall-stats)
- [Player Stats](#player-stats)
- [Team Stats](#team-stats)
  - [Line Builder](#line-builder)
- [Attendance](#attendance)
  - [Players Attendance](#players-attendance)

---

### Login

This is a simple login screen where each player in the team can enter their email and password which are assigned with the addition of each player to the team.

<img src="https://i.ibb.co/KXrDr9j/Home.jpg" alt="Login Screen" width="250"/>

---

### Main Menu

This is the screen from which you can navigate to the different screens of the app.

<img src="https://i.ibb.co/vBVhsHj/Main-Menu.jpg" alt="Login Screen" width="250"/>

---

### View Games

This is the screen where you can view all the games that have been played by the team and have been downloaded or are available locally on the device. You also get the option to download that have been uploaded from another device. This is done so that any player from the team can create a game and keep its stats and then upload it to the database so that the rest of the team can download it and view it on their devices.

<img src="https://i.ibb.co/bJQSL40/View-Games.jpg" alt="View Games" width="250"/>

If you click on the download games button the following screen will show up with a list of all the games that have been uploaded to the database. Moreover, the games that have already been downloaded will be marked with a small green dot on the top right corner while games that have not been downloaded will be marked with a red dot.

<img src="https://i.ibb.co/P6t4G0c/Download-Games.jpg" alt="Download Games" width="250"/>

---

### Game Home

This is the screen where you can see basic information about the game such as the date, the opponent team, the score, and the tournament in which it was played. If there is still no actions for the game, you also get to choose whether you start on offence or defence. In this screen you can also upload the game once you have finished recording its actions using the button on the top right. Moreover, from this screen you can navigate to different screens to:

- Start or continue recording game actions
- View the game events (actions done since the beggining of the game throw by throw)
- View the game stats (stats for each player in the team)
- View player stats (summary of stats for each player in the team)

<img src="https://i.ibb.co/t8VTT4s/Game-Home.jpg" alt="Game Home" width="250"/>

### Start / Continue Recording

In this screen you start recording the actions of the game actions or continue recording them if you have already started. If you are still starting to record a small screen will pop up prompting you to choose the players on the field. If you are continuing recording you will be taken directly to the recording screen with the players who were on the field during the last point. If there was a change in players you can always click on the edit button on the top right corner to change the players on the field.

When you start recording you will see a different layout for the screen on defence and on offence. On defense each player can either get block (Defense) or a Callahan and the opposing team can either score or make a throwaway. On offence each player can either score or make a throwaway. On offence each player can:

- Drop the disc from a thrower
- Catch the disc from a thrower
- Make a deep catch (added to distinguish from a normal catch to be attributed to the thrower)
- Score a point
- Make a throwaway

Choosing the starting line:

<img src="https://i.ibb.co/GnMQycR/Subs.jpg" alt="Recording" width="250"/>

Recording screen on defence:

<img src="https://i.ibb.co/HDGHR7C/Recording.jpg" alt="Subs" width="250"/>

Recording screen on offence:

<img src="https://i.ibb.co/8YFM1XW/Record-Offence.jpg" alt="Recording" width="250"/>

### Game Events

This is the screen where you can see all the actions that have been recorded since the beggining of the game. You can also see the score of the game at the end of each point.

<img src="https://i.ibb.co/fYRnXrB/Game-Events.jpg" alt="Game Events" width="250"/>

<h2 id="gamestats"></h2>

### Game Stats

In this screen you can see basic stats for each player in the team which are calculated based on the actions that have been recorded. These stats include:

- The total plus/minus for each player (each positive contribution such as a score or a block is counted as a plus while each negative contribution such as a throwaway or a drop is counted as a minus)
- The total number of points played by each player
- The total number of points scored by each player
- And many others as well

<img src="https://i.postimg.cc/Ghq2wHNK/Stats.png" alt="Game Stats" width="250"/>

Player images have been blacked out for privacy.

### Game Player Stats

In this screen you can see a summary of the stats for each player in the team. These stats include:

- Percentage contribution in game (number of passes or catches / total number of throws in game)
- Catching accuracy (number of catches / number of catches + number of drops)
- Throwing accuracy (number of passes / number of passes + number of throwaways)
- Who each player threw to in the game
- Who each player caught from in the game
- Who each player dropped the disc from in the game
- Who each player dropped their throw in the game

<img src="https://i.postimg.cc/nzKGk4zp/Player-stats.jpg" alt="Player Stats" width="250"/>

---

### Overall Stats

This screen is identical to the [Game Stats](#game-stats) screen but instead of showing stats for a single game it shows stats for all the games that have been downloaded or are available locally on the device. There is one difference which is you can filter the games for which you want to see the combined stats. You can filter by tournament or by selecting individual games.

<img src="https://i.postimg.cc/c4JLMf4W/filter.jpg" alt="Overall Stats" width="250" id="filter"/>

---

### Player Stats

This screen is identical to the [Player Stats](#game-player-stats) screen but instead of showing stats for a single game it shows stats for all the games that have been downloaded or are available locally on the device. Similar to the overall stats the difference between them is you can filter the games for which you want to see the combined stats. You can filter by tournament or by selecting individual games using the same filter as [this](#filter) photo above.

---

### Team Stats

This screen screen shows statistics for the team as a whole. These stats include:

- Offensive efficiency (number of points scored when starting on offence / number of points played when starting on offence)
- Defensive efficiency (number of points scored when starting on defence / number of points played when starting on defence)
- Number of passes when we scored
- Number of passes when we lost the point

These stats are calculated based on all games by default, but the same filter as [this](#filter) photo above can be used to filter the games for which you want to see the combined stats. Finally, at the bottom of the screen there is a button that leads to the [Line Builder](#line-builder) screen.

<img src="https://i.postimg.cc/Xv2r0xvs/Team-Stats.jpg" alt="Team Stats" width="250"/>

---

### Line Builder

The line builder lets you compare the stats of different lines. You need to choose players on two different lines (at least one player on each line). Then you can see the line's offence and defence efficiency.

<img src="https://i.postimg.cc/W4KJkXPh/line-builder.jpg" alt="Line Builder" width="200"/>

---

### Attendance

This screen lists the team practices. For each practice you can see the date and how many players attended. You can also add a new practice and start recording attendance for it. You can click the players button to take you to the [Players Attendance](#players-attendance) screen where you can see the attendance for each player.

<img src="https://i.postimg.cc/bvJSF4R6/main-attendance.jpg" alt="Attendance" width="250"/>

All Practices

<img src="https://i.postimg.cc/dtYkKhBZ/new-practice.jpg" alt="Attendance" width="250"/>

Clicking on a practice or adding a new practice will show the attendance for that practice.

---

### Players Attendance

This screen shows the attendance for each player. You can see the number of practices attended. Also clicking on a player will show you the practices that they attended and missed and their dates.

<img src="https://i.postimg.cc/d0yw1BQs/all-attendance.jpg" alt="Attendance" width="250"/>

All players

<img src="https://i.postimg.cc/mDWRFHhQ/player-attendance.jpg" alt="Attendance" width="250"/>

Clicking on a player will show the attendance for that player.
