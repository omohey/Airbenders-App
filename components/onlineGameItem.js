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



function OnlineGameItem(props) {

  var opponent = props.content ? props.content.opponent : "Opponent";
  var timestamp = props.content ? props.content.timestamp : 0;
  var myScore = props.content ? props.content.myScore : -1;
  var theirScore = props.content ? props.content.theirScore : -1;
  var home = props.content ? props.content.home : "Home";
  var category = props.content ? props.content.category : "Category";
  var color = props.content.color ? props.content.color : "#f00";

  let date = new Date(timestamp);
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

  return (
    <>
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
            <View>
              <Text style={[styles.opponentText, { color: "#808080" }]}>
                in {category}
              </Text>
              <Text style={styles.scoreText}>
                {myScore} - {theirScore} ({winlossStr})
              </Text>
              <Text style={styles.scoreText}>{HomeStr}</Text>
            </View>
          </View>
          <View
            style={{
              width: 5,
              height: 5,
              borderRadius: 5 / 2,
              backgroundColor: color,
            }}
          ></View>
        </View>
      </Pressable>
    </>
  );
}

export default OnlineGameItem;

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
  circle: {
    width: 5,
    height: 5,
    borderRadius: 5 / 2,
    backgroundColor: "red",
  },
});
