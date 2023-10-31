import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View, Image } from "react-native";
import MyButton from "../components/MyButton";
import React, { useEffect, useRef } from "react";
import { FlatList } from "react-native-gesture-handler";
import { Pressable } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { ProgressChart } from "react-native-chart-kit";
import * as SQLite from "expo-sqlite";
import { Dimensions } from "react-native";
import {
  Table,
  Row,
  Rows,
  TableWrapper,
  Col,
} from "react-native-table-component";

const screenWidth = Dimensions.get("window").width;

const db = SQLite.openDatabase("game.db");

function backColor(player) {
  if (player !== "") {
    return "#119fb8";
  } else {
    return "#ffffff";
  }
}

function textColor(player) {
  if (player !== "") {
    return "#ffffff";
  } else {
    return "red";
  }
}

const LineBuilder = ({ navigation }) => {
  const [players, setPlayers] = React.useState([]);
  const [selectedLine, setSelectedLine] = React.useState(0);
  const [line1Players, setLine1Players] = React.useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [line2Players, setLine2Players] = React.useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const line1PlayersRef = useRef([]);
  const line2PlayersRef = useRef([]);

  const [line1OffensePoints, setLine1OffensePoints] = React.useState(0);
  const [line1DefensePoints, setLine1DefensePoints] = React.useState(0);
  const [line1OffenseWins, setLine1OffenseWins] = React.useState(0);
  const [line1DefenseWins, setLine1DefenseWins] = React.useState(0);
  const [line2OffensePoints, setLine2OffensePoints] = React.useState(0);
  const [line2DefensePoints, setLine2DefensePoints] = React.useState(0);
  const [line2OffenseWins, setLine2OffenseWins] = React.useState(0);
  const [line2DefenseWins, setLine2DefenseWins] = React.useState(0);
  const [line1OffenseEfficiency, setLine1OffenseEfficiency] = React.useState(0);
  const [line1DefenseEfficiency, setLine1DefenseEfficiency] = React.useState(0);
  const [line2OffenseEfficiency, setLine2OffenseEfficiency] = React.useState(0);
  const [line2DefenseEfficiency, setLine2DefenseEfficiency] = React.useState(0);

  async function getPlayers() {
    let players = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "select name from player;",
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      });
    });

    let playerNames = [];
    for (let i = 0; i < players.length; i++) {
      playerNames.push(players[i].name);
    }
    setPlayers(playerNames);
  }

  function selectPlayer(index) {
    if (selectedLine === 0) {
      if (line1Players.includes(players[index])) {
        return;
      }
      let newLine1Players = line1Players.map((player) => {
        return player;
      });
      let i = newLine1Players.indexOf("");
      newLine1Players[i] = players[index];
      setLine1Players(newLine1Players);
      line1PlayersRef.current.push(players[index]);
      getLine1Stats();
    } else {
      if (line2Players.includes(players[index])) {
        return;
      }
      let newLine2Players = line2Players.map((player) => {
        return player;
      });
      let i = newLine2Players.indexOf("");
      newLine2Players[i] = players[index];
      setLine2Players(newLine2Players);
      line2PlayersRef.current.push(players[index]);
      getLine2Stats();
    }
  }

  useEffect(() => {
    getPlayers();
  }, []);

  function unSelectPlayer(index, line) {
    if (line === 0) {
      if (line1Players[index] === "") {
        return;
      }
      let newLine1Players = line1Players.map((player) => {
        return player;
      });
      let player = newLine1Players[index];
      let i = line1PlayersRef.current.indexOf(player);
      line1PlayersRef.current.splice(i, 1);

      newLine1Players[index] = "";
      setLine1Players(newLine1Players);
      getLine1Stats();
    } else {
      if (line2Players[index] === "") {
        return;
      }
      let newLine2Players = line2Players.map((player) => {
        return player;
      });
      let player = newLine2Players[index];
      let i = line2PlayersRef.current.indexOf(player);
      line2PlayersRef.current.splice(i, 1);
      newLine2Players[index] = "";
      setLine2Players(newLine2Players);
      getLine2Stats();
    }
  }

  function getPlayerText(name) {
    if (name === "") {
      return "open";
    } else {
      return name;
    }
  }
  function renderLine1() {
    return (
      <View style={{ width: "100%" }}>
        <View style={{ width: "100%", padding: 10, paddingTop: 20 }}>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignContent: "center",
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
              }}
            >
              <Pressable
                onPress={() => {
                  setSelectedLine(0);
                }}
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.5,
                  },
                  { justifyContent: "center" },
                ]}
              >
                <View style={{}}>
                  <Text
                    style={{
                      fontSize: 17,
                      color: selectedLine === 0 ? "#808080" : "#000",
                    }}
                  >
                    Line 1:
                  </Text>
                </View>
              </Pressable>
            </View>
            <MyButton
              heightOnly={45}
              padding={0}
              margin={1}
              text={getPlayerText(line1Players[0])}
              color={backColor(line1Players[0])}
              textColor={textColor(line1Players[0])}
              borderWidth={1}
              flex={1}
              onPress={() => {
                unSelectPlayer(0, 0);
              }}
            />
            <MyButton
              heightOnly={45}
              padding={0}
              margin={1}
              text={getPlayerText(line1Players[1])}
              color={backColor(line1Players[1])}
              textColor={textColor(line1Players[1])}
              borderWidth={1}
              flex={1}
              onPress={() => {
                unSelectPlayer(1, 0);
              }}
            />
            <MyButton
              heightOnly={45}
              padding={0}
              margin={1}
              text={getPlayerText(line1Players[2])}
              color={backColor(line1Players[2])}
              textColor={textColor(line1Players[2])}
              borderWidth={1}
              flex={1}
              onPress={() => {
                unSelectPlayer(2, 0);
              }}
            />
          </View>

          <View style={{ width: "100%", flexDirection: "row" }}>
            <MyButton
              heightOnly={45}
              padding={0}
              margin={1}
              text={getPlayerText(line1Players[3])}
              color={backColor(line1Players[3])}
              textColor={textColor(line1Players[3])}
              borderWidth={1}
              flex={1}
              onPress={() => {
                unSelectPlayer(3, 0);
              }}
            />
            <MyButton
              heightOnly={45}
              padding={0}
              margin={1}
              text={getPlayerText(line1Players[4])}
              color={backColor(line1Players[4])}
              textColor={textColor(line1Players[4])}
              borderWidth={1}
              flex={1}
              onPress={() => {
                unSelectPlayer(4, 0);
              }}
            />
            <MyButton
              heightOnly={45}
              padding={0}
              margin={1}
              text={getPlayerText(line1Players[5])}
              color={backColor(line1Players[5])}
              textColor={textColor(line1Players[5])}
              borderWidth={1}
              flex={1}
              onPress={() => {
                unSelectPlayer(5, 0);
              }}
            />
            <MyButton
              heightOnly={45}
              padding={0}
              margin={1}
              text={getPlayerText(line1Players[6])}
              color={backColor(line1Players[6])}
              textColor={textColor(line1Players[6])}
              borderWidth={1}
              flex={1}
              onPress={() => {
                unSelectPlayer(6, 0);
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  function renderLine2() {
    return (
      <View style={{ width: "100%" }}>
        <View style={{ width: "100%", padding: 10, paddingTop: 10 }}>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignContent: "center",
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
              }}
            >
              <Pressable
                onPress={() => {
                  setSelectedLine(1);
                }}
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.5,
                  },
                  { justifyContent: "center" },
                ]}
              >
                <View style={{}}>
                  <Text
                    style={{
                      fontSize: 17,
                      color: selectedLine === 1 ? "#808080" : "#000",
                    }}
                  >
                    Line 2:
                  </Text>
                </View>
              </Pressable>
            </View>
            <MyButton
              heightOnly={45}
              padding={0}
              margin={1}
              text={getPlayerText(line2Players[0])}
              color={backColor(line2Players[0])}
              textColor={textColor(line2Players[0])}
              borderWidth={1}
              flex={1}
              onPress={() => {
                unSelectPlayer(0, 1);
              }}
            />
            <MyButton
              heightOnly={45}
              padding={0}
              margin={1}
              text={getPlayerText(line2Players[1])}
              color={backColor(line2Players[1])}
              textColor={textColor(line2Players[1])}
              borderWidth={1}
              flex={1}
              onPress={() => {
                unSelectPlayer(1, 1);
              }}
            />
            <MyButton
              heightOnly={45}
              padding={0}
              margin={1}
              text={getPlayerText(line2Players[2])}
              color={backColor(line2Players[2])}
              textColor={textColor(line2Players[2])}
              borderWidth={1}
              flex={1}
              onPress={() => {
                unSelectPlayer(2, 1);
              }}
            />
          </View>

          <View style={{ width: "100%", flexDirection: "row" }}>
            <MyButton
              heightOnly={45}
              padding={0}
              margin={1}
              text={getPlayerText(line2Players[3])}
              color={backColor(line2Players[3])}
              textColor={textColor(line2Players[3])}
              borderWidth={1}
              flex={1}
              onPress={() => {
                unSelectPlayer(3, 1);
              }}
            />
            <MyButton
              heightOnly={45}
              padding={0}
              margin={1}
              text={getPlayerText(line2Players[4])}
              color={backColor(line2Players[4])}
              textColor={textColor(line2Players[4])}
              borderWidth={1}
              flex={1}
              onPress={() => {
                unSelectPlayer(4, 1);
              }}
            />
            <MyButton
              heightOnly={45}
              padding={0}
              margin={1}
              text={getPlayerText(line2Players[5])}
              color={backColor(line2Players[5])}
              textColor={textColor(line2Players[5])}
              borderWidth={1}
              flex={1}
              onPress={() => {
                unSelectPlayer(5, 1);
              }}
            />
            <MyButton
              heightOnly={45}
              padding={0}
              margin={1}
              text={getPlayerText(line2Players[6])}
              color={backColor(line2Players[6])}
              textColor={textColor(line2Players[6])}
              borderWidth={1}
              flex={1}
              onPress={() => {
                unSelectPlayer(6, 1);
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  async function getLine1Stats() {
    if (line1PlayersRef.current.length === 0) {
      setLine1DefenseEfficiency(0);
      setLine1OffenseEfficiency(0);
      return;
    }
    let offensePoints = 0;
    let defensePoints = 0;
    let offenseWins = 0;
    let defenseWins = 0;

    let linePlayers = line1PlayersRef.current.map((player) => player);

    let playerCount = linePlayers.length;
    let playersSet = "";
    for (let i = 0; i < playerCount; i++) {
      playersSet += "'" + linePlayers[i] + "',";
    }
    playersSet = playersSet.substring(0, playersSet.length - 1);

    let sql = `SELECT * FROM actionPerformed A WHERE EXISTS 
    (SELECT point, gameTimestamp FROM actionPerformed AP WHERE A.gameTimestamp = AP.gameTimestamp AND A.point = AP.point AND action = "In Point" AND playerName in (${playersSet})
    GROUP BY 1, 2
    HAVING COUNT(*) = ${playerCount}) AND (action = "In Point" OR action = "Score" OR action = "They Score" OR action = "Callahan");
    `;
    let actions = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(sql, [], (tx, results) => {
          resolve(results.rows._array);
        });
      });
    });

    // console.log(actions);

    let allGamesActions = {};
    for (let i = 0; i < actions.length; i++) {
      let action = actions[i];
      let gameTimestamp = actions[i].gameTimestamp;
      if (gameTimestamp in allGamesActions) {
        allGamesActions[gameTimestamp].push(action);
      } else {
        allGamesActions[gameTimestamp] = [action];
      }
    }

    // console.log("all", allGamesActions);

    for (let key in allGamesActions) {
      let gameActions = allGamesActions[key];
      let onOffence = false;
      // console.log(gameActions);
      for (let i = 0; i < gameActions.length; i++) {
        let action = gameActions[i];
        if (action.action === "In Point") {
          if (action.offence === 1) {
            onOffence = true;
          } else if (action.offence === 0) {
            onOffence = false;
          }
        } else if (action.action === "Score" || action.action === "Callahan") {
          if (onOffence) {
            offensePoints++;
            offenseWins++;
          } else {
            defensePoints++;
            defenseWins++;
          }
        } else if (action.action === "They Score") {
          if (onOffence) {
            offensePoints++;
          } else {
            defensePoints++;
          }
        }
      }
    }

    setLine1DefensePoints(defensePoints);
    setLine1OffensePoints(offensePoints);
    setLine1DefenseWins(defenseWins);
    setLine1OffenseWins(offenseWins);

    let offenceEfficiency = 0;
    if (offensePoints > 0) {
      offenceEfficiency = offenseWins / offensePoints;
    }
    let defenseEfficiency = 0;
    if (defensePoints > 0) {
      defenseEfficiency = defenseWins / defensePoints;
    }
    setLine1OffenseEfficiency(offenceEfficiency);
    setLine1DefenseEfficiency(defenseEfficiency);
  }

  async function getLine2Stats() {
    if (line2PlayersRef.current.length === 0) {
      setLine2DefenseEfficiency(0);
      setLine2OffenseEfficiency(0);
      return;
    }
    let offensePoints = 0;
    let defensePoints = 0;
    let offenseWins = 0;
    let defenseWins = 0;

    let linePlayers = line2PlayersRef.current.map((player) => player);

    let playerCount = linePlayers.length;
    let playersSet = "";
    for (let i = 0; i < playerCount; i++) {
      playersSet += "'" + linePlayers[i] + "',";
    }
    playersSet = playersSet.substring(0, playersSet.length - 1);

    let sql = `SELECT * FROM actionPerformed A WHERE EXISTS 
    (SELECT point, gameTimestamp FROM actionPerformed AP WHERE A.gameTimestamp = AP.gameTimestamp AND A.point = AP.point AND action = "In Point" AND playerName in (${playersSet})
    GROUP BY 1, 2
    HAVING COUNT(*) = ${playerCount}) AND (action = "In Point" OR action = "Score" OR action = "They Score" OR action = "Callahan");
    `;
    let actions = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(sql, [], (tx, results) => {
          resolve(results.rows._array);
        });
      });
    });

    let allGamesActions = [];
    for (let i = 0; i < actions.length; i++) {
      let action = actions[i];
      let gameTimestamp = actions[i].gameTimestamp;
      if (gameTimestamp in allGamesActions) {
        allGamesActions[gameTimestamp].push(action);
      } else {
        allGamesActions[gameTimestamp] = [action];
      }
    }

    for (let key in allGamesActions) {
      let gameActions = allGamesActions[key];
      let onOffence = false;
      // console.log(gameActions);
      for (let i = 0; i < gameActions.length; i++) {
        let action = gameActions[i];
        if (action.action === "In Point") {
          if (action.offence === 1) {
            onOffence = true;
          } else if (action.offence === 0) {
            onOffence = false;
          }
        } else if (action.action === "Score" || action.action === "Callahan") {
          if (onOffence) {
            offensePoints++;
            offenseWins++;
          } else {
            defensePoints++;
            defenseWins++;
          }
        } else if (action.action === "They Score") {
          if (onOffence) {
            offensePoints++;
          } else {
            defensePoints++;
          }
        }
      }
    }

    setLine2DefensePoints(defensePoints);
    setLine2OffensePoints(offensePoints);
    setLine2DefenseWins(defenseWins);
    setLine2OffenseWins(offenseWins);

    let offenceEfficiency = 0;
    if (offensePoints > 0) {
      offenceEfficiency = offenseWins / offensePoints;
    }
    let defenseEfficiency = 0;
    if (defensePoints > 0) {
      defenseEfficiency = defenseWins / defensePoints;
    }
    setLine2OffenseEfficiency(offenceEfficiency);
    setLine2DefenseEfficiency(defenseEfficiency);
  }

  const progressData = {
    labels: ["Offense", "Defense"], // optional
    data: [line1OffenseEfficiency, line1DefenseEfficiency] || [0, 0],
    colors: ["#e6194b", "#3cb44b"],
  };

  const progressData2 = {
    labels: ["Offense", "Defense"], // optional
    data: [line2OffenseEfficiency, line2DefenseEfficiency] || [0, 0],
    colors: ["#e6194b", "#3cb44b"],
  };

  const state = {
    lines: ["L1", "L2"],
    tableHead: ["", "Won", "Lost", "Total"],
    tableTitle: ["Offense", "Defense", "Total", "Offense", "Defense", "Total"],
    tableData: [
      [
        line1OffenseWins,
        line1OffensePoints - line1OffenseWins,
        line1OffensePoints,
      ],
      [
        line1DefenseWins,
        line1DefensePoints - line1DefenseWins,
        line1DefensePoints,
      ],
      [
        line1OffenseWins + line1DefenseWins,
        line1OffensePoints +
          line1DefensePoints -
          line1OffenseWins -
          line1DefenseWins,
        line1OffensePoints + line1DefensePoints,
      ],
      [
        line2OffenseWins,
        line2OffensePoints - line2OffenseWins,
        line2OffensePoints,
      ],
      [
        line2DefenseWins,
        line2DefensePoints - line2DefenseWins,
        line2DefensePoints,
      ],
      [
        line2OffenseWins + line2DefenseWins,
        line2OffensePoints +
          line2DefensePoints -
          line2OffenseWins -
          line2DefenseWins,
        line2OffensePoints + line2DefensePoints,
      ],
    ],
  };

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
          borderBottomWidth: 0.5,
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
                onPress={() => {
                  selectPlayer(index);
                }}
              />
            );
          }}
        />
      </View>
      <ScrollView>
        {renderLine1()}
        {renderLine2()}

        <View style={{ width: "100%" }}>
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "600" }}>
            Line 1 efficiency:{" "}
          </Text>
          <ProgressChart
            data={progressData}
            width={screenWidth}
            height={150}
            chartConfig={styles.chartConfig}
            withCustomBarColorFromData={true}
          />
          <Text style={{ margin: 10, fontSize: 15, fontWeight: "400" }}>
            Line 1 played together
            {" " +
              (line1DefensePoints + line1OffensePoints) +
              " points, they won " +
              (line1DefenseWins + line1OffenseWins) +
              " points"}
          </Text>
          <View style={{ borderWidth: 0.5, width: "100%" }} />
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "600" }}>
            Line 2 efficiency:{" "}
          </Text>
          <ProgressChart
            data={progressData2}
            width={screenWidth}
            height={150}
            chartConfig={styles.chartConfig}
            withCustomBarColorFromData={true}
          />
          <Text style={{ margin: 10, fontSize: 15, fontWeight: "400" }}>
            Line 2 played together
            {" " +
              (line2DefensePoints + line2OffensePoints) +
              " points, they won " +
              (line2DefenseWins + line2OffenseWins) +
              " points"}
          </Text>
          <View style={{ borderWidth: 0.5, width: "100%" }} />
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "600" }}>
            Summary:{" "}
          </Text>
          <View style={{ width: "100%", padding: 15 }}>
            <Table borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}>
              <Row
                data={state.tableHead}
                flexArr={[1.5, 1, 1, 1]}
                style={styles.head}
                textStyle={styles.text}
              />
              <TableWrapper style={styles.wrapper}>
                <Col
                  data={state.lines}
                  style={styles.title2}
                  // heightArr={[28, 28]}
                  textStyle={styles.text}
                />
                <Col
                  data={state.tableTitle}
                  style={styles.title}
                  heightArr={[28, 28]}
                  textStyle={styles.text}
                />
                <Rows
                  data={state.tableData}
                  flexArr={[1, 1, 1]}
                  style={styles.row}
                  textStyle={styles.text}
                />
              </TableWrapper>
            </Table>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LineBuilder;

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
    marginBottom: 20,
  },
  chartConfig: {
    backgroundGradientFrom: "#fff",
    backgroundGradientFromOpacity: 0.5,
    backgroundGradientTo: "#fff",
    backgroundGradientToOpacity: 1,
    // color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  },
  head: { height: 40, backgroundColor: "#f1f8ff" },
  wrapper: { flexDirection: "row" },
  title: { flex: 1, backgroundColor: "#f1f8ff" },
  title2: { flex: 0.5, backgroundColor: "#f1f8ff" },

  row: { height: 28 },
  text: { textAlign: "center" },
});
