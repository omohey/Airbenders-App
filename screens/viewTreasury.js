import { StatusBar } from "expo-status-bar";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Switch,
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

const ViewTreasury = ({ route, navigation }) => {
  const isTreasurer = route.params.isTreasurer;

  const [isModalVisible, setModalVisible] = React.useState(false);
  const [isModalVisible2, setModalVisible2] = React.useState(false);

  const [allPlayers, setAllPlayers] = useState([]);
  const [playersIncluded, setPlayersIncluded] = useState([]);
  const [visible, setVisible] = useState(false);
  const [allTreasuryItems, setAllTreasuryItems] = useState([]);
  const [playersEdit, setPlayersEdit] = useState([]);
  const [selectedTreasuryId, setSelectedTreasuryId] = useState(0);
  const [selectedTreasuryName, setSelectedTreasuryName] = useState(0);
  const [amount, setAmount] = useState(0);
  const [allPlayersSwitch, setAllPlayersSwitch] = useState(false);
  const [playersRemaining, setPlayersRemaining] = useState([]);
  const [addPlayersModal, setAddPlayersModal] = useState(false);
  const [editAmountModal, setEditAmountModal] = useState(false);
  const [editAmountSelectedPlayerIndex, setEditAmountSelectedPlayerIndex] =
    useState(-1);
  const [editAmount, setEditAmount] = useState(0);

  const toggleSwitch = () => {
    setAllPlayersSwitch((previousState) => !previousState);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const toggleModal2 = () => {
    setModalVisible2(!isModalVisible2);
  };
  const toggleBack = () => {
    setModalVisible2(true);
    setAddPlayersModal(false);
  };
  const addModal = () => {
    toggleModal();
    setSelectedTreasuryName("");
    setAmount(0);
    setAllPlayersSwitch(true);
  };

  const onPlayerTreasuryPress = () => {
    navigation.navigate("Treasury Players", { isTreasurer: isTreasurer });
  };

  async function getAllPlayers() {
    // use mysql to get all players

    // db.transaction((tx) => {
    //   tx.executeSql(
    //     "delete from treasury where id = 1;",
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
      return player.name;
    });

    let playersincluded = [];
    for (let i = 0; i < localPlayerNames.length; i++) {
      playersincluded.push(false);
    }

    setAllPlayers(localPlayerNames);
    setPlayersIncluded(playersincluded);

    let treasury = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "select id, name, SUM(amountOwed) as allAmountOwed, SUM(amountPaid) as allAmountPaid, count(*) as total from treasury INNER JOIN treasuryEntry ON id = treasuryId GROUP BY id, name",
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
    let treasuryArray = [];
    for (let i = 0; i < treasury.length; i++) {
      let name = treasury[i].name;
      treasuryArray.push({
        name: name,
        allAmountOwed: treasury[i].allAmountOwed,
        allAmountPaid: treasury[i].allAmountPaid,
        total: treasury[i].total,
        id: treasury[i].id,
      });
    }
    // console.log(treasuryArray);
    setAllTreasuryItems(treasuryArray);
  }

  useEffect(() => {
    getAllPlayers();
  }, []);

  const tableHead = ["Name", "Included?"];
  const tableHead2 = ["Name", "Add?"];

  const addTreasury = async () => {
    setVisible(true);
    let players = [];
    for (let i = 0; i < allPlayers.length; i++) {
      if (playersIncluded[i]) {
        players.push(allPlayers[i]);
      }
    }
    if (allPlayersSwitch) {
      players = allPlayers.map((player) => {
        return player;
      });
    }

    let result = await axios
      .post(`${ip}/treasury`, {
        name: selectedTreasuryName,
        players: players,
        amount: amount,
      })
      .then(async (result) => {
        let treasuryId = result.data.insertId;

        let values = "";
        for (let i = 0; i < players.length; i++) {
          values += `('${treasuryId}','${players[i]}','${amount}')`;
          if (i !== players.length - 1) {
            values += ",";
          }
        }

        await new Promise((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              `insert into treasury (id,name) values (?,?)`,
              [treasuryId, selectedTreasuryName],
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
              `insert into treasuryEntry (treasuryId,playerName,amountOwed) values ${values}`,
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

  const refresh = async () => {
    setVisible(true);
    let treasuries = await axios
      .get(`${ip}/treasury`)
      .then((result) => {
        return result.data;
      })
      .catch((err) => {
        Alert.alert("Error", "Something went wrong, try again");
        setVisible(false);
        console.log(err);
      });
    let treasuriesLocal = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "select * from treasury",
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
    let newTreasury = [];
    let updatedTreasury = [];
    let deletedTreasury = [];
    for (let i = 0; i < treasuries.length; i++) {
      let treasury = treasuries[i];
      let treasuryLocal = treasuriesLocal.find((p) => p.id === treasury.id);
      console.log("local", treasuryLocal);
      console.log("online", treasury);
      if (!treasuryLocal) {
        newTreasury.push(treasury);
      }
      if (treasuryLocal) {
        if (treasuryLocal.lastUpdate !== treasury.lastUpdate) {
          updatedTreasury.push(treasury);
        }
      }
    }

    for (let i = 0; i < treasuriesLocal.length; i++) {
      let treasuryLocal = treasuriesLocal[i];
      let treasury = treasuries.find((p) => p.id === treasuryLocal.id);
      if (!treasury) {
        deletedTreasury.push(treasuryLocal);
      }
    }

    let deletedTreasuryIds = deletedTreasury.map((treasury) => {
      return treasury.id;
    });
    let deleteset = "";
    for (let i = 0; i < deletedTreasuryIds.length; i++) {
      deleteset += `${deletedTreasuryIds[i]},`;
    }
    deleteset = deleteset.slice(0, -1);
    if (deletedTreasuryIds.length !== 0) {
      await new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            `delete from treasury where id in (${deleteset});`,
            [],
            (_, { rows: { _array } }) => {
              console.log("delete treasury:", _array);
              resolve(_array);
            },
            (_, error) => {
              console.log(error);
              reject(error);
            }
          );
        });
      });
      console.log("3");
      await new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            `delete from treasuryEntry where treasuryId in (${deleteset});`,
            [],
            (_, { rows: { _array } }) => {
              console.log("delete treasury entry:", _array);
              resolve(_array);
            },
            (_, error) => {
              console.log(error);
              reject(error);
            }
          );
        });
      });
    }

    let newANDUpdatedTreasury = [...newTreasury, ...updatedTreasury];
    if (newANDUpdatedTreasury.length === 0) {
      setVisible(false);
      return;
    }
    let newANDUpdatedTreasuryIds = newANDUpdatedTreasury.map((treasury) => {
      return treasury.id;
    });

    let treasuryPlayers = await axios
      .get(`${ip}/treasuryPlayers`)
      .then((result) => {
        return result.data;
      })
      .catch((err) => {
        Alert.alert("Error", "Something went wrong, try again");
        setVisible(false);
        console.log(err);
      });

    let newANDUpdatedTreasuryPlayers = treasuryPlayers.filter((player) => {
      return newANDUpdatedTreasuryIds.includes(player.treasuryId);
    });

    for (let i = 0; i < newTreasury.length; i++) {
      let treasury = newTreasury[i];
      db.transaction((tx) => {
        tx.executeSql(
          "insert into treasury (id, name, paidOutside, lastUpdate) values (?, ?, ?, ?)",
          [
            treasury.id,
            treasury.name,
            treasury.paidOutside,
            treasury.lastUpdate,
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

    for (let i = 0; i < updatedTreasury.length; i++) {
      let treasury = updatedTreasury[i];
      db.transaction((tx) => {
        tx.executeSql(
          "update treasury set lastUpdate = ? where id = ?",
          [treasury.lastUpdate, treasury.id],
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
            "delete from treasuryEntry where treasuryId = ?",
            [treasury.id],
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

    for (let i = 0; i < newANDUpdatedTreasuryPlayers.length; i++) {
      let player = newANDUpdatedTreasuryPlayers[i];
      db.transaction((tx) => {
        tx.executeSql(
          "insert into treasuryEntry (treasuryId, playerName, amountOwed, amountPaid) values (?, ?, ?, ?)",
          [
            player.treasuryId,
            player.playerName,
            player.amountOwed,
            player.amountPaid,
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
    getAllPlayers();
  };

  async function deleteTreasury(id) {
    setVisible(true);
    await axios
      .delete(`${ip}/treasury`, {
        data: {
          id: id,
        },
      })
      .then(async (result) => {
        await new Promise((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "DELETE FROM treasury WHERE id = ?",
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
              "DELETE FROM treasuryEntry WHERE treasuryId = ?",
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

  const payPlayer = (index) => {
    let updatedPlayers = playersEdit.map((player) => {
      return player;
    });
    updatedPlayers[index].amountPaid += updatedPlayers[index].payable;
    updatedPlayers[index].amountOwed -= updatedPlayers[index].payable;
    updatedPlayers[index].payable = 0;
    setPlayersEdit(updatedPlayers);
  };

  const addPlayers = () => {
    let playersIn = playersEdit.map((player) => {
      return player.name;
    });
    let allplayers = allPlayers.map((player) => {
      return player;
    });
    let remainingPlayers = allplayers.filter((player) => {
      return !playersIn.includes(player);
    });
    let rp = remainingPlayers.map((player) => {
      return { name: player, included: false };
    });
    setPlayersRemaining(rp);
    // setModalVisible2(false);
    setAddPlayersModal(true);
    setAmount(0);
  };

  const addPlayersToDB = async () => {
    let addedPlayers = playersRemaining.filter((player) => {
      return player.included;
    });
    let values = "";
    for (let i = 0; i < addedPlayers.length; i++) {
      values += `('${selectedTreasuryId}','${addedPlayers[i].name}','${amount}','0')`;
      if (i !== addedPlayers.length - 1) {
        values += ",";
      }
    }
    setVisible(true);
    await axios
      .post(`${ip}/treasuryPlayers`, {
        values: values,
      })
      .then(async (result) => {
        let updated = await new Promise((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT lastUpdate FROM treasury WHERE id = ?",
              [selectedTreasuryId],
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

        await axios.put(`${ip}/treasury`, {
          id: selectedTreasuryId,
          update: updated,
        });

        await new Promise((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              `insert into treasuryEntry (treasuryId, playerName, amountOwed, amountPaid) values ${values}`,
              [],
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
              "UPDATE treasury SET lastUpdate = ? WHERE id = ?",
              [updated, selectedTreasuryId],
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

        let players = playersEdit.map((player) => {
          return player;
        });
        for (let i = 0; i < addedPlayers.length; i++) {
          players.push({
            name: addedPlayers[i].name,
            amountOwed: amount,
            amountPaid: 0,
            payable: 0,
          });
        }
        setPlayersEdit(players);
        setVisible(false);
        toggleBack();
        getAllPlayers();
      })
      .catch((err) => {
        console.log(err);
        setVisible(false);
        Alert.alert("Error", "Something went wrong, try again");
      });
  };

  const removePlayer = (index) => {
    let updatedPlayers = playersEdit.map((player) => {
      return player;
    });
    updatedPlayers.splice(index, 1);
    setPlayersEdit(updatedPlayers);
  };

  const updateTreasury = async () => {
    setVisible(true);
    await axios
      .delete(`${ip}/treasuryPlayers`, {
        data: {
          id: selectedTreasuryId,
        },
      })
      .then(async (result) => {
        let id = selectedTreasuryId;
        let players = playersEdit.map((player) => {
          return player;
        });

        let values = "";
        for (let i = 0; i < players.length; i++) {
          values += `('${id}','${players[i].name}','${players[i].amountOwed}','${players[i].amountPaid}')`;
          if (i !== players.length - 1) {
            values += ",";
          }
        }
        await axios
          .post(`${ip}/treasuryPlayers`, {
            values: values,
          })
          .then(async (result) => {
            let updated = await new Promise((resolve, reject) => {
              db.transaction((tx) => {
                tx.executeSql(
                  "SELECT lastUpdate FROM treasury WHERE id = ?",
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

            await axios.put(`${ip}/treasury`, {
              id: id,
              update: updated,
            });

            let treasuryId = selectedTreasuryId;
            let players = playersEdit.map((player) => {
              return player;
            });
            let values = "";
            for (let i = 0; i < players.length; i++) {
              values += `('${treasuryId}','${players[i].name}','${players[i].amountOwed}','${players[i].amountPaid}')`;
              if (i !== players.length - 1) {
                values += ",";
              }
            }

            await new Promise((resolve, reject) => {
              db.transaction((tx) => {
                tx.executeSql(
                  "DELETE FROM treasuryEntry WHERE treasuryId = ?",
                  [treasuryId],
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
                  `insert into treasuryEntry (treasuryId,playerName,amountOwed,amountPaid) values ${values}`,
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
                  "UPDATE treasury SET lastUpdate = ? WHERE id = ?",
                  [updated, treasuryId],
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

  const toggleBack2 = () => {
    setModalVisible2(true);
    setEditAmountModal(false);
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
            // height: "10%",
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
            width: "100%",

            // backgroundColor: "#fff",
          }}
        >
          <ScrollView
            style={{ width: "100%" }}
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
                  <Text style={{ padding: 10, fontSize: 15, width: 85 }}>
                    {"Name: "}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    onChangeText={(text) => {
                      setSelectedTreasuryName(text);
                    }}
                    value={selectedTreasuryName}
                  />
                </View>
                <View style={{ width: "100%", flexDirection: "row" }}>
                  <Text style={{ padding: 10, fontSize: 15, width: 85 }}>
                    {"Amount: "}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    onChangeText={(text) => {
                      setAmount(parseInt(text));
                    }}
                    value={amount}
                  />
                </View>

                {selectedTreasuryName !== "" && amount != 0 && (
                  <View>
                    <View style={{ width: "100%", flexDirection: "row" }}>
                      <Text style={{ padding: 10, fontSize: 15 }}>
                        All Players?
                      </Text>
                      {/* Supernova Colors */}
                      <Switch
                        trackColor={{ false: "#767577", true: "#58bccd" }}
                        thumbColor={allPlayersSwitch ? "#119fb8" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={allPlayersSwitch}
                      />
                    </View>
                    {allPlayersSwitch === false && (
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
                            <Cell data={rowData} textStyle={styles.text} />
                            <Cell
                              data={
                                <TouchableOpacity>
                                  <View>
                                    <CheckBox
                                      value={playersIncluded[index]}
                                      onValueChange={(newValue) => {
                                        let pI = playersIncluded.map(
                                          (player) => {
                                            return player;
                                          }
                                        );
                                        pI[index] = newValue;
                                        setPlayersIncluded(pI);
                                      }}
                                      style={{ margin: 10 }}
                                    />
                                  </View>
                                </TouchableOpacity>
                              }
                              textStyle={styles.text}
                            />
                          </TableWrapper>
                        ))}
                      </Table>
                    )}

                    <MyButton text="Save" onPress={addTreasury} />
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
            // height: "10%",
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
            width: "100%",
            marginVertical: 40,
            // backgroundColor: "#fff",
          }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
              width: "100%",
              backgroundColor: "#fff",
              marginVertical: 20,
              padding: 5,
            }}
          >
            <View
              style={{
                width: "100%",
                backgroundColor: "#fff",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 20, padding: 10 }}>Players</Text>
              <MyButton text="Add Players" width={100} onPress={addPlayers} />
            </View>
            <View
              style={{
                width: "100%",
                borderBottomWidth: 0.5,
                borderBottomColor: "#000",
              }}
            />
            <FlatList
              data={playersEdit}
              style={{ width: "100%" }}
              renderItem={({ item, index }) => {
                return (
                  <Pressable
                    onPress={() => {
                      setEditAmountSelectedPlayerIndex(index);
                      // setModalVisible2(false);
                      setEditAmountModal(true);
                      setEditAmount(0);
                    }}
                    style={({ pressed }) => pressed && { opacity: 0.5 }}
                  >
                    <View
                      style={{
                        position: "absolute",
                        // alignSelf: "flex-end",
                        right: 5,
                        top: 5,
                        zIndex: 1,
                      }}
                    >
                      <MyButton
                        text="Remove"
                        color="red"
                        width={80}
                        onPress={() => {
                          removePlayer(index);
                        }}
                      />
                    </View>
                    <View style={{ padding: 10 }}>
                      <Text>{item.name}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignContent: "center",
                        alignItems: "center",
                        paddingLeft: 10,
                        // paddingBottom: 10,
                        // justifyContent: "center",
                      }}
                    >
                      <Image
                        source={require("../assets/icons/tick.png")}
                        style={{ width: 30, height: 30, marginRight: 10 }}
                      ></Image>
                      <Text style={{ marginRight: 20 }}>{item.amountPaid}</Text>
                      <Image
                        source={require("../assets/icons/cross.png")}
                        style={{ width: 30, height: 30, marginRight: 10 }}
                      ></Image>
                      <Text>{item.amountOwed}</Text>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                      }}
                    >
                      <TextInput
                        style={styles.textInput2}
                        keyboardType="numeric"
                        placeholder="Amount"
                        onChangeText={(text) => {
                          let p = playersEdit.map((player) => {
                            return player;
                          });
                          p[index].payable = parseInt(text);
                          setPlayersEdit(p);
                        }}
                        value={
                          item.payable === 0 ? "" : item.payable.toString()
                        }
                      />
                      <MyButton
                        text="Pay"
                        width={50}
                        onPress={() => {
                          payPlayer(index);
                        }}
                      />
                    </View>

                    <View
                      style={{
                        width: "100%",
                        borderBottomWidth: 0.5,
                        borderBottomColor: "#000",
                      }}
                    />
                  </Pressable>
                );
              }}
            />
            <MyButton
              text={"Save"}
              disabled={!isTreasurer}
              onPress={updateTreasury}
            />
          </View>
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
        <Modal
          isVisible={addPlayersModal}
          onBackButtonPress={toggleBack}
          onBackdropPress={toggleBack}
        >
          <View
            style={{
              // height: "10%",
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
              width: "100%",
              marginVertical: 40,
              // backgroundColor: "#fff",
            }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
                width: "100%",
                backgroundColor: "#fff",
                marginVertical: 20,
                padding: 5,
              }}
            >
              <ScrollView
                style={{ width: "100%" }}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
                  backgroundColor: "#fff",
                }}
                scrollEnabled={true}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "400",
                    alignSelf: "flex-start",
                    marginLeft: 10,
                  }}
                >
                  Add Players
                </Text>
                <View
                  style={{ width: "100%", borderBottomWidth: 0.5, margin: 5 }}
                />
                <View style={{ width: "100%", flexDirection: "row" }}>
                  <Text style={{ padding: 10, fontSize: 15, width: 85 }}>
                    {"Amount: "}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    onChangeText={(text) => {
                      setAmount(parseInt(text));
                    }}
                    value={amount}
                  />
                </View>
                {/* Colors Supernova */}

                {amount !== 0 && (
                  <View style={{ width: "100%" }}>
                    <Table
                      borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}
                    >
                      <Row
                        data={tableHead2}
                        style={styles.head}
                        textStyle={styles.text}
                      />
                      {playersRemaining.map((rowData, index) => (
                        <TableWrapper
                          key={index}
                          style={index % 2 === 0 ? styles.row : styles.row1}
                        >
                          <Cell data={rowData.name} textStyle={styles.text} />
                          <Cell
                            data={
                              <TouchableOpacity>
                                <View>
                                  <CheckBox
                                    value={rowData.included}
                                    onValueChange={(newValue) => {
                                      let pR = playersRemaining.map(
                                        (player) => {
                                          return player;
                                        }
                                      );
                                      pR[index].included = newValue;
                                      setPlayersRemaining(pR);
                                    }}
                                    style={{ margin: 10 }}
                                  />
                                </View>
                              </TouchableOpacity>
                            }
                            textStyle={styles.text}
                          />
                        </TableWrapper>
                      ))}
                    </Table>
                    <MyButton text="Save" onPress={addPlayersToDB} />
                  </View>
                )}
              </ScrollView>
            </View>
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
        </Modal>
        <Modal
          isVisible={editAmountModal}
          onBackdropPress={toggleBack2}
          onBackButtonPress={toggleBack2}
        >
          <View
            style={{
              // height: "10%",
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
              width: "100%",
              marginVertical: 40,
              // backgroundColor: "#fff",
            }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
                width: "100%",
                backgroundColor: "#fff",
                marginVertical: 20,
                padding: 5,
              }}
            >
              <Text style={{ fontSize: 20, color: "#808080" }}>
                Edit Amount Remaining
              </Text>
              <View style={{ width: "100%", flexDirection: "row" }}>
                <Text style={{ padding: 10, fontSize: 15, width: 85 }}>
                  {"New Amount: "}
                </Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    setEditAmount(parseInt(text));
                  }}
                  value={editAmount}
                />
              </View>
              {editAmount !== 0 && (
                <MyButton
                  text="Confirm"
                  onPress={() => {
                    let updatedPlayers = playersEdit.map((player) => {
                      return player;
                    });
                    updatedPlayers[editAmountSelectedPlayerIndex].amountOwed =
                      editAmount;
                    setPlayersEdit(updatedPlayers);
                    toggleBack2();
                  }}
                />
              )}
            </View>
          </View>
        </Modal>
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
          text="New"
          disabled={!isTreasurer}
          onPress={addModal}
          width={100}
        />
        <MyButton text="Players" onPress={onPlayerTreasuryPress} width={100} />
        <MyButton text="Refresh" onPress={refresh} width={100} />
      </View>
      <View style={{ width: "100%", borderBottomWidth: 0.5 }}></View>
      <FlatList
        style={{ width: "100%" }}
        data={allTreasuryItems}
        renderItem={({ item }) => {
          return (
            <Pressable
              onPress={() => {
                db.transaction((tx) => {
                  tx.executeSql(
                    "SELECT * FROM treasuryEntry WHERE treasuryId = ?",
                    [item.id],
                    (tx, results) => {
                      let allPlayers = [];
                      for (let i = 0; i < results.rows.length; ++i) {
                        allPlayers.push({
                          name: results.rows.item(i).playerName,
                          amountOwed: results.rows.item(i).amountOwed,
                          amountPaid: results.rows.item(i).amountPaid,
                          payable: 0,
                        });
                      }
                      setPlayersEdit(allPlayers);

                      setSelectedTreasuryId(item.id);
                    }
                  );
                });

                toggleModal2();
              }}
              onLongPress={() => {
                if (isTreasurer) {
                  Alert.alert(
                    "Delete Item",
                    "Are you sure you want to delete this item?",
                    [
                      {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel",
                      },
                      {
                        text: "Yes",
                        onPress: () => {
                          deleteTreasury(item.id);
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
                    marginBottom: 3,
                  }}
                >
                  <Image
                    source={require("../assets/icons/moneybag.png")}
                    style={{ width: 30, height: 30, marginRight: 10 }}
                  ></Image>
                  <Text>{item.name}</Text>
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
                  <Text>{item.allAmountPaid}</Text>
                  <Image
                    source={require("../assets/icons/cross.png")}
                    style={{ width: 30, height: 30, marginHorizontal: 10 }}
                  ></Image>
                  <Text>{item.allAmountOwed}</Text>
                  <Image
                    source={require("../assets/icons/excused.png")}
                    style={{ width: 30, height: 30, marginHorizontal: 10 }}
                  ></Image>
                  <Text>{item.total}</Text>
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

export default ViewTreasury;

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
  textInput2: {
    borderWidth: 1,
    borderColor: "#808080",
    // backgroundColor: "#bfbfbd",
    color: "#120438",
    borderRadius: 8,
    width: 100,
    padding: 10,
    margin: 10,
    height: 40,
  },
});
