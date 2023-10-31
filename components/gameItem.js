import { StyleSheet, View, Text, Pressable, Image, Button } from "react-native";
import React from "react";
import { useState } from "react";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MyButton from "../components/MyButton";

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

const closeRow = (
  index,
  prevOpenedRow,
  row,
  setPrevOpenedRow,
  setSwipeableRow
) => {
  if (prevOpenedRow && prevOpenedRow !== row[index]) {
    prevOpenedRow.close();
  }
  setPrevOpenedRow(row[index]);
};

function GameItem(props) {

  var opponent = props.content ? props.content.opponent : "Opponent";
  var timestamp = props.content ? props.content.timestamp : 0;
  var myScore = props.content ? props.content.myScore : -1;
  var theirScore = props.content ? props.content.theirScore : -1;
  var home = props.content ? props.content.home : "Home";
  var category = props.content ? props.content.category : "Category";

  let year = timestamp.substring(0, 4);
  let month = timestamp.split("-")[1];
  let day = timestamp.split("-")[2];
  day = day.split(" ")[0];

  let time = timestamp.split(" ")[1];
  let hour = time.split(":")[0];
  let minute = time.split(":")[1];
  let second = time.split(":")[2];

  let date = new Date(year, month - 1, day, hour, minute, second);
  let dateStr =
    date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();

  let winlossStr = "";

  if (myScore === -1) {
    myScore = 0;
  }
  if (theirScore === -1) {
    theirScore = 0;
  }

  if (myScore > theirScore) {
    winlossStr = "Won";
  } else if (myScore < theirScore) {
    winlossStr = "Lost";
  } else {
    winlossStr = "Draw";
  }

  const [heightOfImage, setHeightOfImage] = React.useState(0);

  const onLayout = (event) => {
    const { x, y, height, width } = event.nativeEvent.layout;
    setHeightOfImage(height);
  };

  let HomeStr = home ? "Home" : "Away";

  let opponentLower = opponent.toLowerCase();

  let myImage =
    opponentLower in allImages ? allImages[opponentLower] : allImages["any"];

  const renderRightView = (onDeleteHandler, index, swipeableRow) => {
    return (
      <Pressable
        style={({ pressed }) => [
          pressed && styles.pressedItem,
          {
            margin: 0,
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center",
            width: 110,
            backgroundColor: "red",
          },
        ]}
        onPress={(e) => {
          onDeleteHandler(e);
          swipeableRow[index].close();
        }}
      >
        <View>
          <Text style={{ color: "#fff", fontSize: 19 }}>Delete</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <GestureHandlerRootView>
      <Swipeable
        renderRightActions={(progress, dragX) =>
          renderRightView(props.onDelete, props.index, props.swipeableRow)
        }
        onSwipeableWillOpen={() => {
          closeRow(
            props.index,
            props.prevOpenedRow,
            props.swipeableRow,
            props.setPrevOpenedRow,
            props.setSwipeableRow
          );
        }}
        ref={(ref) => (props.swipeableRow[props.index] = ref)}
        // rightOpenValue={-300}
      >
        <Pressable
          // onPress={props.onPress.bind(this, props.text)}
          onPress={props.onPress}
          style={({ pressed }) => [
            pressed && styles.pressedItem,
            styles.pressableStyle,
          ]}
        >
          <View style={styles.gameItem}>
            <View
              style={{
                justifyContent: "center",
                height: heightOfImage,
                alignItems: "center",
                backgroundColor: "#fff",
              }}
            >
              <Image style={styles.image} source={myImage}></Image>
            </View>
            <View style={{ flex: 1 }} onLayout={onLayout}>
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "space-between",
                  paddingBottom: 0,
                }}
              >
                <Text style={styles.opponentText}>vs. {opponent}</Text>
                <Text style={styles.opponentText}>{dateStr}</Text>
              </View>
              <Text style={[styles.opponentText, { color: "#808080" }]}>
                in {category}
              </Text>
              <Text style={styles.scoreText}>
                {myScore} - {theirScore} ({winlossStr})
              </Text>

              <Text style={styles.scoreText}>{HomeStr}</Text>
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

export default GameItem;

const styles = StyleSheet.create({
  pressedItem: { opacity: 0.5 },
  pressableStyle: {
    width: "100%",
    alignItems: "center",
  },

  gameItem: {
    backgroundColor: "#fff",
    borderColor: "#808080",
    borderWidth: 1,
    padding: 10,
    // margin: 10,
    // borderRadius: 8,
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 0,
  },
  opponentText: {
    fontSize: 18,
    alignContent: "flex-start",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  scoreText: {
    fontSize: 15,
    color: "#808080",
  },
  image: {
    width: 60,
    height: 60,
    margin: 8,
  },
});
