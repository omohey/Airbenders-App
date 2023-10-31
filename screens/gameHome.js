import { StatusBar } from "expo-status-bar";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Alert,
} from "react-native";
import Modal from "react-native-modal";

import MyButton from "../components/MyButton";
import { SelectList } from "react-native-dropdown-select-list";
import React, { useEffect, useRef, useState } from "react";
import CheckBox from "expo-checkbox";
import * as SQLite from "expo-sqlite";
import axios from "axios";
import LottieView from "lottie-react-native";

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

const GameHome = ({ route, navigation }) => {
  const db = SQLite.openDatabase("game.db");

  const [isCheckBoxDisabled, setIsCheckboxDisabled] = useState(false);

  const [visible, setVisible] = useState(false);
  const isSuccessfull = useRef(false);
  const {
    opponent,
    timestamp,
    category,
    home,
    myScore,
    startOffence,
    theirScore,
    pointCap
  } = route.params.game;
  const isAdmin = route.params.isAdmin;

  const [toggleCheckBox, setToggleCheckBox] = useState(false);

  function changeCheckbox() {
    setToggleCheckBox(!toggleCheckBox);
  }
  const [paddingCheckbox, setPaddingCheckbox] = useState(0);
  const onLayout = (event) => {
    const { x, y, height, width } = event.nativeEvent.layout;
    setPaddingCheckbox(x);
  };

  async function onCheckboxChange(newValue) {
    if (isCheckBoxDisabled) {
      return;
    }

    setToggleCheckBox(newValue);

    await db.transaction((tx) => {
      tx.executeSql(
        `
        UPDATE game SET startOffence = ${
          newValue ? 1 : 0
        } WHERE timestamp = "${timestamp}" AND opponent = "${opponent}";
        `,
        null,
        (tx, results) => {
          // console.log("Query completed");
          // console.log(results);
        },
        (tx, error) => {
          console.log("Error: " + error);
        }
      );
    });

    axios({
      method: "put",
      url: ip + "/gameUpdateOffence",
      data: {
        timestamp: timestamp,
        opponent: opponent,
        newValue: newValue,
      },
    })
      .then((response) => {
        // console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  function renderDetails() {
    return (
      <View width="100%">
        <View style={styles.details}>
          <View
            onLayout={onLayout}
            style={{ paddingHorizontal: 20, backgroundColor: "#fff" }}
          >
            <Text style={styles.text}>Time:</Text>
            <Text style={styles.text}>Opponent:</Text>
            <Text style={styles.text}>Tournament:</Text>
          </View>
          <View>
            <Text style={styles.text2}>{timestamp}</Text>
            <Text style={styles.text2}>{opponent}</Text>
            <Text style={styles.text2}>{category}</Text>
          </View>
        </View>
        <View>
          <Pressable onPress={changeCheckbox}>
            <View paddingLeft={20}>
              <View
                style={[styles.container2, { paddingLeft: paddingCheckbox }]}
              >
                <Text style={styles.text}>Starting on Offence?</Text>
                <CheckBox
                  disabled={isCheckBoxDisabled}
                  value={toggleCheckBox}
                  onValueChange={(newValue) => onCheckboxChange(newValue)}
                  style={{ marginLeft: 10 }}
                />
              </View>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  function onScreenLoad() {
    // console.log(timestamp);

    // console.log(opponent);

    db.transaction((tx) => {
      tx.executeSql(
        `
        SELECT startOffence FROM game WHERE timestamp = "${timestamp}" AND opponent = "${opponent}";
        `,
        null,
        (tx, results) => {
          // console.log(results);
          if (results.rows._array[0].startOffence === 1) {
            setToggleCheckBox(true);
          } else {
            setToggleCheckBox(false);
          }
        },
        (tx, error) => {
          console.log("Error: " + error);
        }
      );
    });
    //check if we recorded any actions for this game
    db.transaction((tx) => {
      tx.executeSql(
        `
        SELECT COUNT(*) FROM actionPerformed WHERE gameTimestamp = "${timestamp}" AND opponent = "${opponent}";
        `,
        null,
        (tx, results) => {
          // console.log("Query completed");
          // console.log(results.rows._array);

          if (results.rows._array[0]["COUNT(*)"] !== 0) {
            setIsCheckboxDisabled(true);
          } else {
            setIsCheckboxDisabled(false);
          }
        },
        (tx, error) => {
          console.log("Error: " + error);
        }
      );
    });

    if (myScore === -1) {
      setMys(0);
    }
    if (theirScore === -1) {
      setTheirs(0);
    }
    if (myScore !== -1 && theirScore !== -1) {
      setMys(myScore);
      setTheirs(theirScore);
    } else if (myScore !== -1) {
      setMys(myScore);
    } else if (theirScore !== -1) {
      setTheirs(theirScore);
    }

    if (myScore > theirScore) {
      setWinlossStr("Won");
    } else if (myScore < theirScore) {
      setWinlossStr("Lost");
    } else {
      setWinlossStr("Draw");
    }
  }

  useEffect(() => {
    onScreenLoad();
  }, []);

  const [winlossStr, setWinlossStr] = useState("");
  const [mys, setMys] = useState(-1);
  const [theirs, setTheirs] = useState(-1);

  function renderScore() {
    return (
      <Text style={[styles.text, { alignSelf: "center" }]}>
        {mys} - {theirs} ({winlossStr})
      </Text>
    );
  }

  function doneUpload(status) {
    setVisible(false);
    if (status === 1) {
      Alert.alert("Upload successful");
    } else {
      Alert.alert("Upload failed", "Server error please try again.");
    }
  }

  async function uploadGametoDB() {
    // first delete all records for this game on the server
    setVisible(true);
    isSuccessfull.current = true;

    await axios({
      method: "delete",
      url: ip + "/game/" + opponent + "/" + timestamp,
      data: {},
    })
      .then(function (response) {
        // console.log(response);
      })
      .catch(function (error) {
        console.log("error3: ", error);
        doneUpload(0);
        isSuccessfull.current = false;
      });
    await axios({
      method: "delete",
      url: ip + "/gameActions/" + opponent + "/" + timestamp,
      data: {},
    })
      .then(function (response) {
        // console.log(response);
      })
      .catch(function (error) {
        console.warn(error);
        doneUpload(0);
        isSuccessfull.current = false;
      });

    //get game details from local db
    let gameDetails = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `
          SELECT * FROM game WHERE timestamp = "${timestamp}" AND opponent = "${opponent}";
          `,
          null,
          (tx, results) => {
            resolve(results.rows._array[0]);
          },
          (tx, error) => {
            console.log("Error2: " + error);
            doneUpload(0);
            isSuccessfull.current = false;
          }
        );
      });
    });

    // then upload all records for this game to the server
    await axios({
      method: "post",
      url: ip + "/gameDetails",
      data: {
        opponent: gameDetails.opponent,
        timestamp: timestamp,
        myScore: gameDetails.myScore,
        theirScore: gameDetails.theirScore,
        isHome: gameDetails.home,
        category: gameDetails.category,
        startOffence: gameDetails.startOffence,
      },
    })
      .then(function (response) {
        // console.log(response);
      })
      .catch(function (error) {
        console.log("post 2", error);
        doneUpload(0);
        isSuccessfull.current = false;
      });

    //get game actions from local db
    let gameActions = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `
          SELECT * FROM actionPerformed WHERE gameTimestamp = "${timestamp}" AND opponent = "${opponent}";
          `,
          null,
          (tx, results) => {
            // console.log("Query completed");
            // console.log(results);
            resolve(results.rows._array);
          },
          (tx, error) => {
            console.log("Error: " + error);
            doneUpload(0);
            isSuccessfull.current = false;
          }
        );
      });
    });
    // TODO: update to include offense / defence
    let values = "";
    for (let i = 0; i < gameActions.length; i++) {
      values += "('" + gameActions[i].opponent + "','" + timestamp;
      if (gameActions[i].playerName !== null) {
        values += "','" + gameActions[i].playerName + "','";
      } else {
        values += "',null,'";
      }
      values += gameActions[i].action + "','" + gameActions[i].point;
      if (gameActions[i].associatedPlayer !== null) {
        values += "','" + gameActions[i].associatedPlayer + "',";
      } else {
        values += "',null,";
      }
      if (gameActions[i].offence !== null) {
        values += "'" + gameActions[i].offence + "'),";
      } else {
        values += "null),";
      }
    }
    values = values.slice(0, -1);

    await axios({
      method: "post",
      url: ip + "/gameActions",
      data: {
        values: values,
      },
    })
      .then(function (response) {
        // console.warn(response);
      })

      .catch(function (error) {
        console.log("post", error);
        doneUpload(0);
        isSuccessfull.current = false;
      });

    if (isSuccessfull.current) {
      doneUpload(1);
    } else {
      // doneUpload(0);
    }
  }
  function uploadGame() {
    Alert.alert(
      "Warning",
      "Please make sure you have the latest version of this game. If you upload an older version than the one on the server, the latest updates will be lost forever.",
      [
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            uploadGametoDB();
          },
        },
        { text: "No", style: "cancel" },
      ],
      {
        cancelable: true,
      }
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          width: "100%",
          alignItems: "flex-end",
          // borderBottomWidth: 0.5,
        }}
      >
        <MyButton
          text={"Upload Game Online"}
          onPress={uploadGame}
          width={200}
          disabled={!isAdmin}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Image source={mayhemLogo} style={styles.image} />
        <View justifyContent="center">
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
              justifyContent: "flex-end",
            }}
          >
            vs.
          </Text>
        </View>
        <Image
          source={allImages[opponent.toLowerCase()]}
          style={styles.image}
        />
      </View>
      {/* Display the items from renderDetails() */}
      {renderScore()}

      {renderDetails()}
      <View
        style={{
          // paddingTop: 20,
          width: "100%",
          alignItems: "center",
          flex: 1,
          justifyContent: "center",
          // marginBottom: 75,
        }}
      >
        <MyButton
          onPress={() =>
            navigation.navigate("Record Game", {
              opponent: opponent,
              timestamp: timestamp,
              pointCap: pointCap,
              startOffence: Boolean(toggleCheckBox),
            })
          }
          text={"Start/Continue Recording"}
        />
        <MyButton
          onPress={() =>
            navigation.navigate("View Game Events", {
              opponent: opponent,
              timestamp: timestamp,
            })
          }
          text={"View Events"}
        />
        <MyButton
          onPress={() =>
            navigation.navigate("View Game Stats", {
              opponent: opponent,
              timestamp: timestamp,
            })
          }
          text={"View Stats"}
        />
        <MyButton
          onPress={() =>
            navigation.navigate("View Player Stats", {
              opponent: opponent,
              timestamp: timestamp,
            })
          }
          text={"Player Stats"}
        />
      </View>
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
            zIndex: 100,
          }}
        >
          <LottieView
            source={require("../assets/animations.json")}
            style={styles.lottie}
            autoPlay
          />
          <Text>Uploading Game...</Text>
        </View>
      )}
    </View>
  );
};

export default GameHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  container2: {
    flex: 0,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    flexDirection: "row",
  },
  image: {
    width: 70,
    height: 70,
    margin: 20,
  },
  text: { fontSize: 16, color: "#000000", marginVertical: 5 },
  text2: { fontSize: 16, color: "#808080", marginVertical: 5 },
  details: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#fff",
    paddingTop: 30,
    alignContent: "center",
    justifyContent: "center",
  },
  lottie: {
    width: 100,
    height: 100,
  },
});
