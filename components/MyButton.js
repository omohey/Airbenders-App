import { StyleSheet, View, Text, Pressable, Alert } from "react-native";

function MyButton(props) {
  let width = props.width ? props.width : 250;
  let height = props.height ? props.height : 40;
  let flex = props.flex ? props.flex : 0;
  let color = props.color ? props.color : "#119fb8";
  let textColor = props.textColor ? props.textColor : "#ffffff";
  let padding = props.padding ? props.padding : 8;
  let margin = props.margin ? props.margin : 8;
  let borderWidth = props.borderWidth ? props.borderWidth : 0;
  let verticalPadding = props.verticalPadding ? props.verticalPadding : padding;
  let textSize = props.textSize ? props.textSize : 14;
  let fontWeight = props.fontWeight ? props.fontWeight : "normal";
  let disabled = props.disabled ? props.disabled : false;
  var onPress = props.onPress;
  let addNumber =
    props.addNumber === null || props.addNumber === undefined
      ? null
      : props.addNumber;

  if (props.verticalPadding !== undefined) {
    padding = 1;
  }

  let buttonStyle = {
    ...styles.button,
    ...{
      backgroundColor: color,
      padding: padding,
      margin: margin,
      borderWidth: borderWidth,
      paddingVertical: verticalPadding,
    },
  };
  if (flex === 0) {
    buttonStyle = {
      ...buttonStyle,
      ...{ width: width, height: height },
    };
  }
  if (props.heightOnly !== undefined) {
    buttonStyle = {
      ...styles.button,
      ...{
        backgroundColor: color,
        padding: padding,
        margin: margin,
        borderWidth: borderWidth,
        paddingVertical: verticalPadding,
      },
      ...{ height: props.heightOnly },
    };
  }

  if (disabled) {
    buttonStyle = {
      ...buttonStyle,
      ...{ backgroundColor: "#808080" },
    };
    onPress = () => {
      // Alert.alert(
      //   "Warning",
      //   "This feature is not available for this account type."
      // );
    };
  }

  // buttonStyle = {
  //   ...buttonStyle,
  //   ...{ backgroundColor: color, padding: padding, margin: margin },
  // };
  if (addNumber === null) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
        flex={props.flex}
      >
        {/* View with button style and custom width */}
        {/* Text with button text style and custom text */}
        <View style={buttonStyle}>
          {/* <View style={styles.button}> */}
          <Text
            style={{
              color: textColor,
              fontSize: textSize,
              fontWeight: fontWeight,
            }}
          >
            {props.text}
          </Text>
        </View>
      </Pressable>
    );
  } else {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
        flex={props.flex}
      >
        {/* View with button style and custom width */}
        {/* Text with button text style and custom text */}
        <View style={buttonStyle}>
          {/* <View style={styles.button}> */}
          <Text
            style={{
              color: textColor,
              fontSize: textSize,
              fontWeight: fontWeight,
            }}
          >
            {props.text}
          </Text>
          <View
            style={{
              position: "absolute",
              justifyContent: "center",
              alignContent: "center",
              // alignSelf: "flex-end",
              bottom: 3,
              right: 5,
              // backgroundColor: "#000",
              zIndex: 100,
            }}
          >
            <Text
              style={{ fontSize: 10, color: textColor, fontWeight: fontWeight }}
            >
              {addNumber}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }
}

export default MyButton;

const styles = StyleSheet.create({
  button: {
    borderRadius: 6,
    color: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#808080",
  },
  pressed: { opacity: 0.5 },
});
