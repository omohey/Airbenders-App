import React, { useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import MyButton from "../components/MyButton";
import PLayerItem from "../components/playerItem";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import * as SQLite from "expo-sqlite";
import { Keyboard } from "react-native";
import LottieView from "lottie-react-native";

import address from "../config.js";
const ip = address.ip;

const db = SQLite.openDatabase("game.db");

async function addPlayerToDB(name, email, major, number, phone) {
  await axios({
    method: "post",
    url: ip + "/players",
    data: {
      email: email,
      major: major,
      name: name,
      number: number,
      phone: phone,
    },
  })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
}

function playerInfotoNames(playersInfo) {
  var playerNames = [];
  for (let i = 0; i < playersInfo.length; i++) {
    playerNames.push(playersInfo[i].name);
  }
  return playerNames;
}

const AddPlayer = ({ route, navigation }) => {
  const isAdmin = route.params.isAdmin;
  const [enteredName, setEnteredName] = useState("");
  function nameInputHandler(enteredText) {
    setEnteredName(enteredText);
  }

  async function getPlayers() {
    // use mysql to get all players
    let players = await axios({
      method: "get",
      url: ip + "/players",
    })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });

    // get players on local storage
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
    let playerNames = playerInfotoNames(players);
    let localPlayerNames = playerInfotoNames(localPlayers);
    let newPlayers = [];
    let dirty = false;
    for (let i = 0; i < playerNames.length; i++) {
      if (!localPlayerNames.includes(playerNames[i])) {
        {
          newPlayers.push(players[i]);
          dirty = true;
        }
      }
    }

    // create values string
    if (dirty) {
      let values = "";
      for (let i = 0; i < newPlayers.length - 1; i++) {
        values +=
          "('" +
          newPlayers[i].name +
          "', '" +
          newPlayers[i].email +
          "', '" +
          newPlayers[i].major +
          "', '" +
          newPlayers[i].number +
          "', '" +
          newPlayers[i].phone +
          "'),";
      }

      values +=
        "('" +
        newPlayers[newPlayers.length - 1].name +
        "', '" +
        newPlayers[newPlayers.length - 1].email +
        "', '" +
        newPlayers[newPlayers.length - 1].major +
        "', '" +
        newPlayers[newPlayers.length - 1].number +
        "', '" +
        newPlayers[newPlayers.length - 1].phone +
        "')";

      // add new players to local storage
      await new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            "insert into player (name, email, major, number, phone) values " +
              values,
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
    }

    // see if a player is deleted on mysql
    let deletedPlayers = [];
    for (let i = 0; i < localPlayerNames.length; i++) {
      if (!playerNames.includes(localPlayerNames[i])) {
        deletedPlayers.push(localPlayerNames[i]);
      }
    }

    // delete players on local storage
    if (deletedPlayers.length > 0) {
      let values = "";
      let deleteQuery = "delete from player where name in (";
      for (let i = 0; i < deletedPlayers.length - 1; i++) {
        values += "'" + deletedPlayers[i] + "',";
      }
      values += "'" + deletedPlayers[deletedPlayers.length - 1] + "')";
      deleteQuery += values;
      // console.log(deleteQuery);
      await new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            deleteQuery,
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
    }

    return players;
  }

  const [players, setPlayers] = useState([]);
  const [enteredPlayer, setEnteredPlayer] = useState("");
  const [enteredNumber, setEnteredNumber] = useState(0);
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPhone, setEnteredPhone] = useState("");
  const [enteredMajor, setEnteredMajor] = useState("");
  const [visible, setVisible] = useState(true);

  function deletePlayerHandler(playerName) {
    if (!isAdmin) {
      return;
    }
    Alert.alert(
      "Are you sure?",
      "Do you really want to delete this player?",
      [
        { text: "No", style: "default" },

        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            setVisible(true);
            await axios({
              method: "delete",
              url: ip + "/players/" + playerName,
            })
              .then(function (response) {
                setVisible(false);
                return response.data;
              })
              .catch(function (error) {
                console.log(error);
                setVisible(false);
              });
            await new Promise((resolve, reject) => {
              db.transaction((tx) => {
                tx.executeSql(
                  "delete from player where name = ?",
                  [playerName],
                  (_, { rows: { _array } }) => {
                    resolve(_array);
                  },
                  (_, error) => {
                    reject(error);
                  }
                );
              });
            });

            await new Promise((resolve, reject) => {
              db.transaction((tx) => {
                tx.executeSql(
                  "delete from playersToCome where name = ?",
                  [playerName],
                  (_, { rows: { _array } }) => {
                    resolve(_array);
                  },
                  (_, error) => {
                    reject(error);
                  }
                );
              });
            });

            await new Promise((resolve, reject) => {
              db.transaction((tx) => {
                tx.executeSql(
                  "delete from trackAttendance where name = ?",
                  [playerName],
                  (_, { rows: { _array } }) => {
                    resolve(_array);
                  },
                  (_, error) => {
                    reject(error);
                  }
                );
              });
            });

            await new Promise((resolve, reject) => {
              db.transaction((tx) => {
                tx.executeSql(
                  "delete from treasuryEntry where name = ?",
                  [playerName],
                  (_, { rows: { _array } }) => {
                    resolve(_array);
                  },
                  (_, error) => {
                    reject(error);
                  }
                );
              });
            });

            setPlayers((currentPlayers) => {
              return currentPlayers.filter((player) => player !== playerName);
            });
          },
        },
      ],
      {
        cancelable: true,
      }
    );
  }

  function nameInputHandler(enteredText) {
    setEnteredPlayer(enteredText);
  }

  function numberInputHandler(enteredText) {
    setEnteredNumber(enteredText);
  }

  function emailInputHandler(enteredText) {
    setEnteredEmail(enteredText);
  }

  function phoneInputHandler(enteredText) {
    setEnteredPhone(enteredText);
  }

  function majorInputHandler(enteredText) {
    setEnteredMajor(enteredText);
  }

  const createOneButtonAlert = (alertTitle, alertMessage) =>
    Alert.alert(
      alertTitle,
      alertMessage,
      [{ text: "Ok", onPress: () => console.log("") }],
      {
        cancelable: true,
      }
    );

  const addPlayerHandler = () => {
    if (enteredPlayer === "") {
      createOneButtonAlert("No Name Entered", "Please enter a player name");
      return;
    }
    if (enteredNumber === 0) {
      createOneButtonAlert("No Number Entered", "Please enter a player number");
      return;
    }
    if (enteredEmail === "") {
      createOneButtonAlert("No Email Entered", "Please enter a player email");
      return;
    }
    if (enteredPhone === "") {
      createOneButtonAlert("No Phone Entered", "Please enter a player phone");
      return;
    }
    if (enteredMajor === "") {
      createOneButtonAlert("No Major Entered", "Please enter a player major");
      return;
    }
    if (players.includes(enteredPlayer)) {
      createOneButtonAlert(
        "Player Already Exists",
        "Please enter a different player name"
      );
      return;
    }
    addPlayerToDB(
      enteredPlayer,
      enteredEmail,
      enteredMajor,
      enteredNumber,
      enteredPhone
    );

    setPlayers((currentPlayers) => [...currentPlayers, enteredPlayer]);
    setEnteredPlayer("");
    setEnteredNumber(0);
    setEnteredEmail("");
    setEnteredPhone("");
    setEnteredMajor("");
  };



  const onScreenLoad = async () => {
    try {
      console.log("onScreenLoad");
      var playersInfo = await getPlayers();
      console.log("got players");
      var playerNames = playerInfotoNames(playersInfo);
      setPlayers(playerNames);
      setVisible(false);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    onScreenLoad();
  }, []);

  const ref_no = useRef();
  const ref_phone = useRef();
  const ref_major = useRef();
  const ref_email = useRef();

  return (
    <View style={styles.container}>
      <View style={styles.container2}>
        <TextInput
          onChangeText={nameInputHandler}
          style={styles.textInput}
          placeholder="Name"
          value={enteredPlayer}
          returnKeyType="next"
          // autoFocus={true}
          onSubmitEditing={() => ref_no.current.focus()}
          blurOnSubmit={false}
        />
        <TextInput
          keyboardType="numeric"
          onChangeText={numberInputHandler}
          style={{ ...styles.textInput, ...{ flex: 1 } }}
          placeholder="No"
          value={enteredNumber}
          ref={ref_no}
          returnKeyType="next"
          onSubmitEditing={() => ref_phone.current.focus()}
          blurOnSubmit={false}
        />
        <View flex={3}>
          <MyButton
            onPress={addPlayerHandler}
            flex={1}
            heightOnly={45}
            color={"#2bbf0a"}
            textColor={"#000000"}
            text="Add Player"
            disabled={!isAdmin}
          />
        </View>
      </View>
      <View style={styles.container2}>
        <TextInput
          keyboardType="numeric"
          onChangeText={phoneInputHandler}
          style={styles.textInput}
          placeholder="Phone"
          value={enteredPhone}
          ref={ref_phone}
          returnKeyType="next"
          onSubmitEditing={() => ref_major.current.focus()}
          blurOnSubmit={false}
        />
        <TextInput
          onChangeText={majorInputHandler}
          style={styles.textInput}
          placeholder="Major"
          value={enteredMajor}
          ref={ref_major}
          returnKeyType="next"
          onSubmitEditing={() => ref_email.current.focus()}
          blurOnSubmit={false}
        />
      </View>
      <View style={styles.container2}>
        <TextInput
          onChangeText={emailInputHandler}
          style={styles.textInput}
          placeholder="Email"
          value={enteredEmail}
          ref={ref_email}
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      </View>

      <View style={styles.container3}>
        <FlatList
          style={{ width: "100%" }}
          data={players}
          renderItem={({ item, index }) => {
            return <PLayerItem onPress={deletePlayerHandler} text={item} />;
          }}
          keyExtractor={(item, index) => {
            return item;
          }}
        ></FlatList>
      </View>

      {/* <AnimatedLoader
        visible={visible}
        overlayColor="rgba(255,255,255,0.3)"
        animationStyle={styles.lottie}
        speed={1}
        // source={require("../assets/animations.json")}
      >
        <Text>Loading Players...</Text>
      </AnimatedLoader> */}

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
          <Text>Loading Players...</Text>
        </View>
      )}
    </View>
  );
};

export default AddPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    // justifyContent: "center",
  },
  container3: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  container2: {
    // flex: 1,
    backgroundColor: "#fff",
    alignItems: "flex-start",
    justifyContent: "space-evenly",
    height: 60,
    width: "100%",
    flexDirection: "row",
  },

  textInput: {
    borderWidth: 1,
    borderColor: "#808080",
    backgroundColor: "#bfbfbd",
    color: "#120438",
    borderRadius: 8,
    flex: 3,
    padding: 15,
    margin: 3,
  },
  lottie: {
    width: 100,
    height: 100,
  },
});
