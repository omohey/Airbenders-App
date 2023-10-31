/*
   Copyright 2023 AUC-Siemens Thesis Project

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View, Image } from "react-native";
import MyButton from "./components/MyButton";
import * as React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";

import Home from "./screens/Home";
import AddPlayer from "./screens/addPlayer";
import AddGame from "./screens/addGame";
import GameHome from "./screens/gameHome";
import ViewGames from "./screens/viewGames";
import RecordGame from "./screens/RecordGame";
import ViewEvents from "./screens/viewEvents";
import ViewStats from "./screens/viewStats";
import PLayerStats from "./screens/playerStats";
import OverallStats from "./screens/overallStats";
import PlayersOverallStats from "./screens/playersOverallStats";
import TeamStats from "./screens/TeamStats";
import LineBuilder from "./screens/lineBuilder";
import Login from "./screens/login";
import ViewPractices from "./screens/viewPractices";
import PlayersPractice from "./screens/playersPractice";
import ViewTracks from "./screens/viewTracks";
import TrackPlayers from "./screens/trackPlayers";
import ViewTreasury from "./screens/viewTreasury";
import PlayersTreasury from "./screens/playersTreasury";
const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            title: "Login",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            title: "Mayhem", // CHANGETHIS
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Add Player"
          component={AddPlayer}
          options={{
            title: "Add Player",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Add Game"
          component={AddGame}
          options={{
            title: "Mayhem",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="View Games"
          component={ViewGames}
          options={{
            title: "View Games",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Game Home"
          component={GameHome}
          options={{
            title: "Game",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Record Game"
          component={RecordGame}
          options={{
            title: "Record Game",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="View Game Events"
          component={ViewEvents}
          options={{
            title: "View Game Events",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="View Game Stats"
          component={ViewStats}
          options={{
            title: "View Game Stats",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="View Player Stats"
          component={PLayerStats}
          options={{
            title: "View Player Stats",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="View Overall Stats"
          component={OverallStats}
          options={{
            title: "View Overall Stats",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Players Overall Stats"
          component={PlayersOverallStats}
          options={{
            title: "Players Overall Stats",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Team Stats"
          component={TeamStats}
          options={{
            title: "Team Stats",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Line Builder"
          component={LineBuilder}
          options={{
            title: "Line Builder",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="View Practices"
          component={ViewPractices}
          options={{
            title: "View Practices",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Player Attendance"
          component={PlayersPractice}
          options={{
            title: "Player Attendance",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Tracks"
          component={ViewTracks}
          options={{
            title: "Tracks",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Track Players"
          component={TrackPlayers}
          options={{
            title: "Track Players",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Treasury"
          component={ViewTreasury}
          options={{
            title: "Treasury",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Treasury Players"
          component={PlayersTreasury}
          options={{
            title: "Treasury Players",
            headerStyle: {
              backgroundColor: "#119fb8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MyStack;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
    margin: 20,
    marginBottom: 80,
  },
});
