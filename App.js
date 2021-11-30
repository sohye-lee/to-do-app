import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@toDo";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState([]);

  const life = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (e) => setText(e);

  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.log(e);
    }
  };

  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(s));
      console.log(toDos);
    } catch (e) {
      console.log(e);
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    try {
      const newToDos = toDos.append({ id: Date.now(), text, working, done: false, orderIndex: 0 });
 
      setToDos(newToDos);
      await saveToDos(newToDos);
      setText("");
    } catch (e) {
      console.log(e);
    }
  };

  const deleteToDo = (key) => {
    Alert.alert("Delete To-Do", "Are You Sure?", [
      { text: "Cancel" },
      {
        text: "I'm sure",
        style: "destructive",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
  };

  const doneToggle = async (key) => {
    console.log(toDos);
    const newToDos = {
      ...toDos,
      [key]: {
        ...toDos[key],
        done: !toDos[key].done,
      },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    console.log(toDos);
  };

  useEffect(() => {
    loadToDos();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableHighlight
          activeOpacity={0.8}
          onPress={life}
          backgroundColor={theme.bg}
        >
          <Text
            style={{ ...styles.btnText, color: working ? theme.grey : "white" }}
          >
            Life
          </Text>
        </TouchableHighlight>
      </View>
      <View>
        <TextInput
          returnKeyType="done"
          style={styles.input}
          placeholder={working ? "Add A To Do" : "What's Your Plan Today?"}
          autoCapitalize={"sentences"}
          autoCorrect={true}
          onChangeText={onChangeText}
          onSubmitEditing={addToDo}
          value={text}
        />
      </View>
      <ScrollView>
        {toDos
          ? Object.keys(toDos).map((k) =>
              toDos[k].working === working ? (
                <View style={styles.toDo} key={k}>
                  <View flexDirection="row">
                    <TouchableOpacity onPress={() => doneToggle(k)}>
                      <Fontisto
                        name={
                          toDos[k].done == false
                            ? "checkbox-passive"
                            : "checkbox-active"
                        }
                        size="20"
                        color={
                          toDos[k].done == false ? "white" : theme.lightGrey
                        }
                      />
                    </TouchableOpacity>
                    <Text
                      style={{
                        ...styles.toDoText,
                        color:
                          toDos[k].done == false ? "white" : theme.lightGrey,
                        textDecorationLine:
                          toDos[k].done == false ? "none" : "line-through",
                      }}
                    >
                      {toDos[k].text}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteToDo(k)}>
                    <Fontisto name="trash" size="20" color="white" />
                  </TouchableOpacity>
                </View>
              ) : null
            )
          : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 80,
  },
  btnText: {
    color: theme.grey,
    fontSize: 40,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    paddingHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 20,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    // color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
});
