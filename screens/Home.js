import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View, Image } from "react-native";
import MyButton from "../components/MyButton";
import React, { useEffect } from "react";
import axios from "axios";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import * as SQLite from "expo-sqlite";
import { FlatList } from "react-native-gesture-handler";
import { Dimensions, Alert } from "react-native";
const screenWidth = Dimensions.get("window").width;
import address from "../config.js";
const ip = address.ip;

const db = SQLite.openDatabase("game.db");


const Home = ({ route, navigation }) => {
  const isAdmin = route.params.isAdmin;
  const isTreasurer = route.params.isTreasurer;
  function onPlayerPress() {
    navigation.navigate("Add Player", { isAdmin: isAdmin });
  }

  function onAddGamePress() {
    navigation.navigate("Add Game", { isAdmin: isAdmin });
  }

  function onViewGamesPress() {
    navigation.navigate("View Games", { isAdmin: isAdmin });
  }

  function onViewStatsPress() {
    navigation.navigate("View Overall Stats");
  }

  function onPlayersStatsPress() {
    navigation.navigate("Players Overall Stats");
  }

  function onTeamStatsPress() {
    navigation.navigate("Team Stats");
  }

  function onViewPracticesPress() {
    navigation.navigate("View Practices", { isAdmin: isAdmin });
  }
  function onViewTracksPress() {
    navigation.navigate("Tracks", { isAdmin: isAdmin });
  }

  function onTreasuryPress() {
    if (isTreasurer) {
      navigation.navigate("Treasury", { isTreasurer: isTreasurer });
    } else {
      Alert.alert(
        "Warning",
        "Only treasurer is allowed to access this feature",
        [
          {
            text: "OK",
            // onPress: () => console.log("OK Pressed"),
            style: "cancel",
          },
        ],
        {
          cancelable: true,
        }
      );
    }
  }

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

    axios({
      method: "get",
      url: ip + "/players",
    })
      .then(async function (response) {
        let players = response.data;
        if (players !== undefined) {
          let playerNames = players.map((player) => {
            return player.name;
          });
          // console.log(playerNames);
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
        }

        return response.data;
      })
      .catch(function (error) {
        // console.log(error);
      });
  }

  const buttons = [
    {
      text: "Add Player",
      onPress: onPlayerPress,
      disabled: !isAdmin,
      image: require("../assets/buttonIcons/addPlayer.png"),
    },
    {
      text: "Add Game",
      onPress: onAddGamePress,
      disabled: !isAdmin,
      image: require("../assets/buttonIcons/addGame.png"),
    },
    {
      text: "View Games",
      onPress: onViewGamesPress,
      disabled: false,
      image: require("../assets/buttonIcons/viewGames.png"),
    },
    {
      text: "Overall Stats",
      onPress: onViewStatsPress,
      disabled: false,
      image: require("../assets/buttonIcons/overallStats.png"),
    },
    {
      text: "Players Stats",
      onPress: onPlayersStatsPress,
      disabled: false,
      image: require("../assets/buttonIcons/playerStats.png"),
    },
    {
      text: "Team Stats",
      onPress: onTeamStatsPress,
      disabled: false,
      image: require("../assets/buttonIcons/teamStat.png"),
    },
    {
      text: "View Attendance",
      onPress: onViewPracticesPress,
      disabled: false,
      image: require("../assets/buttonIcons/attendance.png"),
    },
    {
      text: "View Tracks",
      onPress: onViewTracksPress,
      disabled: false,
      image: require("../assets/buttonIcons/track.png"),
    },
    {
      text: "Treasury",
      onPress: onTreasuryPress,
      disabled: !isTreasurer,
      image: require("../assets/buttonIcons/treasury.png"),
    },
  ];

  const logout = () => {
    // delete local storage

    db.transaction((tx) => {
      tx.executeSql("delete from login;");
    });

    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Login",
          params: { logout: true },
        },
      ],
    });
  };

  React.useEffect(() => {
    // Use `setOptions` to update the button that we previously specified
    // Now the button includes an `onPress` handler to update the count
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={logout}
          style={({ pressed }) => pressed && { opacity: 0.5 }}
        >
          <Image
            source={require("../assets/logout.png")}
            style={{
              width: 25,
              height: 25,
            }}
          />
        </Pressable>
      ),
    });
  }, [navigation]);
  return (
    <View style={styles.container}>
      <View style={{ alignContent: "center", justifyContent: "center" }}>
        <Image style={styles.image} source={require("../assets/logo.png")} />
      </View>
      <View
        style={{
          width: "100%",
          alignContent: "center",
          justifyContent: "space-between",
          alignItems: "center",
          // flex: 1,
        }}
      >
        <FlatList
          style={{
            width: "100%",
            // flex: 1,

            // alignItems: "center",
          }}
          contentContainerStyle={{
            alignContent: "space-between",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          data={buttons}
          numColumns={3}
          renderItem={({ item, index }) => {
            return (
              <Pressable
                onPress={item.onPress}
                style={({ pressed }) => pressed && { opacity: 0.5 }}
              >
                <View
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 5,
                    margin: 5,
                  }}
                >
                  <Image
                    style={{
                      width: 0.25 * screenWidth,
                      height: 0.25 * screenWidth,
                    }}
                    source={item.image}
                  ></Image>
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      fontWeight: "500",
                    }}
                  >
                    {item.text}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        ></FlatList>
      </View>
      <StatusBar style="auto" />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    flexDirection: "column",
  },
  image: {
    width: 175,
    height: 175,
    margin: 20,
    marginBottom: 20,
  },
});
