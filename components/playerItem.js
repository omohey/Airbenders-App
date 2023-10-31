import { StyleSheet, View, Text, Pressable } from "react-native";

function PLayerItem(props) {
  return (
    <Pressable
      onPress={props.onPress.bind(this, props.text)}
      style={({ pressed }) => pressed && styles.pressedItem}
    >
      <View style={styles.playerItem}>
        <Text style={styles.playerText}>{props.text}</Text>
      </View>
    </Pressable>
  );
}

export default PLayerItem;

const styles = StyleSheet.create({
  playerItem: {
    margin: 5,
    borderRadius: 6,
    backgroundColor: "#119fb8",
    padding: 10,
    color: "#ffffff",
    alignItems: "flex-start",
    flex: 1,
  },
  playerText: {
    color: "white",
  },
  pressedItem: { opacity: 0.5 },
});
