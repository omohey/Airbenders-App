import { StatusBar } from "expo-status-bar";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  AppRegistry,
  processColor,
} from "react-native";
import MyButton from "../components/MyButton";
import React, { useEffect, useState, useRef } from "react";
import { ScrollView } from "react-native-gesture-handler";
import {
  ProgressChart,
  StackedBarChart,
  PieChart,
} from "react-native-chart-kit";
import { Dimensions } from "react-native";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import Modal from "react-native-modal";
import DropDownPicker from "react-native-dropdown-picker";
import LottieView from "lottie-react-native";
const myTheme = require("../Theme/my-theme/index.js");

DropDownPicker.addTheme("MyThemeName", myTheme);
DropDownPicker.setTheme("MyThemeName");

import * as SQLite from "expo-sqlite";

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

// CHANGETHIS
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

const db = SQLite.openDatabase("game.db");
const screenWidth = Dimensions.get("window").width;

const TeamStats = ({ navigation }) => {
  const [offensePoints, setOffensePoints] = useState(0);
  const [defensePoints, setDefensePoints] = useState(0);
  const [offenseScore, setOffenseScore] = useState(0);
  const [defenseScore, setDefenseScore] = useState(0);
  const [passesScore, setPassesScore] = useState([]);
  const [passesLoss, setPassesLoss] = useState([]);
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);
  const [heightOfScreen, setHeightOfScreen] = React.useState(0);
  let selectedGames = [];
  const [allGames, setAllGames] = React.useState([]);
  const [visible, setVisible] = React.useState(false);

  const onLayout = (event) => {
    const { x, y, height, width } = event.nativeEvent.layout;
    setHeightOfScreen(height);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const filter = () => {
    toggleModal();
  };

  React.useEffect(() => {
    // Use `setOptions` to update the button that we previously specified
    // Now the button includes an `onPress` handler to update the count
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={filter}
          style={({ pressed }) => pressed && { opacity: 0.5 }}
        >
          <Image
            source={require("../assets/filter.png")}
            style={{
              width: 25,
              height: 25,
            }}
          />
        </Pressable>
      ),
    });
  }, [navigation]);

  async function getData() {
    setVisible(true);

    let sqlactions = `select * from actionPerformed where (action = "Score" OR action = "Callahan" OR action = "They Score" OR action = "Drop" OR action = "Throwaway" OR action="Catch" or action="Deep")`;
    let sqlgames = `select * from game`;

    if (selectedGames.length === 0) {
      sqlactions += ";";
      sqlgames += ";";
    } else {
      let selectedGamesString = "(";
      for (let i = 0; i < selectedGames.length; i++) {
        selectedGamesString += "'" + selectedGames[i] + "',";
      }
      selectedGamesString = selectedGamesString.substring(
        0,
        selectedGamesString.length - 1
      );
      selectedGamesString += ")";

      sqlactions += " AND gameTimestamp in " + selectedGamesString + ";";
      sqlgames += " WHERE timestamp in " + selectedGamesString + ";";
    }

    let actions = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          sqlactions,
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

    let games = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          sqlgames,
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

    let gameTimestamps = games.map((game) => {
      return game.timestamp;
    });

    let allGames = [];

    for (let i = 0; i < gameTimestamps.length; i++) {
      let gameTimestamp = gameTimestamps[i];
      let gameActions = actions.filter((action) => {
        return action.gameTimestamp === gameTimestamp;
      });
      allGames.push({
        actions: gameActions,
        timestamp: gameTimestamp,
        startOffense: games[i]["startOffence"],
        pointCap: games[i]["pointCap"],
        halfTime: parseInt(games[i]["pointCap"] / 2) + 1,
      });
    }

    let allOffensePoints = 0;
    let allDefensePoints = 0;
    let allOffenseScore = 0;
    let allDefenseScore = 0;
    let noPassesScore = {};
    let noPassesLoss = {};

    for (let i = 0; i < allGames.length; i++) {
      let game = allGames[i];
      // console.log("game", game);
      let actions = game.actions;
      let startOffense = game.startOffense === 1 ? true : false;
      let currPointOffence = startOffense;
      let myScore = 0;
      let theirScore = 0;
      let offensePoints = 0;
      let defensePoints = 0;
      let offenseScore = 0;
      let defenseScore = 0;
      let halfTime = game.halfTime;
      let pointCap = game.pointCap;

      let point = 0;
      let passes = 0;

      for (let j = 0; j < actions.length; j++) {
        let action = actions[j];

        if (action.action === "Score" || action.action === "Callahan") {
          if (currPointOffence) {
            offensePoints++;
            offenseScore++;
          } else {
            defensePoints++;
            defenseScore++;
          }
          myScore++;
          if (myScore === halfTime) {
            currPointOffence = !startOffense;
          } else {
            currPointOffence = false;
          }
          if (action.action === "Score") {
            passes += 1;
          }
          if (passes in noPassesScore) {
            noPassesScore[passes] += 1;
          } else {
            noPassesScore[passes] = 1;
          }
          passes = 0;
        } else if (action.action === "They Score") {
          if (currPointOffence) {
            offensePoints++;
          } else {
            defensePoints++;
          }
          theirScore++;
          if (theirScore === halfTime) {
            currPointOffence = !startOffense;
          } else {
            currPointOffence = true;
          }
          if (passes in noPassesLoss) {
            noPassesLoss[passes] += 1;
          } else {
            noPassesLoss[passes] = 1;
          }
          passes = 0;
        } else if (action.action === "Drop") {
        } else if (action.action === "Throwaway") {
        } else if (action.action === "Catch" || action.action === "Deep") {
          passes += 1;
        }
      }
      allOffensePoints += offensePoints;
      allDefensePoints += defensePoints;
      allOffenseScore += offenseScore;
      allDefenseScore += defenseScore;
    }

    setOffensePoints(allOffensePoints);
    setDefensePoints(allDefensePoints);
    setOffenseScore(allOffenseScore);
    setDefenseScore(allDefenseScore);

    let pie1 = [];
    let pie2 = [];
    let count = 0;
    // for (let key in noPassesScore) {
    //   pie1.push({
    //     name: key,
    //     value: noPassesScore[key],
    //     color: pieColors[count % 22],
    //     legendFontColor: "#7F7F7F",
    //     legendFontSize: 15,
    //   });
    //   count++;
    // }

    // let newPie1 = [];
    // // count = 0;

    // console.log("pie1", pie1);
    // group every range of 5 passes
    let start = 0;
    let interval = 5;
    let passesInInterval = {};
    for (let key in noPassesScore) {
      if (parseInt(key) >= start && parseInt(key) < start + interval) {
        if (start in passesInInterval) {
          passesInInterval[start] += noPassesScore[key];
        } else {
          passesInInterval[start] = noPassesScore[key];
        }
      } else {
        let flag = true;
        while (flag) {
          start += interval;

          if (parseInt(key) >= start && parseInt(key) < start + interval) {
            passesInInterval[start] = noPassesScore[key];
            flag = false;
          }
        }
      }
    }

    for (let key in passesInInterval) {
      pie1.push({
        name: key + " - " + (parseInt(key) + interval - 1),
        value: passesInInterval[key],
        color: pieColors[count % 22],
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      });
      count++;
    }

    count = 0;
    // for (let key in noPassesLoss) {
    //   pie2.push({
    //     name: key,
    //     value: noPassesLoss[key],
    //     color: pieColors[count % 22],
    //     legendFontColor: "#7F7F7F",
    //     legendFontSize: 15,
    //   });
    //   count++;
    // }

    passesInInterval = {};
    start = 0;
    for (let key in noPassesLoss) {
      if (parseInt(key) >= start && parseInt(key) < start + interval) {
        if (start in passesInInterval) {
          passesInInterval[start] += noPassesLoss[key];
        } else {
          passesInInterval[start] = noPassesLoss[key];
        }
      } else {
        let flag = true;
        while (flag) {
          start += interval;

          if (parseInt(key) >= start && parseInt(key) < start + interval) {
            passesInInterval[start] = noPassesLoss[key];
            flag = false;
          }
        }
      }
    }

    for (let key in passesInInterval) {
      pie2.push({
        name: key + " - " + (parseInt(key) + interval - 1),
        value: passesInInterval[key],
        color: pieColors[count % 22],
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      });
      count++;
    }

    setPassesScore(pie1);
    setPassesLoss(pie2);

    setVisible(false);
  }

  const getGameCategories = async () => {
    let allGames = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT opponent, category, timestamp FROM game;",
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

    let tempGameCategories = {};

    for (let i = 0; i < allGames.length; i++) {
      let game = allGames[i];
      if (tempGameCategories[game.category] === undefined) {
        tempGameCategories[game.category] = [
          { opponent: game.opponent, timestamp: game.timestamp },
        ];
      } else {
        tempGameCategories[game.category].push({
          opponent: game.opponent,
          timestamp: game.timestamp,
        });
      }
    }

    setAllGames(tempGameCategories);

    let tempItems = [];
    for (let key in tempGameCategories) {
      let tempItem = {
        label: key,
        value: key,
        parent: null,
      };
      tempItems.push(tempItem);
      for (let i = 0; i < tempGameCategories[key].length; i++) {
        let label = tempGameCategories[key][i].opponent;
        let opponentLower = label.toLowerCase();
        let myImage =
          opponentLower in allImages
            ? allImages[opponentLower]
            : allImages["any"];
        let tempSubItem = {
          label: label,
          value: tempGameCategories[key][i].timestamp,
          parent: key,
          icon: () => <Image source={myImage} style={styles.iconStyle} />,
        };
        tempItems.push(tempSubItem);
      }
    }

    setItems(tempItems);
  };
  useEffect(() => {
    // get actionPerformed table
    getData();
    getGameCategories();
  }, []);

  const progressData = {
    labels: ["Offense", "Defense"], // optional
    data:
      offensePoints && defensePoints
        ? [offenseScore / offensePoints, defenseScore / defensePoints]
        : [0, 0],
    colors: ["#e6194b", "#3cb44b", "#4363d8"],
  };

  const applyFilter = () => {
    toggleModal();
    let tempSelectedGames = [];
    for (let i = 0; i < value.length; i++) {
      if (value[i] in allGames) {
        for (let j = 0; j < allGames[value[i]].length; j++) {
          tempSelectedGames.push(allGames[value[i]][j].timestamp);
        }
      } else {
        tempSelectedGames.push(value[i]);
      }
    }
    selectedGames = tempSelectedGames;
    getData();
  };

  return (
    <View
      style={{
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#fff",
      }}
      onLayout={onLayout}
    >
      <ScrollView>
        <View
          style={{
            flex: 1,
            width: "100%",
            borderTopWidth: 0.5,
            paddingBottom: 15,
          }}
        >
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "600" }}>
            Offense and defense efficiency:{" "}
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
              You played on offense{" "}
              <Text>
                {offensePoints} times and scored {offenseScore} of them.
              </Text>
            </Text>
            <Text>
              You played on defense{" "}
              <Text>
                {defensePoints} times and scored {defenseScore} of them.
              </Text>
            </Text>
          </View>
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "600" }}>
            Number of passes when we scored:{" "}
          </Text>
          <PieChart
            data={passesScore || []}
            width={screenWidth}
            height={200}
            chartConfig={styles.chartConfig}
            accessor="value"
          />
          <View style={{ borderBottomWidth: 0.5, paddingBottom: 5 }} />
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "600" }}>
            Number of passes when we lost the point:{" "}
          </Text>

          <PieChart
            data={passesLoss || []}
            width={screenWidth}
            height={200}
            chartConfig={styles.chartConfig}
            accessor="value"
          />
        </View>
        <View style={{ alignSelf: "center" }}>
          <MyButton
            text={"Line Builder"}
            onPress={() => navigation.navigate("Line Builder")}
          />
        </View>
      </ScrollView>
      <Modal
        isVisible={isModalVisible}
        onBackButtonPress={toggleModal}
        onBackdropPress={toggleModal}
      >
        <View
          style={{
            height: open ? "90%" : null,
            justifyContent: "flex-start",
            alignItems: "center",
            alignContent: "center",
            width: "100%",
            backgroundColor: "white",
            flexDirection: "column",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", margin: 20 }}>
            Filter Games:
          </Text>
          <View
            style={{
              padding: 10,
              height: open ? heightOfScreen * 0.9 - 120 : null,
            }}
          >
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              theme="MyThemeName"
              multiple={true}
              mode="BADGE"
              badgeDotColors={[
                "#e76f51",
                "#00b4d8",
                "#e9c46a",
                "#e76f51",
                "#8ac926",
                "#00b4d8",
                "#e9c46a",
              ]}
              placeholder="Select Games"
              // max height = parent height - 20
              maxHeight={heightOfScreen * 0.9 - 180}
              dropDownDirection="BOTTOM"
            />
          </View>
          <MyButton text="Apply" onPress={applyFilter} />
        </View>
      </Modal>
      {visible && (
        <View
          style={{
            position: "absolute",
            backgroundColor: "#fff",
            opacity: 0.5,
            backfaceVisibility: "visible",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LottieView
            source={require("../assets/animations.json")}
            style={styles.lottie}
            autoPlay
          />
          <Text>Loading...</Text>
        </View>
      )}
    </View>
  );
};

export default TeamStats;

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
  lottie: {
    width: 200,
    height: 200,
  },
  iconStyle: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
});
