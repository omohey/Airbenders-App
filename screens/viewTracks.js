import { StatusBar } from "expo-status-bar";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import MyButton from "../components/MyButton";
import React, { useEffect } from "react";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import * as SQLite from "expo-sqlite";
import { FlatList, ScrollView, TextInput } from "react-native-gesture-handler";
import { Dimensions } from "react-native";
import Modal from "react-native-modal";
import DatePicker from "react-native-modern-datepicker";
import { useState, useRef } from "react";
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Cell,
} from "react-native-table-component";
import CheckBox from "expo-checkbox";
import axios from "axios";
import LottieView from "lottie-react-native";

const screenWidth = Dimensions.get("window").width;
import address from "../config.js";
const ip = address.ip;

const db = SQLite.openDatabase("game.db");

const ViewTracks = ({ route, navigation }) => {
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

  const onPlayerTrackPress = () => {
    navigation.navigate("Track Players");
  };

  //TODO:
  async function deleteTrack(id) {
    setVisible(true);
    await axios
      .delete(`${ip}/track`, {
        data: {
          id: id,
        },
      })
      .then(async (result) => {
        await new Promise((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "DELETE FROM track WHERE id = ?",
              [id],
              (txObj, resultSet) => {
                resolve(resultSet);
              },
              (txObj, error) => {
                console.log("Error", error);
                reject(error);
              }
            );
          });
        });
        await new Promise((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "DELETE FROM trackAttendance WHERE trackId = ?",
              [id],
              (txObj, resultSet) => {
                resolve(resultSet);
              },
              (txObj, error) => {
                console.log("Error", error);
                reject(error);
              }
            );
          });
        });
        setVisible(false);
        getAllPlayers();
      })
      .catch((err) => {
        console.log(err);
        setVisible(false);
        Alert.alert("Error", "Something went wrong, try again");
      });
  }

  const isAdmin = route.params.isAdmin;
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [isModalVisible2, setModalVisible2] = React.useState(false);

  const [allPlayers, setAllPlayers] = useState([]);
  const [visible, setVisible] = useState(false);
  const [allTracks, setAllTracks] = useState([]);
  const [playersEdit, setPlayersEdit] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(0);
  const [selectedTrackWeek, setSelectedTrackWeek] = useState(0);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const toggleModal2 = () => {
    setModalVisible2(!isModalVisible2);
  };
  const addModal = () => {
    toggleModal();
    setSelectedTrackWeek(0);
  };

  const updateTrack = async () => {
    setVisible(true);
    await axios
      .delete(`${ip}/trackPlayers`, {
        data: {
          id: selectedTrackId,
        },
      })
      .then(async (result) => {
        let id = selectedTrackId;
        let players = playersEdit.map((player) => {
          return player;
        });

        let values = "";
        for (let i = 0; i < players.length; i++) {
          values += `('${id}','${players[i][0]}','${players[i][1] ? 1 : 0}','${
            players[i][2] ? 1 : 0
          }')`;
          if (i !== players.length - 1) {
            values += ",";
          }
        }
        await axios
          .post(`${ip}/trackPlayers`, {
            values: values,
          })
          .then(async (result) => {
            let updated = await new Promise((resolve, reject) => {
              db.transaction((tx) => {
                tx.executeSql(
                  "SELECT lastUpdate FROM track WHERE id = ?",
                  [id],
                  (txObj, { rows: { _array } }) => {
                    resolve(_array[0].lastUpdate);
                  },
                  (txObj, error) => {
                    console.log("Error", error);
                    reject(error);
                  }
                );
              });
            });
            updated += 1;

            await axios.put(`${ip}/track`, {
              id: id,
              update: updated,
            });

            let trackId = selectedTrackId;
            let players = playersEdit.map((player) => {
              return player;
            });
            let values = "";
            for (let i = 0; i < players.length; i++) {
              values += `('${trackId}','${players[i][0]}','${
                players[i][1] ? 1 : 0
              }','${players[i][2] ? 1 : 0}')`;
              if (i !== players.length - 1) {
                values += ",";
              }
            }

            await new Promise((resolve, reject) => {
              db.transaction((tx) => {
                tx.executeSql(
                  "DELETE FROM trackAttendance WHERE trackId = ?",
                  [trackId],
                  (txObj, resultSet) => {
                    resolve(resultSet);
                  },
                  (txObj, error) => {
                    console.log("Error", error);
                    reject(error);
                  }
                );
              });
            });

            await new Promise((resolve, reject) => {
              db.transaction((tx) => {
                tx.executeSql(
                  `insert into trackAttendance (trackId,playerName,isAttending,isExecused) values ${values}`,
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

            await new Promise((resolve, reject) => {
              db.transaction((tx) => {
                tx.executeSql(
                  "UPDATE track SET lastUpdate = ? WHERE id = ?",
                  [updated, trackId],
                  (txObj, resultSet) => {
                    resolve(resultSet);
                  },
                  (txObj, error) => {
                    console.log("Error", error);
                    reject(error);
                  }
                );
              });
            });

            setVisible(false);
            getAllPlayers();
            toggleModal2();
          })
          .catch((err) => {
            console.log(err);
            setVisible(false);
            Alert.alert("Error", "Something went wrong, try again");
          });
      })
      .catch((err) => {
        console.log(err);
        setVisible(false);
        Alert.alert("Error", "Something went wrong, try again");
      });
  };

  const addTrack = async () => {
    setVisible(true);
    let result = await axios
      .post(`${ip}/track`, {
        week: selectedTrackWeek,
        players: allPlayers,
      })
      .then(async (result) => {
        let trackId = result.data.insertId;
        let players = allPlayers.map((player) => {
          return player;
        });
        let values = "";
        for (let i = 0; i < players.length; i++) {
          values += `('${trackId}','${players[i][0]}','${
            players[i][1] ? 1 : 0
          }','${players[i][2] ? 1 : 0}')`;
          if (i !== players.length - 1) {
            values += ",";
          }
        }

        await new Promise((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              `insert into track (id,week) values (?,?)`,
              [trackId, selectedTrackWeek],
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
              `insert into trackAttendance (trackId,playerName,isAttending,isExecused) values ${values}`,
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
        setVisible(false);
        getAllPlayers();
        toggleModal();
      })
      .catch((err) => {
        console.log(err);
        setVisible(false);
        Alert.alert("Error", "Something went wrong, try again");
      });
  };

  async function getAllPlayers() {
    // use mysql to get all players

    // db.transaction((tx) => {
    //   tx.executeSql(
    //     "delete  from playersToCome;",
    //     [],
    //     (txObj, results) => {
    //       console.log("r", results);
    //     },
    //     (txObj, error) => {
    //       console.log(error);
    //     }
    //   );
    // });

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
      return [player.name, false, false];
    });

    setAllPlayers(localPlayerNames);

    let tracks = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "select id, week, SUM(isAttending) as attended, SUM(isExecused) as execused, count(*) as total from track INNER JOIN trackAttendance ON id = trackId GROUP BY id, week",
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
    let tracksArray = [];
    for (let i = 0; i < tracks.length; i++) {
      let week = tracks[i].week;
      tracksArray.push([
        week,
        tracks[i].attended,
        tracks[i].execused,
        tracks[i].total,
        tracks[i].id,
      ]);
    }
    setAllTracks(tracksArray);
  }

  useEffect(() => {
    // getAllPlayers();
    refreshPage();
  }, []);

  const tableHead = ["Name", "Attended", "Excused"];

  const refreshPage = async () => {
    await refresh();
    getAllPlayers();
  };

  const refresh = async () => {
    setVisible(true);
    let tracks = await axios
      .get(`${ip}/track`)
      .then((result) => {
        return result.data;
      })
      .catch((err) => {
        Alert.alert("Error", "Something went wrong, try again");
        setVisible(false);
        console.log(err);
      });
    let tracksLocal = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "select * from track",
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
    let newTracks = [];
    let updatedTracks = [];
    let deletedTracks = [];
    for (let i = 0; i < tracks.length; i++) {
      let track = tracks[i];
      let trackLocal = tracksLocal.find((p) => p.id === track.id);
      if (!trackLocal) {
        newTracks.push(track);
      }
      if (trackLocal) {
        if (trackLocal.lastUpdate !== track.lastUpdate) {
          updatedTracks.push(track);
        }
      }
    }

    for (let i = 0; i < tracksLocal.length; i++) {
      let trackLocal = tracksLocal[i];
      let track = tracks.find((p) => p.id === trackLocal.id);
      if (!track) {
        deletedTracks.push(trackLocal);
      }
    }

    let deletedTrackIds = deletedTracks.map((track) => {
      return track.id;
    });
    let deleteset = "";
    for (let i = 0; i < deletedTrackIds.length; i++) {
      deleteset += `${deletedTrackIds[i]},`;
    }
    deleteset = deleteset.slice(0, -1);
    if (deletedTrackIds.length !== 0) {
      db.transaction((tx) => {
        tx.executeSql(
          `delete from track where id in (${deleteset});`,
          [],
          (_, { rows: { _array } }) => {
            // console.log(_array);
          },
          (_, error) => {
            console.log(error);
          }
        );
      });
      db.transaction((tx) => {
        tx.executeSql(
          `delete from trackAttendance where trackId in (${deleteset});`,
          [],
          (_, { rows: { _array } }) => {
            // console.log(_array);
          },
          (_, error) => {
            console.log(error);
          }
        );
      });
    }

    let newANDUpdatedTracks = [...newTracks, ...updatedTracks];
    if (newANDUpdatedTracks.length === 0) {
      setVisible(false);
      return;
    }
    let newANDUpdatedTrackIds = newANDUpdatedTracks.map((track) => {
      return track.id;
    });

    let trackAttendance = await axios
      .get(`${ip}/trackPlayers`)
      .then((result) => {
        return result.data;
      })
      .catch((err) => {
        Alert.alert("Error", "Something went wrong, try again");
        setVisible(false);
        console.log(err);
      });

    let newANDUpdatedTrackAttendance = trackAttendance.filter((player) => {
      return newANDUpdatedTrackIds.includes(player.trackId);
    });

    for (let i = 0; i < newTracks.length; i++) {
      let track = newTracks[i];
      db.transaction((tx) => {
        tx.executeSql(
          "insert into track (id, week, lastUpdate) values (?, ?, ?)",
          [track.id, track.week, track.lastUpdate],
          (_, { rows: { _array } }) => {
            // console.log(_array);
          },
          (_, error) => {
            console.log(error);
          }
        );
      });
    }

    for (let i = 0; i < updatedTracks.length; i++) {
      let track = updatedTracks[i];
      db.transaction((tx) => {
        tx.executeSql(
          "update track set lastUpdate = ? where id = ?",
          [track.lastUpdate, track.id],
          (_, { rows: { _array } }) => {
            // console.log(_array);
          },
          (_, error) => {
            console.log(error);
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            "delete from trackAttendance where trackId = ?",
            [track.id],
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

    for (let i = 0; i < newANDUpdatedTrackAttendance.length; i++) {
      let player = newANDUpdatedTrackAttendance[i];
      db.transaction((tx) => {
        tx.executeSql(
          "insert into trackAttendance (trackId, playerName, isAttending, isExecused) values (?, ?, ?, ?)",
          [
            player.trackId,
            player.playerName,
            player.isAttending,
            player.isExecused,
          ],
          (_, { rows: { _array } }) => {
            // console.log(_array);
          },
          (_, error) => {
            console.log(error);
          }
        );
      });
    }

    setVisible(false);
  };
  return (
    <View style={styles.container}>
      <Modal
        isVisible={isModalVisible}
        // onBackButtonPress={toggleModal}
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
          <ScrollView
            style={{ width: "100%", height: "100%" }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              // backgroundColor: "#fff",
            }}
            scrollEnabled={true}
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
                <View style={{ width: "100%", flexDirection: "row" }}>
                  <Text style={{ padding: 10, fontSize: 15 }}>
                    {"Week Number: "}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    onChangeText={(text) => {
                      setSelectedTrackWeek(parseInt(text));
                    }}
                    value={selectedTrackWeek}
                  />
                </View>

                {selectedTrackWeek !== 0 && (
                  <View>
                    <Text style={{ padding: 10, fontSize: 15 }}>
                      Who Attended?
                    </Text>
                    <Table
                      borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}
                    >
                      <Row
                        data={tableHead}
                        style={styles.head}
                        textStyle={styles.text}
                      />
                      {allPlayers.map((rowData, index) => (
                        <TableWrapper
                          key={index}
                          style={index % 2 === 0 ? styles.row : styles.row1}
                        >
                          {rowData.map((cellData, cellIndex) => (
                            <Cell
                              key={cellIndex}
                              data={
                                cellIndex === 0 ? (
                                  cellData
                                ) : (
                                  <TouchableOpacity>
                                    <View>
                                      <CheckBox
                                        disabled={
                                          cellIndex === 2
                                            ? allPlayers[index][1]
                                            : allPlayers[index][2]
                                        }
                                        value={allPlayers[index][cellIndex]}
                                        onValueChange={(newValue) => {
                                          let ap = allPlayers.map((player) => {
                                            return player;
                                          });
                                          ap[index][cellIndex] = newValue;
                                          setAllPlayers(ap);
                                        }}
                                        style={{ margin: 10 }}
                                      />
                                    </View>
                                  </TouchableOpacity>
                                )
                              }
                              textStyle={styles.text}
                            />
                          ))}
                        </TableWrapper>
                      ))}
                    </Table>
                    <MyButton text="Save" onPress={addTrack} />
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
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
              <Text>Saving...</Text>
            </View>
          )}
        </View>
      </Modal>
      <Modal
        isVisible={isModalVisible2}
        onBackButtonPress={toggleModal2}
        onBackdropPress={toggleModal2}
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
          <ScrollView
            style={{ width: "100%", height: "100%" }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              // backgroundColor: "#fff",
            }}
            scrollEnabled={true}
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
                  <Text style={{ padding: 10, fontSize: 15 }}>
                    Who Attended?
                  </Text>
                  <Table
                    borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}
                  >
                    <Row
                      data={tableHead}
                      style={styles.head}
                      textStyle={styles.text}
                    />
                    {playersEdit.map((rowData, index) => (
                      <TableWrapper
                        key={index}
                        style={index % 2 === 0 ? styles.row : styles.row1}
                      >
                        {rowData.map((cellData, cellIndex) => (
                          <Cell
                            key={cellIndex}
                            data={
                              cellIndex === 0 ? (
                                cellData
                              ) : (
                                <TouchableOpacity>
                                  <View>
                                    <CheckBox
                                      disabled={
                                        cellIndex === 2
                                          ? playersEdit[index][1]
                                          : playersEdit[index][2]
                                      }
                                      value={playersEdit[index][cellIndex]}
                                      onValueChange={(newValue) => {
                                        let ap = playersEdit.map((player) => {
                                          return player;
                                        });
                                        ap[index][cellIndex] = newValue;
                                        setPlayersEdit(ap);
                                      }}
                                      style={{ margin: 10 }}
                                    />
                                  </View>
                                </TouchableOpacity>
                              )
                            }
                            textStyle={styles.text}
                          />
                        ))}
                      </TableWrapper>
                    ))}
                  </Table>
                  <MyButton
                    text={"Save"}
                    disabled={!isAdmin}
                    onPress={updateTrack}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
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
              <Text>Saving...</Text>
            </View>
          )}
        </View>
      </Modal>
      <View
        style={{
          flexDirection: "row",
          alignContent: "space-between",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <MyButton
          text="Add Track"
          disabled={!isAdmin}
          onPress={addModal}
          width={100}
        />
        <MyButton text="Players" onPress={onPlayerTrackPress} width={100} />
        <MyButton text="Refresh" onPress={refreshPage} width={100} />
      </View>
      <View style={{ width: "100%", borderBottomWidth: 0.5 }}></View>
      <FlatList
        style={{ width: "100%" }}
        data={allTracks}
        renderItem={({ item }) => {
          return (
            <Pressable
              onPress={() => {
                db.transaction((tx) => {
                  tx.executeSql(
                    "SELECT * FROM trackAttendance WHERE trackId = ?",
                    [item[4]],
                    (tx, results) => {
                      let allPlayers = [];
                      for (let i = 0; i < results.rows.length; ++i) {
                        allPlayers.push([
                          results.rows.item(i).playerName,
                          results.rows.item(i).isAttending === 1 ? true : false,
                          results.rows.item(i).isExecused === 1 ? true : false,
                        ]);
                      }
                      setPlayersEdit(allPlayers);
                      setSelectedTrackId(item[4]);
                    }
                  );
                });

                toggleModal2();
              }}
              onLongPress={() => {
                if (isAdmin) {
                  Alert.alert(
                    "Delete Track",
                    "Are you sure you want to delete this track?",
                    [
                      {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel",
                      },
                      {
                        text: "Yes",
                        onPress: () => {
                          deleteTrack(item[4]);
                        },
                        style: "destructive",
                      },
                    ],
                    { cancelable: true }
                  );
                }
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
                  <Image
                    source={require("../assets/icons/date.png")}
                    style={{ width: 30, height: 30, marginRight: 10 }}
                  ></Image>
                  <Text>{"Week " + item[0]}</Text>
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
                  <Text>{item[1]}</Text>
                  <Image
                    source={require("../assets/icons/cross.png")}
                    style={{ width: 30, height: 30, marginHorizontal: 10 }}
                  ></Image>
                  <Text>{item[3] - item[1] - item[2]}</Text>
                  <Image
                    source={require("../assets/icons/excused.png")}
                    style={{ width: 30, height: 30, marginHorizontal: 10 }}
                  ></Image>
                  <Text>{item[2]}</Text>
                </View>
                {/* <Text>Excused:{" " + item[2]}</Text> */}
                <View style={{ width: "100%", borderBottomWidth: 0.5 }}></View>
              </View>
            </Pressable>
          );
        }}
      />
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
          <Text>Saving...</Text>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
};

export default ViewTracks;

const styles = StyleSheet.create({
  row: { flexDirection: "row", backgroundColor: "#f1f8ff" },
  row1: { flexDirection: "row", backgroundColor: "#fff" },

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
  lottie: {
    width: 100,
    height: 100,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#808080",
    backgroundColor: "#bfbfbd",
    color: "#120438",
    borderRadius: 8,
    flex: 2,
    padding: 10,
    margin: 3,
    height: 40,
  },
});
