import { StatusBar } from "expo-status-bar";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import MyButton from "../components/MyButton";
import React, { useEffect, useRef, useState } from "react";
import Modal from "react-native-modal";
import axios from "axios";
import * as SQLite from "expo-sqlite";
import { ScrollView } from "react-native-gesture-handler";
import address from "../config.js";
const ip = address.ip;

// CHANGETHIS
let mayhemLogo = require("../assets/logo.png");
let allImages = {
  supernova: require("../assets/Teams/supernova.png"),
  thunder: require("../assets/Teams/thunder.png"),
  alex: require("../assets/Teams/alex.png"),
  natives: require("../assets/Teams/natives.png"),
  zayed: require("../assets/Teams/zayed.png"),
  airbenders: require("../assets/Teams/airbenders.png"),
  pharos: require("../assets/Teams/pharos.png"),
  mudd: require("../assets/Teams/mudd.png"),
  "kuwait raptors": require("../assets/Teams/kuwait.png"),
  any: require("../assets/Teams/anyOpponent.png"),
};
let allActionImages = {
  Catch: require("../assets/actions/catch.png"),
  Deep: require("../assets/actions/deep.png"),
  Defence: require("../assets/actions/defense.png"),
  Drop: require("../assets/actions/drop.png"),
  Score: require("../assets/actions/score.png"),
  Throwaway: require("../assets/actions/throwaway.png"),
  "They Score": require("../assets/actions/their_goal.png"),
  "Their Throwaway": require("../assets/actions/their_throwaway.png"),
  Callahan: require("../assets/actions/score.png"),
};
var myImage;

const RecordGame = ({ route, navigation }) => {
  let opponent = route.params.opponent;
  let gameTimestamp = route.params.timestamp;
  let pointCap = route.params.pointCap;
  let halfTime = parseInt(pointCap/ 2) + 1;
  const db = SQLite.openDatabase("game.db");
  const [isModalVisible, setModalVisible] = useState(false);
  const [playersOnCourt, setPlayersOnCourt] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [playersOnCourtText, setPlayersOnCourtText] = useState(
    playersOnCourt.map((player) => {
      if (player !== "") {
        return player;
      } else {
        return "open";
      }
    })
  );
  const [onModalOpenPlayersOnCourt, setOnModalOpenPlayersOnCourt] = useState(
    []
  );
  const [onModalOpenPlayersOnBench, setOnModalOpenPlayersOnBench] = useState(
    []
  );
  const [onOffense, setOnOffense] = useState(true);
  const [myScore, setMyScore] = useState(0);
  const [theirScore, setTheirScore] = useState(0);

  const previousAction = useRef([]);
  const beforePreviousAction = useRef([]);
  const [previousActionState, setPreviousActionState] = useState([]);
  const [beforePreviousActionState, setBeforePreviousActionState] = useState(
    []
  );
  const [playerInPossession, setPlayerInPossession] = useState(-1);
  const allActionsPerformed = useRef([]);
  const [heightPlayers, setHeightPlayers] = useState(0);
  const [disableAllButtons, setDisableAllButtons] = useState(false);
  const allPlayers = useRef([]);
  // const [allPlayers, setAllPlayers] = useState([]);
  const [playersOnBench, setPlayersOnBench] = useState([]);

  const [playerPointsPlayed, setPlayerPointsPlayed] = useState([]);

  const unSelectPlayer = async (index) => {
    let newPlayersOnCourt = playersOnCourt.map((player) => {
      return player;
    });

    let player = newPlayersOnCourt[index];
    if (player === "") {
      return;
    }

    // see if player performed any actions

    let actions = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "select * from actionPerformed where playerName = ? and gameTimestamp = ? and opponent = ? and point = ?",
          [
            player,
            route.params.timestamp,
            route.params.opponent,
            myScore + theirScore + 1,
          ],
          (_, { rows: { _array } }) => {
            resolve(_array);
            return _array;
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });

    actions = actions.filter((action) => {
      return action.action !== "In Point";
    });
    if (actions.length > 1) {
      console.log("player performed actions");
      return;
    }

    newPlayersOnCourt[index] = "";
    setPlayersOnCourt(newPlayersOnCourt);
    setPlayersOnCourtText(
      newPlayersOnCourt.map((player) => {
        if (player !== "") {
          return player;
        } else {
          return "open";
        }
      })
    );
    setPlayersOnBench((players) => [...players, player]);

    let newPlayerPointsPlayed = playerPointsPlayed;
    newPlayerPointsPlayed[player] -= 1;
    setPlayerPointsPlayed(newPlayerPointsPlayed);

    // delete from db that player is in point
    new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "delete from actionPerformed where playerName = ? and gameTimestamp = ? and opponent = ? and action = ? and point = ?",
          [
            player,
            route.params.timestamp,
            route.params.opponent,
            "In Point",
            myScore + theirScore + 1,
          ],
          (_, { rows: { _array } }) => {
            resolve(_array);
            // console.log(_array);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  };

  function endGame() {
    setDisableAllButtons(true);
  }

  const choosePlayer = (player) => {
    // console.log(player);
    let index = playersOnCourt.indexOf("");
    if (index === -1) {
      return;
    }
    let newPlayersOnCourt = playersOnCourt.map((player) => {
      return player;
    });
    newPlayersOnCourt[index] = player;

    let newPlayerPointsPlayed = playerPointsPlayed;
    newPlayerPointsPlayed[player] += 1;
    setPlayerPointsPlayed(newPlayerPointsPlayed);

    setPlayersOnCourt(newPlayersOnCourt);
    // console.log(onModalOpenPlayersOnCourt);
    // console.log(playersOnCourt);

    setPlayersOnCourtText(
      newPlayersOnCourt.map((player) => {
        if (player !== "") {
          return player;
        } else {
          return "open";
        }
      })
    );
    setPlayersOnBench(
      playersOnBench.filter((playerOnBench) => {
        return playerOnBench !== player;
      })
    );
    // write to db that player is in point
    // console.log("timestamp: " + route.params.timestamp);
    new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "insert into actionPerformed (playerName, gameTimestamp, opponent, action, point, offence) values (?, ?, ?, ?, ?, ?)",
          [
            player,
            route.params.timestamp,
            route.params.opponent,
            "In Point",
            myScore + theirScore + 1,
            onOffense ? 1 : 0,
          ],
          (_, { rows: { _array } }) => {
            resolve(_array);
            // console.log(_array);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  };

  function onCourtBackgroundColors(player) {
    if (player !== "open") {
      return "#119fb8";
    } else {
      return "#ffffff";
    }
  }

  function onCourtTextColors(player) {
    if (player !== "open") {
      return "#ffffff";
    } else {
      return "red";
    }
  }

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  async function getAllPlayers() {
    // use mysql to get all players

    let localPlayers = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "select * from player",
          [],
          (_, { rows: { _array } }) => {
            resolve(_array);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });

    // add players on mysql to local storage
    let localPlayerNames = localPlayers.map((player) => {
      return player.name;
    });

    allPlayers.current = localPlayerNames;
    // await setAllPlayers(playerNames);
    setPlayersOnBench(
      localPlayerNames.filter((player) => {
        return !playersOnCourt.includes(player);
      })
    );

    // axios({
    //   method: "get",
    //   url: ip + "/players",
    // })
    //   .then(async function (response) {
    //     let players = response.data;
    //     if (players !== undefined) {
    //       let playerNames = players.map((player) => {
    //         return player.name;
    //       });
    //       let newPlayers = [];
    //       let dirty = false;
    //       for (let i = 0; i < playerNames.length; i++) {
    //         if (!localPlayerNames.includes(playerNames[i])) {
    //           {
    //             newPlayers.push(players[i]);
    //             dirty = true;
    //           }
    //         }
    //       }

    //       // create values string
    //       if (dirty) {
    //         let values = "";
    //         for (let i = 0; i < newPlayers.length - 1; i++) {
    //           values +=
    //             "('" +
    //             newPlayers[i].name +
    //             "', '" +
    //             newPlayers[i].email +
    //             "', '" +
    //             newPlayers[i].major +
    //             "', '" +
    //             newPlayers[i].number +
    //             "', '" +
    //             newPlayers[i].phone +
    //             "'),";
    //         }

    //         values +=
    //           "('" +
    //           newPlayers[newPlayers.length - 1].name +
    //           "', '" +
    //           newPlayers[newPlayers.length - 1].email +
    //           "', '" +
    //           newPlayers[newPlayers.length - 1].major +
    //           "', '" +
    //           newPlayers[newPlayers.length - 1].number +
    //           "', '" +
    //           newPlayers[newPlayers.length - 1].phone +
    //           "')";

    //         // add new players to local storage
    //         // console.log(values);
    //         await new Promise((resolve, reject) => {
    //           db.transaction((tx) => {
    //             tx.executeSql(
    //               "insert into player (name, email, major, number, phone) values " +
    //                 values,
    //               [],
    //               (_, { rows: { _array } }) => {
    //                 resolve(_array);
    //               },
    //               (_, error) => {
    //                 reject(error);
    //               }
    //             );
    //           });
    //         });
    //       }

    //       // see if a player is deleted on mysql
    //       let deletedPlayers = [];
    //       for (let i = 0; i < localPlayerNames.length; i++) {
    //         if (!playerNames.includes(localPlayerNames[i])) {
    //           deletedPlayers.push(localPlayerNames[i]);
    //         }
    //       }

    //       // delete players on local storage
    //       if (deletedPlayers.length > 0) {
    //         let values = "";
    //         let deleteQuery = "delete from player where name in (";
    //         for (let i = 0; i < deletedPlayers.length - 1; i++) {
    //           values += "'" + deletedPlayers[i] + "',";
    //         }
    //         values += "'" + deletedPlayers[deletedPlayers.length - 1] + "')";
    //         deleteQuery += values;
    //         // console.log(deleteQuery);
    //         await new Promise((resolve, reject) => {
    //           db.transaction((tx) => {
    //             tx.executeSql(
    //               deleteQuery,
    //               [],
    //               (_, { rows: { _array } }) => {
    //                 resolve(_array);
    //               },
    //               (_, error) => {
    //                 reject(error);
    //               }
    //             );
    //           });
    //         });
    //       }
    //     }

    //     return response.data;
    //   })
    //   .catch(function (error) {
    //     // console.log(error);
    //   });

    // console.log(players);

    // if (localPlayerNames.length === playerNames.length) {
    //   console.log("no new players");
    // }

    // new Promise((resolve, reject) => {
    //   db.transaction((tx) => {
    //     tx.executeSql(
    //       "select * from actionPerformed where gameTimestamp = ? and opponent = ? and point >= 0",
    //       [route.params.timestamp, route.params.opponent],
    //       (_, { rows: { _array } }) => {
    //         resolve(_array);
    //         // console.log(_array);
    //       },
    //       (_, error) => {
    //         reject(error);
    //       }
    //     );
    //   });
    // });

    checkActionsPerformed();
  }

  async function checkActionsPerformed() {
    let actionsPerformed = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        // console.log(route.params.timestamp, route.params.opponent);
        tx.executeSql(
          "select * from actionPerformed where gameTimestamp = ? and opponent = ?",
          [route.params.timestamp, route.params.opponent],
          (_, { rows: { _array } }) => {
            resolve(_array);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });

    // console.log(actionsPerformed);
    let playersPointsPlayed = {};
    for (let i = 0; i < allPlayers.current.length; i++) {
      playersPointsPlayed[allPlayers.current[i]] = 0;
    }

    if (actionsPerformed.length > 0) {
      setModalVisible(false);
      // get only actions where action = 'Score' or 'They Score'
      let scoringActions = actionsPerformed.filter((action) => {
        return (
          action.action === "Score" ||
          action.action === "They Score" ||
          action.action === "Callahan"
        );
      });
      var mypoints = 0;
      var theirpoints = 0;
      let x = Boolean(route.params.startOffence);

      for (let i = 0; i < scoringActions.length; i++) {
        if (
          scoringActions[i].action === "Score" ||
          scoringActions[i].action === "Callahan"
        ) {
          mypoints++;
          if (mypoints === halfTime) {
            x = !Boolean(route.params.startOffence);
          } else {
            x = false;
          }
        } else {
          theirpoints++;
          if (theirpoints === halfTime) {
            x = !Boolean(route.params.startOffence);
          } else {
            x = true;
          }
        }
      }
      setMyScore(mypoints);
      setTheirScore(theirpoints);

      // get players in Court in the last point
      let lastPointPlayers = actionsPerformed.filter((action) => {
        return (
          action.point === mypoints + theirpoints + 1 &&
          action.action === "In Point"
        );
      });
      if (mypoints === pointCap || theirpoints === pointCap) {
        lastPointPlayers = actionsPerformed.filter((action) => {
          return (
            action.point === mypoints + theirpoints &&
            action.action === "In Point"
          );
        });
        endGame();
      }

      // get players on bench and players in court

      // let inCourt = playersOnCourt.map((player) => {
      //   return player;
      // });

      let aplayers = allPlayers.current;

      let onBench2 = aplayers.filter((player) => {
        var flag = false;
        for (let i = 0; i < lastPointPlayers.length; i++) {
          if (player === lastPointPlayers[i].playerName) {
            flag = true;
          }
        }
        return !flag;
      });

      // players on court are the ones that are not on bench
      let inCourt = lastPointPlayers.map((player) => {
        return player.playerName;
      });
      // console.log("onCourt", inCourt);

      while (inCourt.length < 7) {
        inCourt.push("");
      }

      setPlayersOnCourtText(
        inCourt.map((player) => {
          if (player !== "") {
            return player;
          } else {
            return "open";
          }
        })
      );
      // console.log("onBench2", onBench2);
      setPlayersOnBench(onBench2);
      setPlayersOnCourt(inCourt);
      if (lastPointPlayers.length === 0) {
        setModalVisible(true);
      }

      // go over all actions and add them to array of actions
      let actions = [];

      for (let i = 0; i < actionsPerformed.length; i++) {
        let action = actionsPerformed[i];
        if (action.action === "Score") {
          actions.push({
            action: "Score",
            player: action.playerName,
            point: action.point,
            associatedPlayer: action.associatedPlayer,
          });
        } else if (action.action === "They Score") {
          actions.push({
            action: "They Score",
            player: null,
            point: action.point,
            associatedPlayer: null,
          });
        } else if (action.action === "Their Throwaway") {
          actions.push({
            action: "Their Throwaway",
            player: null,
            point: action.point,
            associatedPlayer: null,
          });
        } else if (action.action === "Catch") {
          actions.push({
            action: "Catch",
            player: action.playerName,
            point: action.point,
            associatedPlayer: action.associatedPlayer,
          });
        } else if (action.action === "Throwaway") {
          actions.push({
            action: "Throwaway",
            player: action.playerName,
            point: action.point,
            associatedPlayer: null,
          });
        } else if (action.action === "Defence") {
          actions.push({
            action: "Defence",
            player: action.playerName,
            point: action.point,
            associatedPlayer: null,
          });
        } else if (action.action === "Deep") {
          actions.push({
            action: "Deep",
            player: action.playerName,
            point: action.point,
            associatedPlayer: action.associatedPlayer,
          });
        } else if (action.action === "Drop") {
          actions.push({
            action: "Drop",
            player: action.playerName,
            point: action.point,
            associatedPlayer: action.associatedPlayer,
          });
        } else if (action.action === "Stalled") {
          actions.push({
            action: "Stalled",
            player: action.playerName,
            point: action.point,
            associatedPlayer: null,
          });
        } else if (action.action === "Subbed In") {
          actions.push({
            action: "Subbed In",
            player: action.playerName,
            point: action.point,
            associatedPlayer: action.associatedPlayer,
          });
          playersPointsPlayed[action.playerName] += 1;
        } else if (action.action === "Callahan") {
          actions.push({
            action: "Callahan",
            player: action.playerName,
            point: action.point,
            associatedPlayer: null,
          });
        } else if (action.action === "Callahan'd") {
          actions.push({
            action: "Callahan'd",
            player: action.playerName,
            point: action.point,
            associatedPlayer: null,
          });
        } else if (action.action === "In Point") {
          playersPointsPlayed[action.playerName] += 1;
        }
      }
      allActionsPerformed.current = actions;
      if (actions.length === 1) {
        previousAction.current = actions[actions.length - 1];
        setPreviousActionState(actions[actions.length - 1]);
      }
      if (actions.length > 1) {
        previousAction.current = actions[actions.length - 1];
        setPreviousActionState(actions[actions.length - 1]);
        beforePreviousAction.current = actions[actions.length - 2];
        setBeforePreviousActionState(actions[actions.length - 2]);
      }
      setPlayerPointsPlayed(playersPointsPlayed);

      // get all actions in the current point
      let currentPointActions = actions.filter((action) => {
        return action.point === mypoints + theirpoints + 1;
      });

      for (let i = 0; i < currentPointActions.length; i++) {
        let action = currentPointActions[i];
        if (action.action === "Their Throwaway") {
          x = !x;
        } else if (action.action === "Throwaway") {
          x = !x;
        } else if (action.action === "Defence") {
          x = !x;
        } else if (action.action === "Drop") {
          x = !x;
        } else if (action.action === "Stalled") {
          x = !x;
        }
      }

      setOnOffense(x);

      if (currentPointActions.length >= 1 && x === true) {
        // console.log("actions", currentPointActions);
        // console.log(
        //   "player",
        //   inCourt.indexOf(
        //     currentPointActions[currentPointActions.length - 1].player
        //   )
        // );
        setPlayerInPossession(
          inCourt.indexOf(
            currentPointActions[currentPointActions.length - 1].player
          )
          // console.log("playerInPossession", playerInPossession)
        );
      }
    } else {
      setModalVisible(true);
      let x = Boolean(route.params.startOffence);
      // console.log(route.params.startOffence);
      // console.log("start", x);
      setOnOffense(x);
      setPlayerPointsPlayed(playersPointsPlayed);
    }
  }

  useEffect(() => {
    getAllPlayers();
    // setOnOffense(route.params.startOffence);
    // check if there are any actionsPerformed for this game
    // if there are, then close the modal
    // if there are not, then open the modal

    // console.log("useEffect");
    let opponentLower = opponent.toLowerCase();
    myImage =
      opponentLower in allImages ? allImages[opponentLower] : allImages["any"];
  }, []);

  // initialize empty array of 7 elements

  let heightBench =
    53 * (playersOnBench.length / 4) + 30 > 260
      ? 260
      : 53 * (playersOnBench.length / 4) + 30;

  function onModalShow() {
    let x = playersOnCourt;
    // console.log(x);
    setOnModalOpenPlayersOnCourt(x);
    setOnModalOpenPlayersOnBench(playersOnBench);
  }

  function cancelModal() {
    // console.log(onModalOpenPlayersOnCourt);
    setPlayersOnCourt(onModalOpenPlayersOnCourt);
    setPlayersOnBench(onModalOpenPlayersOnBench);
    setPlayersOnCourtText(
      onModalOpenPlayersOnCourt.map((player) => {
        if (player !== "") {
          return player;
        } else {
          return "open";
        }
      })
    );
    setModalVisible(false);
  }

  function onFieldText() {
    let x = playersOnCourt.map((player) => {
      return player;
    });
    let text = "";
    text = "On Field: ";
    for (let i = 0; i < x.length; i++) {
      if (x[i] !== "") {
        text += x[i] + ", ";
      }
    }
    text = text.substring(0, text.length - 2);
    return text;
  }

  function addSameLine(point, offence) {
    let x = playersOnCourt.map((player) => {
      return player;
    });

    for (let i = 0; i < x.length; i++) {
      // insert into local storage that all players on court are 'In Point'
      if (x[i] !== "") {
        let playerName = x[i];
        let action = "In Point";
        let insertQuery =
          "insert into actionPerformed (opponent, gameTimestamp, playerName, action, point, offence) values (?,?,?,?,?,?)";
        let values = [
          opponent,
          route.params.timestamp,
          playerName,
          action,
          point,
          offence,
        ];
        db.transaction((tx) => {
          tx.executeSql(
            insertQuery,
            values,
            (tx, results) => {
              // console.log(results);
            },
            (tx, error) => {
              console.log(error);
            }
          );
        });
        let newPlayerPointsPlayed = playerPointsPlayed;
        newPlayerPointsPlayed[x[i]] = newPlayerPointsPlayed[x[i]] + 1;
        setPlayerPointsPlayed(newPlayerPointsPlayed);
      }
    }
  }

  function playerDropped(index) {
    var playerName;
    if (index === 7) {
      playerName = null;
    } else {
      playerName = playersOnCourt[index];
    }

    // insert into local storage actionPerformed table where action = 'Drop' and player = playerName and gameTimestamp = gameTimestamp and opponent = opponent and point = myScore + theirScore + 1 and associatedPlayer = playerInPossession
    let mys = myScore;
    let theirs = theirScore;
    let point = mys + theirs + 1;
    let action = "Drop";
    var associatedPlayer;
    if (playerInPossession === 7) {
      associatedPlayer = null;
    } else {
      associatedPlayer = playersOnCourt[playerInPossession];
    }

    let insertQuery =
      "insert into actionPerformed (opponent, gameTimestamp, playerName, action, point, associatedPlayer) values (?,?,?,?,?,?)";
    let values = [
      opponent,
      route.params.timestamp,
      playerName,
      action,
      point,
      associatedPlayer,
    ];

    db.transaction((tx) => {
      tx.executeSql(
        insertQuery,
        values,
        (_, { rows: { _array } }) => {
          // console.log(_array);
        },
        (_, error) => {
          console.log(error);
        }
      );
    });

    setOnOffense(!onOffense);

    beforePreviousAction.current = previousAction.current;
    setBeforePreviousActionState(previousAction.current);
    allActionsPerformed.current.push({
      action: "Drop",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    });
    previousAction.current = {
      action: "Drop",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    };
    setPreviousActionState(previousAction.current);
    setPlayerInPossession(-1);
  }

  function playerCatched(index) {
    var playerName;
    if (index === 7) {
      playerName = null;
    } else {
      playerName = playersOnCourt[index];
    }
    let mys = myScore;
    let theirs = theirScore;
    let point = mys + theirs + 1;
    let action = "Catch";
    var associatedPlayer;
    if (playerInPossession === 7) {
      associatedPlayer = null;
    } else {
      associatedPlayer = playersOnCourt[playerInPossession];
    }

    let insertQuery =
      "insert into actionPerformed (opponent, gameTimestamp, playerName, action, point, associatedPlayer) values (?,?,?,?,?,?)";
    let values = [
      opponent,
      route.params.timestamp,
      playerName,
      action,
      point,
      associatedPlayer,
    ];

    db.transaction((tx) => {
      tx.executeSql(
        insertQuery,
        values,
        (_, { rows: { _array } }) => {
          // console.log(_array);
        },
        (_, error) => {
          console.log(error);
        }
      );
    });

    beforePreviousAction.current = previousAction.current;
    setBeforePreviousActionState(previousAction.current);
    allActionsPerformed.current.push({
      action: "Catch",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    });
    previousAction.current = {
      action: "Catch",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    };
    setPreviousActionState(previousAction.current);
    setPlayerInPossession(index);
  }

  function playerScored(index) {
    var playerName;
    if (index === 7) {
      playerName = null;
    } else {
      playerName = playersOnCourt[index];
    }
    let mys = myScore;
    let theirs = theirScore;
    let point = mys + theirs + 1;
    let action = "Score";
    var associatedPlayer;
    if (playerInPossession === 7) {
      associatedPlayer = null;
    } else {
      associatedPlayer = playersOnCourt[playerInPossession];
    }

    let insertQuery =
      "insert into actionPerformed (opponent, gameTimestamp, playerName, action, point, associatedPlayer) values (?,?,?,?,?,?)";
    let values = [
      opponent,
      route.params.timestamp,
      playerName,
      action,
      point,
      associatedPlayer,
    ];

    db.transaction((tx) => {
      tx.executeSql(
        insertQuery,
        values,
        (_, { rows: { _array } }) => {
          // console.log(_array);
        },
        (_, error) => {
          console.log(error);
        }
      );
    });

    beforePreviousAction.current = previousAction.current;
    setBeforePreviousActionState(previousAction.current);
    allActionsPerformed.current.push({
      action: "Score",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    });
    previousAction.current = {
      action: "Score",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    };
    setPreviousActionState(previousAction.current);
    setPlayerInPossession(-1);
    let updateQuery =
      "update game set myScore = ? where timestamp = ? and opponent = ?";
    let updateValues = [myScore + 1, route.params.timestamp, opponent];
    db.transaction((tx) => {
      tx.executeSql(
        updateQuery,
        updateValues,
        (_, { rows: { _array } }) => {
          // console.log(_array);
        },
        (_, error) => {
          console.log(error);
        }
      );
    });
    setMyScore(myScore + 1);

    // update game table to reflect score
    let offence = null;
    let text = null;
    if (Boolean(route.params.startOffence) === true) {
      text = "defence";
    } else {
      text = "offence";
    }

    if (mys + 1 === halfTime && theirs < halfTime) {
      Alert.alert(
        "Half Time",
        "Half time reached you now play " + text,
        [
          {
            text: "OK",
            onPress: () => {},
          },
        ],
        { cancelable: true }
      );
      offence = !Boolean(route.params.startOffence);
      setOnOffense(!Boolean(route.params.startOffence));
    } else if (mys + 1 === pointCap) {
      Alert.alert(
        "Game Over",
        "Good game you won!",
        [
          {
            text: "OK",
            onPress: () => {},
          },
        ],
        { cancelable: true }
      );
      endGame();
      // TODO: end game
      return;
    } else {
      offence = !onOffense;
      setOnOffense(!onOffense);
    }
    addSameLine(mys + 2 + theirs, offence);
  }

  function playerDeep(index) {
    var playerName;
    if (index === 7) {
      playerName = null;
    } else {
      playerName = playersOnCourt[index];
    }
    let mys = myScore;
    let theirs = theirScore;
    let point = mys + theirs + 1;
    let action = "Deep";
    var associatedPlayer;
    if (playerInPossession === 7) {
      associatedPlayer = null;
    } else {
      associatedPlayer = playersOnCourt[playerInPossession];
    }

    let insertQuery =
      "insert into actionPerformed (opponent, gameTimestamp, playerName, action, point, associatedPlayer) values (?,?,?,?,?,?)";
    let values = [
      opponent,
      route.params.timestamp,
      playerName,
      action,
      point,
      associatedPlayer,
    ];

    db.transaction((tx) => {
      tx.executeSql(
        insertQuery,
        values,
        (_, { rows: { _array } }) => {
          // console.log(_array);
        },
        (_, error) => {
          console.log(error);
        }
      );
    });

    beforePreviousAction.current = previousAction.current;
    setBeforePreviousActionState(previousAction.current);
    allActionsPerformed.current.push({
      action: "Deep",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    });
    previousAction.current = {
      action: "Deep",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    };
    setPreviousActionState(previousAction.current);
    setPlayerInPossession(index);
  }

  function playerThrowaway(index) {
    var playerName;
    if (index === 7) {
      playerName = null;
    } else {
      playerName = playersOnCourt[index];
    }
    let mys = myScore;
    let theirs = theirScore;
    let point = mys + theirs + 1;
    let action = "Throwaway";
    let associatedPlayer = null;
    // let associatedPlayer = playersOnCourt[playerInPossession];

    let insertQuery =
      "insert into actionPerformed (opponent, gameTimestamp, playerName, action, point, associatedPlayer) values (?,?,?,?,?,?)";
    let values = [
      opponent,
      route.params.timestamp,
      playerName,
      action,
      point,
      associatedPlayer,
    ];

    db.transaction((tx) => {
      tx.executeSql(
        insertQuery,
        values,
        (_, { rows: { _array } }) => {
          // console.log(_array);
        },
        (_, error) => {
          console.log(error);
        }
      );
    });

    setOnOffense(!onOffense);

    beforePreviousAction.current = previousAction.current;
    setBeforePreviousActionState(previousAction.current);
    allActionsPerformed.current.push({
      action: "Throwaway",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    });
    previousAction.current = {
      action: "Throwaway",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    };
    setPreviousActionState(previousAction.current);
    setPlayerInPossession(-1);
  }

  function playerCallahan(index) {
    var playerName;
    if (index === 7) {
      playerName = null;
    } else {
      playerName = playersOnCourt[index];
    }
    let mys = myScore;
    let theirs = theirScore;
    let point = mys + theirs + 1;
    let action = "Callahan";
    let associatedPlayer = null;

    let insertQuery =
      "insert into actionPerformed (opponent, gameTimestamp, playerName, action, point) values (?,?,?,?,?)";
    let values = [opponent, route.params.timestamp, playerName, action, point];

    db.transaction((tx) => {
      tx.executeSql(
        insertQuery,
        values,
        (_, { rows: { _array } }) => {
          // console.log(_array);
        },
        (_, error) => {
          console.log(error);
        }
      );
    });

    setPlayerInPossession(-1);

    beforePreviousAction.current = previousAction.current;
    setBeforePreviousActionState(previousAction.current);
    allActionsPerformed.current.push({
      action: "Callahan",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    });
    previousAction.current = {
      action: "Callahan",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    };
    setPreviousActionState(previousAction.current);
    let updateQuery =
      "update game set myScore = ? where timestamp = ? and opponent = ?";
    let updateValues = [mys + 1, route.params.timestamp, opponent];
    db.transaction((tx) => {
      tx.executeSql(
        updateQuery,
        updateValues,
        (_, { rows: { _array } }) => {
          // console.log(_array);
        },
        (_, error) => {
          console.log(error);
        }
      );
    });
    setMyScore(mys + 1);
    let text = null;
    let offence = null;
    if (Boolean(route.params.startOffence) === true) {
      text = "defence";
    } else {
      text = "offence";
    }

    if (mys + 1 === halfTime && theirs < halfTime) {
      Alert.alert(
        "Half Time",
        "Half time reached you now play " + text,
        [
          {
            text: "OK",
            onPress: () => {},
          },
        ],
        { cancelable: true }
      );
      offence = !Boolean(route.params.startOffence);
      setOnOffense(!Boolean(route.params.startOffence));
    } else if (mys + 1 === pointCap) {
      Alert.alert(
        "Game Over",
        "Good game you won!",
        [
          {
            text: "OK",
            onPress: () => {},
          },
        ],
        { cancelable: true }
      );
      endGame();
      return;
    } else {
      offence = false;
      setOnOffense(false);
    }
    addSameLine(mys + 2 + theirs, offence);
  }

  function theirThrowaway() {
    let playerName = null;
    let mys = myScore;
    let theirs = theirScore;
    let point = mys + theirs + 1;
    let action = "Their Throwaway";
    let associatedPlayer = null;

    let insertQuery =
      "insert into actionPerformed (opponent, gameTimestamp, action, point) values (?,?,?,?)";
    let values = [opponent, route.params.timestamp, action, point];

    db.transaction((tx) => {
      tx.executeSql(
        insertQuery,
        values,
        (_, { rows: { _array } }) => {
          // console.log(_array);
        },
        (_, error) => {
          console.log(error);
        }
      );
    });

    setOnOffense(!onOffense);
    setPlayerInPossession(-1);

    beforePreviousAction.current = previousAction.current;
    setBeforePreviousActionState(previousAction.current);
    allActionsPerformed.current.push({
      action: "Their Throwaway",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    });
    previousAction.current = {
      action: "Their Throwaway",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    };
    setPreviousActionState(previousAction.current);
  }

  function theirGoal() {
    let playerName = null;
    let mys = myScore;
    let theirs = theirScore;
    let point = mys + theirs + 1;
    let action = "They Score";
    let associatedPlayer = null;

    let insertQuery =
      "insert into actionPerformed (opponent, gameTimestamp, action, point) values (?,?,?,?)";
    let values = [opponent, route.params.timestamp, action, point];

    db.transaction((tx) => {
      tx.executeSql(
        insertQuery,
        values,
        (_, { rows: { _array } }) => {
          // console.log(_array);
        },
        (_, error) => {
          console.log(error);
        }
      );
    });

    setPlayerInPossession(-1);

    beforePreviousAction.current = previousAction.current;
    setBeforePreviousActionState(previousAction.current);
    allActionsPerformed.current.push({
      action: "They Score",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    });
    previousAction.current = {
      action: "They Score",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    };
    setPreviousActionState(previousAction.current);
    let updateQuery =
      "update game set theirScore = ? where timestamp = ? and opponent = ?";
    let updateValues = [theirs + 1, route.params.timestamp, opponent];
    db.transaction((tx) => {
      tx.executeSql(
        updateQuery,
        updateValues,
        (_, { rows: { _array } }) => {
          // console.log(_array);
        },
        (_, error) => {
          console.log(error);
        }
      );
    });

    setTheirScore(theirs + 1);

    let text = null;
    let offence = null;
    if (Boolean(route.params.startOffence) === true) {
      text = "defence";
    } else {
      text = "offence";
    }

    if (theirs + 1 === halfTime && mys < halfTime) {
      Alert.alert(
        "Half Time",
        "Half time reached you now play " + text,
        [
          {
            text: "OK",
            onPress: () => {},
          },
        ],
        { cancelable: true }
      );
      offence = !Boolean(route.params.startOffence);
      setOnOffense(!Boolean(route.params.startOffence));
    } else if (theirs + 1 == pointCap) {
      Alert.alert(
        "Game Over",
        "Pathetic performance, you lost",
        [
          {
            text: "OK",
            onPress: () => {},
          },
        ],
        { cancelable: true }
      );
      //TODO: end game
      endGame();
      return;
    } else {
      offence = !onOffense;
      setOnOffense(!onOffense);
    }
    addSameLine(mys + theirs + 2, offence);
  }

  function playerDefended(index) {
    var playerName;
    if (index === 7) {
      playerName = null;
    } else {
      playerName = playersOnCourt[index];
    }
    let mys = myScore;
    let theirs = theirScore;
    let point = mys + theirs + 1;
    let action = "Defence";
    let associatedPlayer = null;

    let insertQuery =
      "insert into actionPerformed (opponent, gameTimestamp, playerName, action, point) values (?,?,?,?,?)";
    let values = [opponent, route.params.timestamp, playerName, action, point];

    db.transaction((tx) => {
      tx.executeSql(
        insertQuery,
        values,
        (_, { rows: { _array } }) => {
          // console.log(_array);
        },
        (_, error) => {
          console.log(error);
        }
      );
    });

    setOnOffense(!onOffense);
    setPlayerInPossession(-1);

    beforePreviousAction.current = previousAction.current;
    setBeforePreviousActionState(previousAction.current);
    allActionsPerformed.current.push({
      action: "Defence",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    });
    previousAction.current = {
      action: "Defence",
      player: playerName,
      point: point,
      associatedPlayer: associatedPlayer,
    };
    setPreviousActionState(previousAction.current);
  }
  function playerPickup(index) {
    setPlayerInPossession(index);
  }

  function renderPlayer(index) {
    // console.log("on offense", onOffense);
    let x = playersOnCourt.map((player) => {
      return player;
    });

    let name;
    if (index === 7) {
      name = "Unknown";
    } else {
      name = x[index];
    }

    let playerTextStyle = styles.playerText;
    if (playerInPossession === index) {
      playerTextStyle = {
        ...playerTextStyle,
        ...{ color: "gray", fontWeight: "normal" },
      };
    }

    if (index !== 7 && x[index] === "") {
      return <View style={styles.player}></View>;
    } else {
      if (onOffense === true) {
        if (index === playerInPossession) {
          return (
            <View style={styles.player}>
              <Pressable
                onPress={playerPickup.bind(this, index)}
                style={({ pressed }) => pressed && styles.pressedItem}
              >
                <Text style={playerTextStyle}>{name}</Text>
              </Pressable>
              <View style={styles.playerButtons}>
                <MyButton
                  text="Throwaway"
                  flex={1}
                  textSize={11}
                  padding={11}
                  margin={1}
                  borderWidth={0.5}
                  disabled={disableAllButtons}
                  onPress={() => {
                    playerThrowaway(index);
                  }}
                />
              </View>
            </View>
          );
        } else if (playerInPossession === -1) {
          return (
            <View style={styles.player}>
              <Pressable
                onPress={playerPickup.bind(this, index)}
                style={({ pressed }) => pressed && styles.pressedItem}
              >
                <Text style={playerTextStyle}>{name}</Text>
              </Pressable>
              <View style={styles.playerButtons}>
                <MyButton
                  text="Pick up Disc"
                  flex={1}
                  textSize={12}
                  padding={11}
                  margin={1}
                  borderWidth={0.5}
                  disabled={disableAllButtons}
                  onPress={() => {
                    playerPickup(index);
                  }}
                />
              </View>
            </View>
          );
        } else {
          return (
            <View style={styles.player}>
              <Pressable
                onPress={playerPickup.bind(this, index)}
                style={({ pressed }) => pressed && styles.pressedItem}
              >
                <Text style={playerTextStyle}>{name}</Text>
              </Pressable>
              <View style={styles.playerButtons}>
                <MyButton
                  text="Drop"
                  flex={1}
                  textSize={11}
                  padding={11}
                  margin={1}
                  borderWidth={0.5}
                  disabled={disableAllButtons}
                  onPress={() => {
                    playerDropped(index);
                  }}
                />
                <MyButton
                  text="Catch"
                  flex={1}
                  textSize={11}
                  padding={11}
                  margin={1}
                  borderWidth={0.5}
                  disabled={disableAllButtons}
                  onPress={() => {
                    playerCatched(index);
                  }}
                />
                <MyButton
                  text="Deep"
                  flex={1}
                  textSize={11}
                  padding={11}
                  margin={1}
                  borderWidth={0.5}
                  disabled={disableAllButtons}
                  onPress={() => {
                    playerDeep(index);
                  }}
                />
                <MyButton
                  text="Score"
                  flex={1}
                  textSize={11}
                  padding={11}
                  margin={1}
                  borderWidth={0.5}
                  disabled={disableAllButtons}
                  onPress={() => {
                    playerScored(index);
                  }}
                />
              </View>
            </View>
          );
        }
      } else {
        return (
          <View style={styles.player}>
            <Text style={styles.playerText}>{name}</Text>
            <MyButton
              text="Defence"
              flex={1}
              textSize={11}
              padding={11}
              margin={1}
              borderWidth={0.5}
              disabled={disableAllButtons}
              onPress={() => {
                playerDefended(index);
              }}
            />
            <MyButton
              text="Callahan"
              flex={1}
              textSize={11}
              padding={11}
              margin={1}
              borderWidth={0.5}
              disabled={disableAllButtons}
              onPress={() => {
                playerCallahan(index);
              }}
            />
          </View>
        );
      }
    }
  }
  const onLayout = (event) => {
    const { x, y, height, width } = event.nativeEvent.layout;
    setHeightPlayers(height);
  };

  function undo() {
    let actions = allActionsPerformed.current;
    if (actions.length > 0) {
      let lastAction = actions[actions.length - 1];
      console.log(lastAction);
      //delete action from local storage
      if (
        lastAction.action === "Their Throwaway" ||
        lastAction.action === "They Score"
      ) {
        db.transaction((tx) => {
          tx.executeSql(
            `DELETE FROM actionPerformed WHERE id in (select id from actionPerformed 
              where gameTimestamp = ? AND opponent = ? AND action = ? AND point = ? ORDER BY id DESC LIMIT 1);`,
            [gameTimestamp, opponent, lastAction.action, lastAction.point],
            (tx, results) => {
              // console.log(results["rows"]["_array"]);
            },
            (tx, error) => {
              console.log(error);
            }
          );
        });
      } else {
        db.transaction((tx) => {
          tx.executeSql(
            `DELETE FROM actionPerformed WHERE id in (select id from actionPerformed 
              where gameTimestamp = ? AND opponent = ? AND action = ? AND playerName = ? AND point = ? ORDER BY id DESC LIMIT 1);`,
            [
              gameTimestamp,
              opponent,
              lastAction.action,
              lastAction.player,
              lastAction.point,
            ],
            (tx, results) => {
              // console.log(results["rows"]["_array"]);
            },
            (tx, error) => {
              console.log(error);
            }
          );
        });
      }

      let newActions = actions.slice(0, actions.length - 1);
      allActionsPerformed.current = newActions;
      if (newActions.length === 1) {
        previousAction.current = newActions[0];
        beforePreviousAction.current = null;
        setPreviousActionState(newActions[0]);
        setBeforePreviousActionState(null);
      } else if (newActions.length > 1) {
        previousAction.current = newActions[newActions.length - 1];
        beforePreviousAction.current = newActions[newActions.length - 2];
        setPreviousActionState(newActions[newActions.length - 1]);
        setBeforePreviousActionState(newActions[newActions.length - 2]);
      } else if (newActions.length === 0) {
        previousAction.current = null;
        beforePreviousAction.current = null;
        setPreviousActionState(null);
        setBeforePreviousActionState(null);
      }

      if (lastAction.action === "Catch" || lastAction.action === "Deep") {
        let possession = lastAction.associatedPlayer;
        setPlayerInPossession(playersOnCourt.indexOf(possession));
      } else if (lastAction.action === "Drop") {
        let possession = lastAction.associatedPlayer;
        setPlayerInPossession(playersOnCourt.indexOf(possession));
        setOnOffense(true);
      } else if (lastAction.action === "Throwaway") {
        let possession = lastAction.player;
        setPlayerInPossession(playersOnCourt.indexOf(possession));
        setOnOffense(true);
      } else if (lastAction.action === "Defence") {
        setPlayerInPossession(-1);
        setOnOffense(false);
      } else if (lastAction.action === "Their Throwaway") {
        setPlayerInPossession(-1);
        setOnOffense(false);
      } else if (
        lastAction.action === "Callahan" ||
        lastAction.action === "Score"
      ) {
        var curpoint = lastAction.point;
        // delete all actions of next point from local storage
        db.transaction((tx) => {
          tx.executeSql(
            `DELETE FROM actionPerformed WHERE id in (select id from actionPerformed  
              where gameTimestamp = ? AND opponent = ? AND point = ?);`,
            [gameTimestamp, opponent, curpoint + 1],
            (tx, results) => {
              // console.log(results["rows"]["_array"]);
            },
            (tx, error) => {
              console.log(error);
            }
          );
        });
        let updateQuery =
          "update game set myScore = ? where timestamp = ? and opponent = ?";
        let updateValues = [myScore - 1, route.params.timestamp, opponent];
        db.transaction((tx) => {
          tx.executeSql(
            updateQuery,
            updateValues,
            (_, { rows: { _array } }) => {
              // console.log(_array);
            },
            (_, error) => {
              console.log(error);
            }
          );
        });
        if (myScore === pointCap) {
          setDisableAllButtons(false);
        }
        setMyScore(myScore - 1);
        if (lastAction.action === "Score") {
          let possession = lastAction.associatedPlayer;
          setPlayerInPossession(playersOnCourt.indexOf(possession));
          setOnOffense(true);
        } else {
          setPlayerInPossession(-1);
          setOnOffense(false);
        }
      } else if (lastAction.action === "They Score") {
        var curpoint = lastAction.point;
        db.transaction((tx) => {
          tx.executeSql(
            `DELETE FROM actionPerformed WHERE id in (select id from actionPerformed  
              where gameTimestamp = ? AND opponent = ? AND point = ?);`,
            [gameTimestamp, opponent, curpoint + 1],
            (tx, results) => {
              // console.log(results["rows"]["_array"]);
            },
            (tx, error) => {
              console.log(error);
            }
          );
        });
        let updateQuery =
          "update game set myScore = ? where timestamp = ? and opponent = ?";
        let updateValues = [theirScore - 1, route.params.timestamp, opponent];
        db.transaction((tx) => {
          tx.executeSql(
            updateQuery,
            updateValues,
            (_, { rows: { _array } }) => {
              // console.log(_array);
            },
            (_, error) => {
              console.log(error);
            }
          );
        });
        if (theirScore === pointCap) {
          setDisableAllButtons(false);
        }
        setTheirScore(theirScore - 1);
        setPlayerInPossession(-1);
        setOnOffense(false);
      }
    }
  }

  function renderPlayers() {
    if (onOffense === true) {
      return (
        <View style={{ width: "100%" }}>
          {renderPlayer(0)}
          {renderPlayer(1)}
          {renderPlayer(2)}
          {renderPlayer(3)}
          {renderPlayer(4)}
          {renderPlayer(5)}
          {renderPlayer(6)}
          {renderPlayer(7)}
        </View>
      );
    } else {
      return (
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            backgroundColor: "#fff",
          }}
        >
          <View style={{}} onLayout={onLayout}>
            {renderPlayer(0)}
            {renderPlayer(1)}
            {renderPlayer(2)}
            {renderPlayer(3)}
            {renderPlayer(4)}
            {renderPlayer(5)}
            {renderPlayer(6)}
            {renderPlayer(7)}
          </View>
          <View style={{ backgroundColor: "#fff", flex: 1, marginTop: 4 }}>
            <MyButton
              text="Their Throwaway"
              textSize={14}
              padding={11}
              margin={1}
              borderWidth={0.5}
              flex={1}
              heightOnly={heightPlayers - 10}
              disabled={disableAllButtons}
              onPress={theirThrowaway}
            />
          </View>
          <View style={{ backgroundColor: "#fff", flex: 1, marginTop: 4 }}>
            <MyButton
              text="Their Goal"
              textSize={14}
              padding={11}
              margin={1}
              borderWidth={0.5}
              flex={1}
              heightOnly={heightPlayers - 10}
              disabled={disableAllButtons}
              onPress={theirGoal}
            />
          </View>
        </View>
      );
    }
  }

  function renderPreviousPlays(priority) {
    if (previousActionState === null) {
      return <View></View>;
    }
    let prev = previousActionState;
    let textStyle = { color: "#000" };
    if (priority === 1) {
      if (beforePreviousActionState === null) {
        return <View></View>;
      }
      prev = beforePreviousActionState;
      textStyle = { color: "#808080" };
    }
    let image = allActionImages[prev["action"]];
    let description = "";
    let player = "";
    let associatedPlayer = "";

    if (prev["player"] === null) {
      player = "UNKNOWN";
    } else {
      player = prev["player"];
    }
    if (prev["associatedPlayer"] === null) {
      associatedPlayer = "UNKNOWN";
    } else {
      associatedPlayer = prev["associatedPlayer"];
    }

    if (prev["action"] === "Callahan") {
      description = player + " fashee5(a) w 3amal(et)" + " Callahan";
    } else if (prev["action"] === "Catch") {
      description = player + " catched disc from " + associatedPlayer;
    } else if (prev["action"] === "Deep") {
      description = player + " catched a deep from " + associatedPlayer;
    } else if (prev["action"] === "Defence") {
      description = player + " got a defence";
    } else if (prev["action"] === "Drop") {
      description = player + " dropped a disc from " + associatedPlayer;
    } else if (prev["action"] === "Score") {
      description = player + " scored a goal, assist " + associatedPlayer;
    } else if (prev["action"] === "Throwaway") {
      description = player + " made a throwaway";
    } else if (prev["action"] === "Their Throwaway") {
      description = "Their Throwaway.";
    } else if (prev["action"] === "They Score") {
      description = "They got a point.";
    }

    return (
      <View
        style={{
          width: "100%",
          backgroundColor: "#ffffff",
          marginTop: 5,
          flexDirection: "row",
        }}
      >
        <Image style={{ width: 75, height: 75 }} source={image} />
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={textStyle}>{description}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={{ width: "100%" }}>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Modal
          onModalShow={onModalShow}
          isVisible={isModalVisible}
          onBackButtonPress={toggleModal}
          onBackdropPress={toggleModal}
        >
          <View
            style={{
              backgroundColor: "#fff",
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
              padding: 10,
              borderRadius: 10,
            }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
                width: "100%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  // alignContent: "flex-start",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: "#808080",
                    alignItems: "center",
                    justifyContent: "center",
                    alignContent: "center",
                    flex: 1,
                  }}
                >
                  Field:
                </Text>
                <MyButton
                  textSize={11}
                  text={playersOnCourtText[0]}
                  color={onCourtBackgroundColors(playersOnCourtText[0])}
                  textColor={onCourtTextColors(playersOnCourtText[0])}
                  flex={1}
                  padding={11}
                  margin={1}
                  borderWidth={0.5}
                  addNumber={
                    playersOnCourtText[0] !== "open"
                      ? playerPointsPlayed[playersOnCourtText[0]] - 1
                      : null
                  }
                  onPress={() => {
                    unSelectPlayer(0);
                  }}
                />
                <MyButton
                  textSize={11}
                  text={playersOnCourtText[1]}
                  color={onCourtBackgroundColors(playersOnCourtText[1])}
                  textColor={onCourtTextColors(playersOnCourtText[1])}
                  flex={1}
                  padding={11}
                  margin={1}
                  borderWidth={0.5}
                  addNumber={
                    playersOnCourtText[1] !== "open"
                      ? playerPointsPlayed[playersOnCourtText[1]] - 1
                      : null
                  }
                  onPress={() => {
                    unSelectPlayer(1);
                  }}
                />
                <MyButton
                  textSize={11}
                  text={playersOnCourtText[2]}
                  color={onCourtBackgroundColors(playersOnCourtText[2])}
                  textColor={onCourtTextColors(playersOnCourtText[2])}
                  flex={1}
                  padding={11}
                  margin={1}
                  borderWidth={0.5}
                  addNumber={
                    playersOnCourtText[2] !== "open"
                      ? playerPointsPlayed[playersOnCourtText[2]] - 1
                      : null
                  }
                  onPress={() => {
                    unSelectPlayer(2);
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignContent: "flex-start",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  width: "100%",
                }}
              >
                <MyButton
                  textSize={11}
                  text={playersOnCourtText[3]}
                  color={onCourtBackgroundColors(playersOnCourtText[3])}
                  textColor={onCourtTextColors(playersOnCourtText[3])}
                  flex={1}
                  padding={11}
                  margin={1}
                  borderWidth={0.5}
                  addNumber={
                    playersOnCourtText[3] !== "open"
                      ? playerPointsPlayed[playersOnCourtText[3]] - 1
                      : null
                  }
                  onPress={() => {
                    unSelectPlayer(3);
                  }}
                />
                <MyButton
                  textSize={11}
                  text={playersOnCourtText[4]}
                  color={onCourtBackgroundColors(playersOnCourtText[4])}
                  textColor={onCourtTextColors(playersOnCourtText[4])}
                  flex={1}
                  padding={11}
                  margin={1}
                  borderWidth={0.5}
                  addNumber={
                    playersOnCourtText[4] !== "open"
                      ? playerPointsPlayed[playersOnCourtText[4]] - 1
                      : null
                  }
                  onPress={() => {
                    unSelectPlayer(4);
                  }}
                />
                <MyButton
                  textSize={11}
                  text={playersOnCourtText[5]}
                  color={onCourtBackgroundColors(playersOnCourtText[5])}
                  textColor={onCourtTextColors(playersOnCourtText[5])}
                  flex={1}
                  padding={11}
                  margin={1}
                  borderWidth={0.5}
                  addNumber={
                    playersOnCourtText[5] !== "open"
                      ? playerPointsPlayed[playersOnCourtText[5]] - 1
                      : null
                  }
                  onPress={() => {
                    unSelectPlayer(5);
                  }}
                />
                <MyButton
                  textSize={11}
                  text={playersOnCourtText[6]}
                  color={onCourtBackgroundColors(playersOnCourtText[6])}
                  textColor={onCourtTextColors(playersOnCourtText[6])}
                  flex={1}
                  padding={11}
                  margin={1}
                  borderWidth={0.5}
                  addNumber={
                    playersOnCourtText[6] !== "open"
                      ? playerPointsPlayed[playersOnCourtText[6]] - 1
                      : null
                  }
                  onPress={() => {
                    unSelectPlayer(6);
                  }}
                />
              </View>
              <View
                style={{
                  marginVertical: 10,
                  // backgroundColor: "#ff9f8f",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: "#808080",
                    alignItems: "center",
                    justifyContent: "center",
                    alignContent: "center",
                  }}
                >
                  Bench:
                </Text>
                <View style={{ flex: 0 }}>
                  <FlatList
                    data={playersOnBench}
                    renderItem={({ item }) => (
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "column",
                          margin: 1,
                        }}
                      >
                        <MyButton
                          text={item}
                          flex={1}
                          margin={1}
                          verticalPadding={13}
                          textSize={12}
                          fontWeight="bold"
                          addNumber={playerPointsPlayed[item]}
                          onPress={() => choosePlayer(item)}
                        />
                      </View>
                    )}
                    //Setting the number of column
                    numColumns={4}
                    keyExtractor={(item, index) => item}
                  />
                </View>
                <View style={{ margin: 10 }}>
                  <MyButton onPress={toggleModal} text="Done" />
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <View style={styles.container}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Image source={mayhemLogo} style={styles.image} />
            <View
              style={{
                margin: 10,
                flexDirection: "column",
                alignContent: "center",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
                flex: 1,
                // borderBottomWidth: 0.5,
                paddingBottom: 10,
              }}
            >
              <View style={{ backgroundColor: "#fff", width: "100%" }}>
                <Text
                  style={{
                    fontSize: 18,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  Mayhem vs {opponent}
                </Text>
                <Text style={{ fontSize: 18, textAlign: "center" }}>
                  {myScore} - {theirScore}
                </Text>
              </View>
            </View>
            <Image source={myImage} style={styles.image} />
          </View>

          <View
            style={{
              margin: 10,
              marginTop: 0,
              flexDirection: "row",
              alignContent: "center",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              backgroundColor: "#ffffff",
              width: "100%",
              borderTopWidth: 0.5,
              borderBottomWidth: 0.5,
              paddingBottom: 10,
            }}
          >
            <View style={{ flex: 3, backgroundColor: "#fff" }}>
              <Text style={{ fontSize: 18, textAlign: "center" }}>
                {onFieldText()}
              </Text>
            </View>
            <MyButton
              text="Edit"
              flex={1}
              onPress={toggleModal}
              disabled={disableAllButtons}
            />
          </View>

          {renderPlayers()}

          <View
            style={{
              flexDirection: "row",
              width: "100%",
              flex: 1,
              backgroundColor: "#ffffff",
            }}
          >
            <MyButton text="Undo" onPress={undo} width={80} />
            <View style={{ flex: 1 }}>{renderPreviousPlays(1)}</View>
          </View>
          <View style={{ width: "100%", flex: 1 }}>
            {renderPreviousPlays(0)}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default RecordGame;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  image: {
    width: 200,
    height: 200,
    margin: 20,
    marginBottom: 80,
  },
  player: {
    // flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    marginVertical: 3,
    width: "100%",
    backgroundColor: "#ffffff",
  },
  playerText: {
    // fontSize: 18,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
    width: 60,
  },
  playerButtons: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
    width: "100%",
    backgroundColor: "#ffffff",
  },
  image: {
    width: 60,
    height: 60,
    margin: 8,
  },

  pressedItem: { opacity: 0.5 },
  // pressableStyle: {
  //   width: "100%",
  //   alignItems: "center",
  // },
});
