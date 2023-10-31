import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View, Image } from "react-native";
import MyButton from "../components/MyButton";
import React, { useEffect, useRef } from "react";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { ProgressChart, PieChart } from "react-native-chart-kit";
import * as SQLite from "expo-sqlite";
import { Dimensions } from "react-native";
const screenWidth = Dimensions.get("window").width;
const pieColors = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",

  "#46f0f0",
  "#f032e6",

  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#9a6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#808080",
  "#ffffff",
  "#000000",
];

const db = SQLite.openDatabase("game.db");

const PLayerStats = ({ route, navigation }) => {
  const gameTimestamp = route.params.timestamp;
  const opponent = route.params.opponent;
  const [players, setPlayers] = React.useState([]);
  const [selectedPlayer, setSelectedPlayer] = React.useState(0);
  const [chartWidth, setChartWidth] = React.useState(0);
  const playersRef = useRef([]);
  const [playerStats, setPlayerStats] = React.useState([0, 0, 0]);
  const playerStatsRef = useRef([]);
  const [playerCatches, setPlayerCatches] = React.useState([]);
  const [playerThrows, setPlayerThrows] = React.useState([]);
  const [pieDatas, setPieDatas] = React.useState([]);
  const [pieDatas2, setPieDatas2] = React.useState([]);
  const [pieDatas3, setPieDatas3] = React.useState([]);
  const [pieDatas4, setPieDatas4] = React.useState([]);

  const [playersActions, setPlayersActions] = React.useState([]);

  async function getAllPLayers() {
    await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "select distinct playerName as name from actionPerformed where gameTimestamp=? and opponent = ?;",
          [gameTimestamp, opponent],
          (_, { rows: { _array } }) => {
            let players = [];
            for (let i = 0; i < _array.length; i++) {
              if (_array[i].name !== undefined && _array[i].name !== null) {
                players.push(_array[i].name);
              }
            }
            playersRef.current = players;
            setPlayers(players);
            resolve();
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  }

  function getPlayerStats() {
    db.transaction((tx) => {
      tx.executeSql(
        "select * from actionPerformed where gameTimestamp=? and opponent=?",
        [gameTimestamp, opponent],
        (_, { rows: { _array } }) => {
          //   console.log(_array);
          let playersActions = _array;
          // filter to get actions for each player
          let playerThrows = [];
          let playerCatches = [];
          let playerThrowaways = [];
          let playerDrops = [];
          let playerPlays = [];
          let playerIncluded = [];
          let playerMissed = [];
          let playerToPlayer = [];
          let playerFromPlayer = [];
          let playerDropFrom = [];
          let playerDropTo = [];

          for (let i = 0; i < playersRef.current.length; i++) {
            playerThrows.push(0);
            playerCatches.push(0);
            playerThrowaways.push(0);
            playerDrops.push(0);
            playerPlays.push(0);
            playerIncluded.push([]);
            playerMissed.push(0);
            let playerToDict = {};
            for (let j = 0; j < playersRef.current.length; j++) {
              if (i === j) {
                continue;
              }
              playerToDict[playersRef.current[j]] = 0;
            }
            playerToPlayer.push(playerToDict);
            let playerFromDict = {};
            for (let j = 0; j < playersRef.current.length; j++) {
              if (i === j) {
                continue;
              }
              playerFromDict[playersRef.current[j]] = 0;
            }
            playerFromPlayer.push(playerFromDict);
            let playerDropFromDict = {};
            for (let j = 0; j < playersRef.current.length; j++) {
              if (i === j) {
                continue;
              }
              playerDropFromDict[playersRef.current[j]] = 0;
            }
            playerDropFrom.push(playerDropFromDict);
            let playerDropToDict = {};
            for (let j = 0; j < playersRef.current.length; j++) {
              if (i === j) {
                continue;
              }
              playerDropToDict[playersRef.current[j]] = 0;
            }
            playerDropTo.push(playerDropToDict);
          }

          for (let i = 0; i < _array.length; i++) {
            // console.log(_array[i].id);
            let playerName = _array[i].playerName;
            let action = _array[i].action;
            let associatedPlayer = _array[i].associatedPlayer;
            let point = _array[i].point;

            if (playerName === undefined || playerName === null) {
              continue;
            }
            let playerIndex = playersRef.current.indexOf(playerName);
            let associatedPlayerIndex = -1;
            if (associatedPlayer !== undefined && associatedPlayer !== null) {
              associatedPlayerIndex =
                playersRef.current.indexOf(associatedPlayer);
            }

            if (playerIndex === -1) {
              continue;
            }

            if (action === "In Point") {
              playerIncluded[playerIndex].push(point);
            } else if (
              action === "Score" ||
              action == "Catch" ||
              action === "Deep"
            ) {
              playerCatches[playerIndex] += 1;
              if (associatedPlayerIndex !== -1) {
                playerThrows[associatedPlayerIndex] += 1;
                playerToPlayer[associatedPlayerIndex][playerName] += 1;
                playerFromPlayer[playerIndex][associatedPlayer] += 1;
                playerPlays[associatedPlayerIndex] += 1;
              }
              playerPlays[playerIndex] += 1;
              for (let j = 0; j < playerIncluded.length; j++) {
                if (playerIncluded[j].includes(point)) {
                  playerMissed[j] += 1;
                } else {
                  // console.warn(j);
                }
              }
            } else if (action === "Throwaway") {
              playerThrowaways[playerIndex] += 1;
            } else if (action === "Drop") {
              playerDrops[playerIndex] += 1;
              if (associatedPlayerIndex !== -1) {
                playerDropFrom[playerIndex][associatedPlayer] += 1;
                playerDropTo[associatedPlayerIndex][playerName] += 1;
              }
            } else if (action === "Subbed In") {
              playerIncluded[playerIndex].push(point);
            }
          }
          // calculate stats for each player
          for (let j = 0; j < playersRef.current.length; j++) {
            // if (j === 3) {
            //   console.log("Throws", playerThrows[j]);
            //   console.log("Throwaways", playerThrowaways[j]);
            //   console.log("Catches", playerCatches[j]);
            //   console.log("Drops", playerDrops[j]);
            // }
            let throwAccuracy =
              playerThrows[j] / (playerThrows[j] + playerThrowaways[j]);
            let catchAccuracy =
              playerCatches[j] / (playerCatches[j] + playerDrops[j]);
            let playContribution = playerPlays[j] / playerMissed[j];
            if (playerThrows[j] === 0) {
              throwAccuracy = 1;
            }
            if (playerCatches[j] === 0) {
              catchAccuracy = 1;
            }
            if (playerMissed === 0) {
              playContribution = 1;
            }
            playerStatsRef.current[j] = [
              playContribution,

              catchAccuracy,
              throwAccuracy,
            ];
          }
          // console.log(playerStatsRef.current[3]);

          //   console.log(playerStatsRef.current);
          setPlayerStats(playerStatsRef.current);
          setPlayerCatches(playerCatches);
          setPlayerThrows(playerThrows);

          let piedata = [];
          let color = 0;
          for (let i = 0; i < playersRef.current.length; i++) {
            piedata.push([]);
            color = 0;
            for (let j = 0; j < playersRef.current.length; j++) {
              if (i === j || playerToPlayer[i][playersRef.current[j]] === 0) {
                continue;
              }
              piedata[i].push({
                name: playersRef.current[j],
                value: playerToPlayer[i][playersRef.current[j]],
                color: pieColors[color++ % pieColors.length],
                legendFontColor: "#000",
                legendFontSize: 15,
              });
            }
          }

          // if a player has throws to more than 10 players then only show top 10
          for (let i = 0; i < piedata.length; i++) {
            piedata[i].sort((a, b) => {
              return b.value - a.value;
            });
            if (piedata[i].length > 10) {
              piedata[i] = piedata[i].slice(0, 10);
            }
            // reassign colors
            color = 0;
            for (let j = 0; j < piedata[i].length; j++) {
              piedata[i][j].color = pieColors[color++ % pieColors.length];
            }
          }

          setPieDatas(piedata);

          let piedata2 = [];
          for (let i = 0; i < playersRef.current.length; i++) {
            piedata2.push([]);
            color = 0;
            for (let j = 0; j < playersRef.current.length; j++) {
              if (i === j || playerFromPlayer[i][playersRef.current[j]] === 0) {
                continue;
              }
              piedata2[i].push({
                name: playersRef.current[j],
                value: playerFromPlayer[i][playersRef.current[j]],
                color: pieColors[color++ % pieColors.length],
                legendFontColor: "#000",
                legendFontSize: 15,
              });
            }
          }

          for (let i = 0; i < piedata2.length; i++) {
            piedata2[i].sort((a, b) => {
              return b.value - a.value;
            });
            if (piedata2[i].length > 10) {
              piedata2[i] = piedata2[i].slice(0, 10);
            }
            // reassign colors
            color = 0;
            for (let j = 0; j < piedata2[i].length; j++) {
              piedata2[i][j].color = pieColors[color++ % pieColors.length];
            }
          }

          let piedata3 = [];
          color = 0;
          for (let i = 0; i < playersRef.current.length; i++) {
            piedata3.push([]);
            for (let j = 0; j < playersRef.current.length; j++) {
              if (i === j || playerDropTo[i][playersRef.current[j]] === 0) {
                continue;
              }
              piedata3[i].push({
                name: playersRef.current[j],
                value: playerDropTo[i][playersRef.current[j]],
                color: pieColors[color++ % pieColors.length],
                legendFontColor: "#000",
                legendFontSize: 15,
              });
            }
          }

          for (let i = 0; i < piedata3.length; i++) {
            piedata3[i].sort((a, b) => {
              return b.value - a.value;
            });
            if (piedata3[i].length > 10) {
              piedata3[i] = piedata3[i].slice(0, 10);
            }
            // reassign colors
            color = 0;
            for (let j = 0; j < piedata3[i].length; j++) {
              piedata3[i][j].color = pieColors[color++ % pieColors.length];
            }
          }

          // console.log(piedata);
          setPieDatas3(piedata3);

          let piedata4 = [];
          for (let i = 0; i < playersRef.current.length; i++) {
            piedata4.push([]);
            color = 0;
            for (let j = 0; j < playersRef.current.length; j++) {
              if (i === j || playerDropFrom[i][playersRef.current[j]] === 0) {
                continue;
              }
              piedata4[i].push({
                name: playersRef.current[j],
                value: playerDropFrom[i][playersRef.current[j]],
                color: pieColors[color++ % pieColors.length],
                legendFontColor: "#000",
                legendFontSize: 15,
              });
            }
          }

          for (let i = 0; i < piedata4.length; i++) {
            piedata4[i].sort((a, b) => {
              return b.value - a.value;
            });
            if (piedata4[i].length > 10) {
              piedata4[i] = piedata4[i].slice(0, 10);
            }
            // reassign colors
            color = 0;
            for (let j = 0; j < piedata4[i].length; j++) {
              piedata4[i][j].color = pieColors[color++ % pieColors.length];
            }
          }

          setPieDatas4(piedata4);

          setPieDatas2(piedata2);
        },
        (_, error) => {
          console.log(error);
        }
      );
    });
  }

  async function onScreenLoad() {
    await getAllPLayers();
    getPlayerStats();
  }

  useEffect(() => {
    onScreenLoad();
  }, []);

  const onLayout = (event) => {
    const { x, y, height, width } = event.nativeEvent.layout;
    setChartWidth(width);
  };
  const progressData = {
    labels: ["Plays", "Catches", "Throws"], // optional
    data: playerStats[selectedPlayer] ? playerStats[selectedPlayer] : [0, 0, 0],
    colors: ["#e6194b", "#3cb44b", "#4363d8"],
  };

  const sumData = (dataArray) => {
    if (dataArray === undefined) {
      return false;
    }
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i].value;
    }
    return sum !== 0;
  };

  const pieData = sumData(pieDatas[selectedPlayer])
    ? pieDatas[selectedPlayer]
    : [
        {
          name: "No Throws",
          value: 21500000,
          color: "#e6194b",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
        },
      ];

  const pieData2 = sumData(pieDatas2[selectedPlayer])
    ? pieDatas2[selectedPlayer]
    : [
        {
          name: "No Catches",
          value: 21500000,
          color: "#3cb44b",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
        },
      ];

  const pieData3 = sumData(pieDatas3[selectedPlayer])
    ? pieDatas3[selectedPlayer]
    : [
        {
          name: "No Drops",
          value: 21500000,
          color: "#4363d8",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
        },
      ];

  const pieData4 = sumData(pieDatas4[selectedPlayer])
    ? pieDatas4[selectedPlayer]
    : [
        {
          name: "No Drops",
          value: 21500000,
          color: pieColors[4],
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
        },
      ];

  return (
    <View
      style={{
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#fff",
      }}
    >
      <View
        style={{
          borderRightWidth: 0.5,
          width: "100%",
          flexDirection: "row",
        }}
      >
        <FlatList
          data={players}
          horizontal={true}
          renderItem={({ item, index }) => {
            return (
              <MyButton
                width={75}
                height={50}
                text={item}
                margin={4}
                color={selectedPlayer === index ? "#808080" : "#119fb8"}
                onPress={() => {
                  setSelectedPlayer(index);
                }}
              />
            );
          }}
        />
      </View>
      <ScrollView>
        <View
          onLayout={onLayout}
          style={{
            flex: 1,
            width: "100%",
            borderTopWidth: 0.5,
            paddingBottom: 15,
          }}
        >
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "600" }}>
            Accuracy and plays contribution:{" "}
          </Text>
          <ProgressChart
            data={progressData}
            width={screenWidth}
            height={150}
            chartConfig={styles.chartConfig}
            withCustomBarColorFromData={true}
          />
          <View
            style={{
              borderBottomWidth: 0.5,
              paddingBottom: 5,
              paddingLeft: 10,
            }}
          >
            <Text>
              Total number of catches:{" "}
              <Text>{playerCatches[selectedPlayer]}</Text>
            </Text>
            <Text>
              Total number of throws:{" "}
              <Text>{playerThrows[selectedPlayer]}</Text>
            </Text>
          </View>
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "600" }}>
            Throws to:{" "}
          </Text>
          <PieChart
            data={pieData}
            width={chartWidth}
            height={200}
            chartConfig={styles.chartConfig}
            accessor="value"
          />
          <View style={{ borderBottomWidth: 0.5, width: "100%" }}></View>
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "600" }}>
            Catches from:{" "}
          </Text>
          <PieChart
            data={pieData2}
            width={chartWidth}
            height={200}
            chartConfig={styles.chartConfig}
            accessor="value"
          />
          <View style={{ borderBottomWidth: 0.5, width: "100%" }}></View>
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "600" }}>
            Dropped your throws:{" "}
          </Text>
          <PieChart
            data={pieData3}
            width={chartWidth}
            height={150}
            chartConfig={styles.chartConfig}
            accessor="value"
          />
          <View style={{ borderBottomWidth: 0.5, width: "100%" }}></View>
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "600" }}>
            You dropped their throws:{" "}
          </Text>
          <PieChart
            data={pieData4}
            width={chartWidth}
            height={150}
            chartConfig={styles.chartConfig}
            accessor="value"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default PLayerStats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
    margin: 20,
    marginBottom: 80,
  },
  chartConfig: {
    backgroundGradientFrom: "#fff",
    backgroundGradientFromOpacity: 0.5,
    backgroundGradientTo: "#fff",
    backgroundGradientToOpacity: 1,
    // color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  },
});
