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

const PlayersTreasury = ({ route, navigation }) => {
  //   const isAdmin = route.params.isAdmin;

  const [players, setPlayers] = React.useState([]);
  const [selectedPlayer, setSelectedPlayer] = React.useState("");
  const [playerTreasury, setPlayerTreasury] = React.useState([]);
  const [isModalVisible, setModalVisible] = React.useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT playerName, SUM(amountOwed) as allOwed, SUM(amountPaid) as allPaid, COUNT(*) as total FROM treasuryEntry GROUP BY playerName;",
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
                      "SELECT name, amountPaid, amountOwed FROM treasuryEntry INNER JOIN treasury ON treasuryId = id WHERE playerName = ?;",
                      [item.playerName],
                      (_, { rows: { _array } }) => {
                        // console.log(_array);
                        setPlayerTreasury(_array);
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
                  <Text>{item.allPaid}</Text>
                  <Image
                    source={require("../assets/icons/cross.png")}
                    style={{ width: 30, height: 30, marginHorizontal: 10 }}
                  ></Image>
                  <Text>{item.allOwed}</Text>
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
                  data={playerTreasury}
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
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          marginRight: 20,
                        }}
                      >
                        {item.name}
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
                          source={require("../assets/icons/tick.png")}
                          style={{
                            width: 30,
                            height: 30,
                            marginHorizontal: 10,
                          }}
                        ></Image>
                        <Text>{item.amountPaid}</Text>

                        <Image
                          source={require("../assets/icons/cross.png")}
                          style={{
                            width: 30,
                            height: 30,
                            marginHorizontal: 10,
                          }}
                        ></Image>
                        <Text>{item.amountOwed}</Text>
                      </View>
                    </View>
                  )}
                  keyExtractor={(item) => item.name}
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

export default PlayersTreasury;

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
