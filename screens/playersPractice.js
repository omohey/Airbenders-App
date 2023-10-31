import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View, Image } from "react-native";
import MyButton from "../components/MyButton";
import React, { useEffect } from "react";
import axios from "axios";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import * as SQLite from "expo-sqlite";
import { FlatList } from "react-native-gesture-handler";
import { Dimensions } from "react-native";
import Modal from "react-native-modal";
import { ScrollView } from "react-native-gesture-handler";
const screenWidth = Dimensions.get("window").width;
import address from "../config.js";
const ip = address.ip;

const db = SQLite.openDatabase("game.db");

const PlayersPractice = ({ route, navigation }) => {
  //   const isAdmin = route.params.isAdmin;
  const getWeekDay = (day) => {
    switch (day) {
      case 0:
        return "Sunday";
      case 1:
        return "Monday";
      case 2:
        return "Tuesday";
      case 3:
        return "Wednesday";
      case 4:
        return "Thursday";
      case 5:
        return "Friday";
      case 6:
        return "Saturday";
    }
  };

  const [players, setPlayers] = React.useState([]);
  const [selectedPlayer, setSelectedPlayer] = React.useState("");
  const [playerGames, setPlayerGames] = React.useState([]);
  const [isModalVisible, setModalVisible] = React.useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT playerName, SUM(isAttending) as attended, SUM(isExecused) as excused, COUNT(*) as total FROM playersToCome GROUP BY playerName;",
        [],
        (_, { rows: { _array } }) => {
          setPlayers(_array);
          //   console.log(_array);
        },
        (t, error) => {
          console.log("error", error);
        }
      );
    });
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={{
          width: "100%",
          alignContent: "center",
          justifyContent: "space-between",
          alignItems: "center",
          flex: 5,
        }}
      >
        <FlatList
          data={players}
          style={{ width: "100%" }}
          renderItem={({ item }) => (
            <Pressable
              onPress={async () => {
                setSelectedPlayer(item.playerName);
                await new Promise((resolve, reject) => {
                  db.transaction((tx) => {
                    tx.executeSql(
                      "SELECT date, isAttending as attended, isExecused as excused FROM playersToCome INNER JOIN practice ON practiceId = id WHERE playerName = ?;",
                      [item.playerName],
                      (_, { rows: { _array } }) => {
                        _array.forEach((element) => {
                          let D = new Date(element.date);
                          let day = getWeekDay(D.getDay());
                          // console.log(day);
                          element.date =
                            day +
                            " " +
                            D.getDate() +
                            "/" +
                            (D.getMonth() + 1) +
                            "/" +
                            D.getFullYear();
                        });
                        // console.log(_array);
                        setPlayerGames(_array);
                        resolve();
                      },
                      (t, error) => {
                        console.log("error", error);
                        reject();
                      }
                    );
                  });
                });
                toggleModal();
              }}
              style={({ pressed }) => pressed && { opacity: 0.5 }}
            >
              <View style={{ width: "100%", padding: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignContent: "center",
                    alignItems: "center",
                    // justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "600" }}>
                    {item.playerName}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignContent: "center",
                    alignItems: "center",
                    // justifyContent: "center",
                  }}
                >
                  <Image
                    source={require("../assets/icons/tick.png")}
                    style={{ width: 30, height: 30, marginRight: 10 }}
                  ></Image>
                  <Text>{item.attended}</Text>
                  <Image
                    source={require("../assets/icons/cross.png")}
                    style={{ width: 30, height: 30, marginHorizontal: 10 }}
                  ></Image>
                  <Text>{item.total - item.attended - item.excused}</Text>
                  <Image
                    source={require("../assets/icons/excused.png")}
                    style={{ width: 30, height: 30, marginHorizontal: 10 }}
                  ></Image>
                  <Text>{item.excused}</Text>
                </View>
              </View>
              <View style={{ width: "100%", borderBottomWidth: 0.5 }}></View>
            </Pressable>
          )}
          keyExtractor={(item) => item.playerName}
        />
      </View>
      <Modal
        isVisible={isModalVisible}
        onBackButtonPress={toggleModal}
        onBackdropPress={toggleModal}
      >
        <View
          style={{
            height: "90%",
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
            width: "100%",

            // backgroundColor: "#fff",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
              width: "100%",
              paddingVertical: 10,
            }}
          >
            <View style={{ width: "90%", backgroundColor: "#fff" }}>
              <View>
                {/* <Text style={{ padding: 10, fontSize: 15 }}>
                    Who Attended?
                  </Text> */}
                <FlatList
                  data={playerGames}
                  style={{ width: "100%" }}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        width: "100%",
                        padding: 10,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: "600" }}>
                        {item.date}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignContent: "center",
                          alignItems: "center",
                          // justifyContent: "center",
                        }}
                      >
                        <Image
                          source={
                            item.attended
                              ? require("../assets/icons/tick.png")
                              : item.excused
                              ? require("../assets/icons/excused.png")
                              : require("../assets/icons/cross.png")
                          }
                          style={{ width: 30, height: 30, marginRight: 10 }}
                        ></Image>
                      </View>
                    </View>
                  )}
                  keyExtractor={(item) => item.date}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
};

export default PlayersPractice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  image: {
    width: 200,
    height: 200,
    margin: 20,
    marginBottom: 20,
  },
  head: { height: 40, backgroundColor: "#bedfff" },
  text: { margin: 6 },
  row: { flexDirection: "row", backgroundColor: "#f1f8ff" },
  row1: { flexDirection: "row", backgroundColor: "#fff" },
});
