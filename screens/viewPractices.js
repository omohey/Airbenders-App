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
import { FlatList, ScrollView } from "react-native-gesture-handler";
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

const ViewPractices = ({ route, navigation }) => {
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

  const onPlayerPracticePress = () => {
    navigation.navigate("Player Attendance");
  };

  async function deletePractice(id) {
    setVisible(true);
    await axios
      .delete(`${ip}/practice`, {
        data: {
          id: id,
        },
      })
      .then(async (result) => {
        await new Promise((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "DELETE FROM practice WHERE id = ?",
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
              "DELETE FROM playersToCome WHERE practiceId = ?",
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

  const [selectedDate, setSelectedDate] = useState("");
  const DateOnly =
    selectedDate === ""
      ? ""
      : selectedDate.split(" ")[0].replace("/", "-").replace("/", "-");
  const [datepickerVisible, setDatepickerVisible] = useState(false);
  const [allPlayers, setAllPlayers] = useState([]);
  const [visible, setVisible] = useState(false);
  const [allPractices, setAllPractices] = useState([]);
  const [playersEdit, setPlayersEdit] = useState([]);
  const [selectedPracticeId, setSelectedPracticeId] = useState(0);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const toggleModal2 = () => {
    setModalVisible2(!isModalVisible2);
  };
  const addModal = () => {
    toggleModal();
    setSelectedDate("");
  };

  const updatePractice = async () => {
    setVisible(true);
    await axios
      .delete(`${ip}/practicePlayers`, {
        data: {
          id: selectedPracticeId,
        },
      })
      .then(async (result) => {
        let id = selectedPracticeId;
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
          .post(`${ip}/practicePlayers`, {
            values: values,
          })
          .then(async (result) => {
            let updated = await new Promise((resolve, reject) => {
              db.transaction((tx) => {
                tx.executeSql(
                  "SELECT lastUpdate FROM practice WHERE id = ?",
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

            await axios.put(`${ip}/practice`, {
              id: id,
              update: updated,
            });

            let practiceId = selectedPracticeId;
            let players = playersEdit.map((player) => {
              return player;
            });
            let values = "";
            for (let i = 0; i < players.length; i++) {
              values += `('${practiceId}','${players[i][0]}','${
                players[i][1] ? 1 : 0
              }','${players[i][2] ? 1 : 0}')`;
              if (i !== players.length - 1) {
                values += ",";
              }
            }

            await new Promise((resolve, reject) => {
              db.transaction((tx) => {
                tx.executeSql(
                  "DELETE FROM playersToCome WHERE practiceId = ?",
                  [practiceId],
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
                  `insert into playersToCome (practiceId,playerName,isAttending,isExecused) values ${values}`,
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
                  "UPDATE practice SET lastUpdate = ? WHERE id = ?",
                  [updated, practiceId],
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

  const addPractice = async () => {
    setVisible(true);
    let result = await axios
      .post(`${ip}/practice`, {
        date: DateOnly,
        players: allPlayers,
      })
      .then(async (result) => {
        let practiceId = result.data.insertId;
        let players = allPlayers.map((player) => {
          return player;
        });
        let values = "";
        for (let i = 0; i < players.length; i++) {
          values += `('${practiceId}','${players[i][0]}','${
            players[i][1] ? 1 : 0
          }','${players[i][2] ? 1 : 0}')`;
          if (i !== players.length - 1) {
            values += ",";
          }
        }

        await new Promise((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              `insert into practice (id,Date) values (?,?)`,
              [practiceId, DateOnly],
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
              `insert into playersToCome (practiceId,playerName,isAttending,isExecused) values ${values}`,
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

    let practices = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          // "select * from playersToCome",
          "select id, date, SUM(isAttending) as attended, SUM(isExecused) as execused, count(*) as total from practice INNER JOIN playersToCome ON id = practiceId GROUP BY id, date",
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
    let practicesArray = [];
    for (let i = 0; i < practices.length; i++) {
      let date = practices[i].date;
      let D = new Date(date);
      let day = getWeekDay(D.getDay());
      // console.log(day);
      date =
        day +
        " " +
        D.getDate() +
        "/" +
        (D.getMonth() + 1) +
        "/" +
        D.getFullYear();
      practicesArray.push([
        date,
        practices[i].attended,
        practices[i].execused,
        practices[i].total,
        practices[i].id,
      ]);
    }
    setAllPractices(practicesArray);
  }

  useEffect(() => {
    // getAllPlayers();
    refreshPage();
  }, []);

  const refreshPage = async () => {
    await refresh();
    getAllPlayers();
  };

  const tableHead = ["Name", "Attended", "Excused"];

  const refresh = async () => {
    setVisible(true);
    let practices = await axios
      .get(`${ip}/practice`)
      .then((result) => {
        return result.data;
      })
      .catch((err) => {
        Alert.alert("Error", "Something went wrong, try again");
        setVisible(false);
        console.log(err);
      });
    let practicesLocal = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "select * from practice",
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
    // compare local and mysql practices and check for new, updated and deleted practices
    let newPractices = [];
    let updatedPractices = [];
    let deletedPractices = [];
    for (let i = 0; i < practices.length; i++) {
      let practice = practices[i];
      let practiceLocal = practicesLocal.find((p) => p.id === practice.id);
      if (!practiceLocal) {
        newPractices.push(practice);
      }
      if (practiceLocal) {
        if (practiceLocal.lastUpdate !== practice.lastUpdate) {
          updatedPractices.push(practice);
        }
      }
    }

    for (let i = 0; i < practicesLocal.length; i++) {
      let practiceLocal = practicesLocal[i];
      let practice = practices.find((p) => p.id === practiceLocal.id);
      if (!practice) {
        deletedPractices.push(practiceLocal);
      }
    }

    // remove deleted practices from local storage
    let deletedPracticesIds = deletedPractices.map((practice) => {
      return practice.id;
    });
    let deleteset = "";
    for (let i = 0; i < deletedPracticesIds.length; i++) {
      deleteset += `${deletedPracticesIds[i]},`;
    }
    deleteset = deleteset.slice(0, -1);
    if (deletedPracticesIds.length !== 0) {
      db.transaction((tx) => {
        tx.executeSql(
          `delete from practice where id in (${deleteset});`,
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
          `delete from playersToCome where practiceId in (${deleteset});`,
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

    let newANDUpdatedPractices = [...newPractices, ...updatedPractices];
    if (newANDUpdatedPractices.length === 0) {
      setVisible(false);
      return;
    }
    let newANDUpdatedPracticesIds = newANDUpdatedPractices.map((practice) => {
      return practice.id;
    });

    let playersToCome = await axios
      .get(`${ip}/practicePlayers`)
      .then((result) => {
        return result.data;
      })
      .catch((err) => {
        Alert.alert("Error", "Something went wrong, try again");
        setVisible(false);
        console.log(err);
      });

    let newANDUpdatedPlayersToCome = playersToCome.filter((player) => {
      return newANDUpdatedPracticesIds.includes(player.practiceId);
    });

    // add new practices to local storage
    for (let i = 0; i < newPractices.length; i++) {
      let practice = newPractices[i];
      db.transaction((tx) => {
        tx.executeSql(
          "insert into practice (id, date, lastUpdate) values (?, ?, ?)",
          [practice.id, practice.date, practice.lastUpdate],
          (_, { rows: { _array } }) => {
            // console.log(_array);
          },
          (_, error) => {
            console.log(error);
          }
        );
      });
    }

    // update updated practices in local storage
    for (let i = 0; i < updatedPractices.length; i++) {
      let practice = updatedPractices[i];
      db.transaction((tx) => {
        tx.executeSql(
          "update practice set lastUpdate = ? where id = ?",
          [practice.lastUpdate, practice.id],
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
            "delete from playersToCome where practiceId = ?",
            [practice.id],
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

    // add to playersToCome table
    for (let i = 0; i < newANDUpdatedPlayersToCome.length; i++) {
      let player = newANDUpdatedPlayersToCome[i];
      db.transaction((tx) => {
        tx.executeSql(
          "insert into playersToCome (practiceId, playerName, isAttending, isExecused) values (?, ?, ?, ?)",
          [
            player.practiceId,
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
              {!datepickerVisible && (
                <View style={{ width: "90%", backgroundColor: "#fff" }}>
                  <MyButton
                    text="Choose Date"
                    onPress={() => {
                      setDatepickerVisible(true);
                    }}
                    width={screenWidth * 0.4}
                  />

                  <Text style={{ padding: 10, fontSize: 15 }}>
                    {"Selected Date: \n\n" + DateOnly}
                  </Text>

                  {DateOnly !== "" && (
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
                                            let ap = allPlayers.map(
                                              (player) => {
                                                return player;
                                              }
                                            );
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
                      <MyButton text="Save" onPress={addPractice} />
                    </View>
                  )}
                </View>
              )}
              {datepickerVisible && (
                <DatePicker
                  onSelectedChange={(date) => {
                    setSelectedDate(date);
                  }}
                />
              )}

              {datepickerVisible && (
                <View
                  style={{
                    width: "100%",
                    backgroundColor: "#fff",
                    alignItems: "flex-end",
                  }}
                >
                  <MyButton
                    text="Ok"
                    width={screenWidth * 0.2}
                    onPress={() => {
                      setDatepickerVisible(false);
                    }}
                  />
                </View>
              )}
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
                    onPress={updatePractice}
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
          text="Add Practice"
          disabled={!isAdmin}
          onPress={addModal}
          width={100}
        />
        <MyButton text="Players" onPress={onPlayerPracticePress} width={100} />
        <MyButton text="Refresh" onPress={refreshPage} width={100} />
      </View>
      <View style={{ width: "100%", borderBottomWidth: 0.5 }}></View>
      <FlatList
        style={{ width: "100%" }}
        data={allPractices}
        renderItem={({ item }) => {
          return (
            <Pressable
              onPress={() => {
                db.transaction((tx) => {
                  tx.executeSql(
                    "SELECT * FROM playersToCome WHERE practiceId = ?",
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
                      setSelectedPracticeId(item[4]);
                    }
                  );
                });

                toggleModal2();
              }}
              onLongPress={() => {
                if (isAdmin) {
                  Alert.alert(
                    "Delete Practice",
                    "Are you sure you want to delete this practice?",
                    [
                      {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel",
                      },
                      {
                        text: "Yes",
                        onPress: () => {
                          deletePractice(item[4]);
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
                  <Text>{item[0]}</Text>
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

export default ViewPractices;

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
});
