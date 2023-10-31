import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View, Image } from "react-native";
import MyButton from "../components/MyButton";
import React, { useEffect } from "react";
import axios from "axios";

import * as SQLite from "expo-sqlite";
import { TextInput } from "react-native-gesture-handler";
import { useState, useRef } from "react";
import { Keyboard, Platform } from "react-native";
import { Alert } from "react-native";
import KeyboardAvoidingView from "react-native/Libraries/Components/Keyboard/KeyboardAvoidingView";

import address from "../config.js";
const ip = address.ip;

const db = SQLite.openDatabase("game.db");

const Login = ({ navigation, route }) => {
  const params = route.params;

  const logout = params ? params.logout : false;
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

    await axios({
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
                "','" +
                newPlayers[i].password +
                "','" +
                newPlayers[i].isAdmin +
                "','" +
                newPlayers[i].isTreasurer +
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
              "','" +
              newPlayers[newPlayers.length - 1].password +
              "','" +
              newPlayers[newPlayers.length - 1].isAdmin +
              "','" +
              newPlayers[newPlayers.length - 1].isTreasurer +
              "')";

            // add new players to local storage
            // console.log(values);
            await new Promise((resolve, reject) => {
              db.transaction((tx) => {
                tx.executeSql(
                  "insert into player (name, email, major, number, phone, password, isAdmin, isTreasurer) values " +
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

            // check if any player isAdmin field is changed
          }
          for (let i = 0; i < players.length; i++) {
            let player = players[i];
            let localPlayer = localPlayers.filter(
              (localPlayer) => localPlayer.name === player.name
            )[0];
            if (localPlayer !== undefined) {
              if (localPlayer.isAdmin !== player.isAdmin) {
                await new Promise((resolve, reject) => {
                  db.transaction((tx) => {
                    tx.executeSql(
                      "update player set isAdmin = " +
                        player.isAdmin +
                        " where name = '" +
                        player.name +
                        "'",
                      [],
                      (_, { rows: { _array } }) => {
                        resolve(_array);
                      }
                    );
                  });
                });
              }
            }
          }
          // check if any player password field is changed
          for (let i = 0; i < players.length; i++) {
            let player = players[i];
            let localPlayer = localPlayers.filter(
              (localPlayer) => localPlayer.name === player.name
            )[0];
            if (localPlayer !== undefined) {
              if (localPlayer.password !== player.password) {
                await new Promise((resolve, reject) => {
                  db.transaction((tx) => {
                    tx.executeSql(
                      "update player set password = '" +
                        player.password +
                        "' where name = '" +
                        player.name +
                        "'",
                      [],
                      (_, { rows: { _array } }) => {
                        resolve(_array);
                      }
                    );
                  });
                });
              }
            }
          }
        }
        // check if any player isTreasurer field is changed
        for (let i = 0; i < players.length; i++) {
          let player = players[i];
          let localPlayer = localPlayers.filter(
            (localPlayer) => localPlayer.name === player.name
          )[0];
          if (localPlayer !== undefined) {
            if (localPlayer.isTreasurer !== player.isTreasurer) {
              await new Promise((resolve, reject) => {
                db.transaction((tx) => {
                  tx.executeSql(
                    "update player set isTreasurer = " +
                      player.isTreasurer +
                      " where name = '" +
                      player.name +
                      "'",
                    [],
                    (_, { rows: { _array } }) => {
                      resolve(_array);
                    }
                  );
                });
              });
            }
          }
        }
        // check if any player email field is changed
        for (let i = 0; i < players.length; i++) {
          let player = players[i];
          let localPlayer = localPlayers.filter(
            (localPlayer) => localPlayer.name === player.name
          )[0];
          if (localPlayer !== undefined) {
            if (localPlayer.email !== player.email) {
              await new Promise((resolve, reject) => {
                db.transaction((tx) => {
                  tx.executeSql(
                    "update player set email = '" +
                      player.email +
                      "' where name = '" +
                      player.name +
                      "'",
                    [],
                    (_, { rows: { _array } }) => {
                      resolve(_array);
                    }
                  );
                });
              });
            }
          }
        }

        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  async function onScreenLoad() {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS login (
            name varchar(25) NOT NULL,
            PRIMARY KEY (name)
            FOREIGN KEY (name) REFERENCES player(name) ON DELETE CASCADE
          );`,
        [],
        (tx, results) => {
          // console.log("login table created");
        },
        (tx, error) => {
          console.log("Error creating player table");
        }
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS player (
          name varchar(25) NOT NULL,
          number int DEFAULT NULL,
          phone varchar(15) DEFAULT NULL,
          major varchar(25) DEFAULT NULL,
          email varchar(50) DEFAULT NULL,
          password varchar(50) DEFAULT NULL,
          isAdmin tinyint(1) DEFAULT 0,
          isTreasurer tinyint(1) DEFAULT 0,
          PRIMARY KEY (name)
        )`,
        [],
        (tx, results) => {
          // console.log("Player table created");
        },
        (tx, error) => {
          console.log("Error creating player table");
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS game (
          opponent varchar(25) NOT NULL,
          timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          myScore int DEFAULT '-1',
          theirScore int DEFAULT '-1',
          home tinyint(1) DEFAULT NULL,
          category varchar(50) DEFAULT NULL,
          startOffence tinyint(1) DEFAULT '1',
          pointCap int DEFAULT 13,
          PRIMARY KEY (timestamp,opponent)
        ) `,
        [],
        (tx, results) => {
          // console.log("Game table created");
        },
        (tx, error) => {
          console.log("Error creating game table");
        }
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS actionPerformed (
          opponent varchar(25) NOT NULL,
          gameTimestamp timestamp NOT NULL,
          playerName varchar(25) DEFAULT NULL,
          action varchar(20) NOT NULL,
          id integer NOT NULL PRIMARY KEY AUTOINCREMENT,
          point int NOT NULL,
          associatedPlayer varchar(25) DEFAULT NULL,
          offence tinyint(1) DEFAULT NULL,
          FOREIGN KEY (gameTimestamp) REFERENCES game (timestamp) ON DELETE CASCADE ON UPDATE CASCADE, 
          FOREIGN KEY (playerName) REFERENCES player (name),
          FOREIGN KEY (associatedPlayer) REFERENCES player (name)
        )`,
        [],
        (tx, results) => {
          // console.log("ActionPerformed table created");
        },
        (tx, error) => {
          console.log("Error creating actionPerformed table");
        }
      );
    });

    /*NEW*/
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS practice 
        (
        id INTEGER AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL, 
        lastUpdate INTEGER DEFAULT 0 
        );
        `,
        [],
        (tx, results) => {
          // console.log("Practice table created");
        },
        (tx, error) => {
          console.log("Error creating practice table");
        }
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS playersToCome
        (
        practiceId INTEGER NOT NULL,
        playerName varchar(25) NOT NULL,
        isExecused tinyint(1) NOT NULL DEFAULT 0, 
        isAttending tinyint(1) NOT NULL,
        PRIMARY KEY (practiceId, playerName),
        FOREIGN KEY (playerName) REFERENCES player (name) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (practiceId) REFERENCES practice (id) ON UPDATE CASCADE ON DELETE CASCADE
        );`,
        [],
        (tx, results) => {
          // console.log("playersToCome table created");
        },
        (tx, error) => {
          console.log("Error creating playersToCome table");
        }
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS track 
        (
        id INTEGER PRIMARY KEY,
        week INTEGER NOT NULL, 
        lastUpdate INTEGER DEFAULT 0 
        );
        `,
        [],
        (tx, results) => {
          // console.log("Practice table created");
        },
        (tx, error) => {
          console.log("Error creating practice table");
        }
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS trackAttendance
        (
        trackId INTEGER NOT NULL,
        playerName varchar(25) NOT NULL,
        isExecused tinyint(1) NOT NULL DEFAULT 0, 
        isAttending tinyint(1) NOT NULL,
        PRIMARY KEY (trackId, playerName),
        FOREIGN KEY (playerName) REFERENCES player (name) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (trackId) REFERENCES track (id) ON UPDATE CASCADE ON DELETE CASCADE
        );`,
        [],
        (tx, results) => {
          // console.log("playersToCome table created");
        },
        (tx, error) => {
          console.log("Error creating playersToCome table");
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS updates
        (
        number INTEGER PRIMARY KEY
        );`,
        [],
        (tx, results) => {
          // console.log("playersToCome table created");
        },
        (tx, error) => {
          console.log("Error creating updates table");
          console.log(error);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS treasury
        (
          id INTEGER PRIMARY KEY,
          name VARCHAR(50) NOT NULL, 
          paidOutside INTEGER NOT NULL DEFAULT 0,
          lastUpdate INTEGER DEFAULT 0 
        );`,
        [],
        (tx, results) => {
          // console.log("playersToCome table created");
        },
        (tx, error) => {
          console.log("Error creating treasury table");
          console.log(error);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS treasuryEntry
        (
        treasuryId INTEGER NOT NULL,
        playerName varchar(25) NOT NULL,
        amountOwed INTEGER(1) NOT NULL DEFAULT 0, 
        amountPaid INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (treasuryId, playerName),
        FOREIGN KEY (playerName) REFERENCES player (name) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (treasuryId) REFERENCES treasury (id) ON UPDATE CASCADE ON DELETE CASCADE
        );`,
        [],
        (tx, results) => {
          // console.log("playersToCome table created");
        },
        (tx, error) => {
          console.log("Error creating treasuryEntry table");
        }
      );
    });
    /*NEW*/

    getAllPlayers();

    await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "select * from updates",
          [],
          async (_, { rows: { _array } }) => {
            if (_array.length > 0 && _array[0].number === 2) {
              resolve(_array[0].number);
            } else if (_array.length > 0 && _array[0].number === 1) {
              await new Promise((resolve, reject) => {
                // Alter Table game add column pointCap set default to 13
                db.transaction((tx) => {
                  tx.executeSql(
                    "ALTER TABLE game ADD COLUMN pointCap int DEFAULT 13;",
                    [],
                    (_, { rows: { _array } }) => {
                      resolve(_array);
                    },
                    (_, error) => {
                      reject(error);
                    }
                  );
                }
                );

                db.transaction((tx) => {
                  tx.executeSql(
                    "update updates set number = 2;",
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
            } else {
              if (_array.length === 0) {
                await new Promise((resolve, reject) => {
                  db.transaction((tx) => {
                    tx.executeSql(
                      "insert into updates (number) values (0)",
                      [],
                      (_, { rows: { _array } }) => {
                        resolve(0);
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
                      "ALTER TABLE player ADD COLUMN isTreasurer tinyint(1) DEFAULT 0;",
                      [],
                      (_, { rows: { _array } }) => {
                        resolve(0);
                      },
                      (_, error) => {
                        reject(error);
                      }
                    );
                  });
                });
              }
              // delete all games from local storage and all actions performed in actionPerfomed table
              await new Promise((resolve, reject) => {
                db.transaction((tx) => {
                  tx.executeSql(
                    "delete from game;",
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
                    "delete from actionPerformed;",
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

              // set number to 1
              await new Promise((resolve, reject) => {
                db.transaction((tx) => {
                  tx.executeSql(
                    "update updates set number = 1;",
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

              resolve(0);
            }
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
          "select name, isAdmin, isTreasurer from player;",
          [],
          (_, { rows: { _array } }) => {
            resolve(_array);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    }).then((players) => {
      db.transaction((tx) => {
        tx.executeSql(
          "select * from login",
          [],
          (_, { rows: { _array } }) => {
            if (_array.length > 0) {
              let name = _array[0].name;
              let player = players.filter((player) => player.name === name)[0];
              let isAdmin = 0;
              let isTreasurer = 0;

              if (player !== undefined) {
                isAdmin = player.isAdmin;
                isTreasurer = player.isTreasurer;
              }
              isAdmin = isAdmin === 1 ? true : false;
              isTreasurer = isTreasurer === 1 ? true : false;
              // navigation.navigate("Home", { name: name, isAdmin: isAdmin });
              // console.log("isTreasurer: " + isTreasurer);
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "Home",
                    params: {
                      name: name,
                      isAdmin: isAdmin,
                      isTreasurer: isTreasurer,
                    },
                  },
                ],
              });
            }
          },
          (_, error) => {
            console.log("Error getting login info");
          }
        );
      });
    });

    // check if user is logged in
  }

  useEffect(() => {
    // db.transaction((tx) => {
    //   tx.executeSql(
    //     "DELETE FROM login",
    //     [],
    //     (tx, results) => {
    //       // console.log("Login table cleared");
    //     },
    //     (tx, error) => {
    //       console.log("Error clearing login table");
    //     }
    //   );
    // });
    // return;
    // Create all tables if they don't exist

    // db.transaction((tx) => {
    //   tx.executeSql(
    //     `DROP TABLE player`,
    //     [],
    //     (tx, results) => {
    //       console.log("Player table dropped", results);
    //     },
    //     (tx, error) => {
    //       console.log("Error dropping player table", error);
    //     }
    //   );
    // });

    // db.transaction((tx) => {
    //   tx.executeSql(
    //     `DROP TABLE game`,
    //     [],
    //     (tx, results) => {
    //       console.log("Game table dropped", results);
    //     },
    //     (tx, error) => {
    //       console.log("Error dropping game table", error);
    //     }
    //   );
    // });

    // db.transaction((tx) => {
    //   tx.executeSql(
    //     `DROP TABLE actionPerformed`,
    //     [],
    //     (tx, results) => {
    //       console.log("ActionPerformed table dropped", results);
    //     },
    //     (tx, error) => {
    //       console.log("Error dropping actionPerformed table", error);
    //     }
    //   );
    // });

    if (logout === true) {
      getAllPlayers();
    } else {
      onScreenLoad();
    }
  }, []);

  const [enteredEmail, setEnteredEmail] = useState("");
  function emailInputHandler(enteredText) {
    setEnteredEmail(enteredText);
  }
  const [enteredPassword, setEnteredPassword] = useState("");
  function passwordInputHandler(enteredText) {
    setEnteredPassword(enteredText);
  }
  const ref_password = useRef();

  async function onLoginPress() {
    if (enteredEmail === "" || enteredPassword === "") {
      Alert.alert("Please enter email and password");
      return;
    }
    // console.log("Logging in");
    let players = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "select name, email, password, isAdmin, isTreasurer from player",
          [],
          (_, { rows: { _array } }) => {
            // console.log("Players", _array);
            resolve(_array);
          },
          (_, error) => {
            // console.log("Error getting players");
            reject(error);
          }
        );
      });
    });
    console.log("Players");
    let email = enteredEmail;
    email = email.toLowerCase();
    let password = enteredPassword;
    let player = players.filter(
      (player) => player.email === email && player.password === password
    )[0];
    if (player !== undefined) {
      // first clear login table
      await new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            "delete from login;",
            [],
            (tx, results) => {
              resolve(results);
            },
            (tx, error) => {
              reject(error);
            }
          );
        });
      });

      db.transaction((tx) => {
        tx.executeSql(
          "insert into login (name) values (?)",
          [player.name],
          (tx, results) => {
            // console.log("Login info inserted");
          },
          (tx, error) => {
            console.log("Error inserting login info");
          }
        );
      });
      // navigation.navigate("Home", {
      //   name: player.name,
      //   isAdmin: player.isAdmin,
      // });
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Home",
            params: {
              name: player.name,
              isAdmin: player.isAdmin,
              isTreasurer: player.isTreasurer,
            },
          },
        ],
      });
    } else {
      Alert.alert("Invalid email or password");
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Image style={styles.image} source={require("../assets/logo.png")} />
        <TextInput
          keyboardType="email-address"
          onChangeText={emailInputHandler}
          style={styles.textInput}
          value={enteredEmail}
          returnKeyType="next"
          autoFocus={true}
          onSubmitEditing={() => ref_password.current.focus()}
          blurOnSubmit={false}
          placeholder="Email"
        />
        <TextInput
          secureTextEntry={true}
          onChangeText={passwordInputHandler}
          style={styles.textInput}
          value={enteredPassword}
          ref={ref_password}
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
          placeholder="Password"
        />
        <MyButton onPress={onLoginPress} text="Login"></MyButton>
        <StatusBar style="auto" />
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
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
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#808080",
    backgroundColor: "#bfbfbd",
    color: "#120438",
    borderRadius: 8,
    padding: 10,
    margin: 3,
    width: "70%",
  },
});
