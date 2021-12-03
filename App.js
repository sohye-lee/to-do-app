import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Pressable,
  TouchableHighlight,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import { Feather } from "@expo/vector-icons";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@toDos";
const STORAGE_KEY_NAME = "@yourName";

export default function App() {
  const [name, setName] = useState("Guest");
  const [newName, setNewName] = useState("");
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");

  const [toDos, setToDos] = useState([]);
  const [workProgress, setWorkProgress] = useState(0);
  const [lifeProgress, setLifeProgress] = useState(0);
  const [modalShow, setModalShow] = useState(false);
  const [nameModalShow, setNameModalShow] = useState(false);
  const [toEdit, setToEdit] = useState(0);
  const [editText, setEditText] = useState("");
  const [newText, setNewText] = useState("");

  const saveName = async (name) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_NAME, name);
    } catch (e) {
      console.log(e);
    }
  };

  const loadName = async () => {
    try {
      const n = await AsyncStorage.getItem(STORAGE_KEY_NAME);
      if (n != "") {
        setName("Guest");
      } else {
        setName(n);
      }
    } catch (e) {
      console.log(e);
    }
  };
  const life = () => {
    setWorking(false);
  };
  const work = () => {
    setWorking(true);
  };

  const getWorkProgress = () => {
    const toDoLength =
      toDos && toDos.length > 0
        ? toDos.filter((t) => t.working == true).length
        : 1;
    const doneLength =
      toDos && toDos.length > 0
        ? toDos.filter((t) => t.done == true && t.working == true).length
        : 0;
    const currentProgress = Math.round((doneLength / toDoLength) * 100);

    setWorkProgress(currentProgress);
  };

  const barBlueColor = working
    ? (workProgress / 100) * 255
    : (lifeProgress / 100) * 255;

  const getLifeProgress = () => {
    const toDoLength =
      toDos && toDos.length > 0
        ? toDos.filter((t) => t.working == false).length
        : 1;
    const doneLength =
      toDos && toDos.length > 0
        ? toDos.filter((t) => t.done == true && t.working == false).length
        : 0;
    const currentProgress = Math.round((doneLength / toDoLength) * 100);

    setLifeProgress(currentProgress);
  };

  const onChangeText = (e) => {
    setText(e);
  };

  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.log(e.message);
    }
  };

  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      // AsyncStorage.clear();
      // const newToDos =
      //   JSON.parse(s) && JSON.parse(s).length > 0
      //     ? JSON.parse(s).sort(function (a, b) {
      //         return a.city.localeCompare(b.id) || b.done - a.done;
      //       })
      //     : JSON.parse(s);
      // setToDos(newToDos);
      setToDos(JSON.parse(s));
      getWorkProgress();
      getLifeProgress();
    } catch (e) {
      console.log(e.message);
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }

    try {
      let newToDos = toDos && toDos.length > 0 ? toDos : [];
      var obj = {
        id: Date.now(),
        text,
        working,
        done: false,
        orderIndex: 0,
      };
      newToDos.push(obj);
      setToDos(newToDos);
      await saveToDos(newToDos);

      setText("");
    } catch (e) {
      console.log(e.message);
    }

    getWorkProgress();
    getLifeProgress();
  };

  const deleteToDo = (id) => {
    Alert.alert("Delete To-Do", "Are You Sure?", [
      { text: "Cancel" },
      {
        text: "I'm sure",
        style: "destructive",
        onPress: async () => {
          const newToDos = toDos.filter((t) => t.id != id);
          setToDos(newToDos);
          await saveToDos(newToDos);
          getWorkProgress();
          getLifeProgress();
        },
      },
    ]);
  };

  const doneToggle = async (id) => {
    let newToDos = toDos.filter((t) => t["id"] !== id);
    let newToDo = toDos.filter((t) => t["id"] === id)[0];
    newToDo["done"] = !newToDo["done"];
    newToDos.push(newToDo);
    setToDos(newToDos);
    await saveToDos(newToDos);
    getWorkProgress();
    getLifeProgress();
  };

  const editToDo = () => {
    try {
      let itemToEdit = toDos && toDos.filter((t) => t.id == toEdit)[0];
      itemToEdit = { ...itemToEdit, text: newText };
      let newToDos = toDos.filter((t) => t.id != toEdit);
      newToDos.push(itemToEdit);

      setToDos(newToDos);
      setModalShow(false);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadToDos().then(() => {
      getWorkProgress();
      getLifeProgress();
    });
    loadName();
    // loadToDos().then(() => getProgress());
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.headerLogo}>
        <View style={styles.logoContainer}>
          <Image
            source={require("./assets/B.png")}
            alt="logo"
            style={styles.logo}
          />
        </View>
        <TouchableOpacity onPress={() => setNameModalShow(true)}>
          <Text style={{ color: "white" }}>
            Hi, {name != "" ? name : "Guest"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            work();
          }}
        >
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableHighlight
          activeOpacity={0.8}
          onPress={() => {
            life();
          }}
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <View
          style={{
            height: 20,
            flexDirection: "row",
            width: "90%",
            backgroundColor: theme.grey,
            borderColor: "#000",
            borderWidth: 2,
            borderRadius: 10,
          }}
        >
          <View
            style={{
              width:
                working == true
                  ? workProgress
                    ? workProgress.toString() + "%"
                    : 0
                  : lifeProgress
                  ? lifeProgress.toString() + "%"
                  : 0,
              height: "100%",
              backgroundColor: "rgb(250, 100," + barBlueColor.toString() + ")",
              borderRadius: 10,
              // borderBottomLeftRadius: 10,
              // borderTopRightRadius: working == true ? workProgress ? workProgress.toString() + "%" : 0 :  lifeProgress ? lifeProgress.toString() + "%" : 0
              // progress > 95 ? 10 : 0,
              // borderBottomRightRadius: progress > 95 ? 10 : 0,
            }}
          ></View>
        </View>
        <Text style={{ color: "white" }}>
          {working == true
            ? workProgress
              ? workProgress
              : 0
            : lifeProgress
            ? lifeProgress
            : 0}
          %
        </Text>
      </View>
      <ScrollView>
        {toDos && toDos.length > 0 ? (
          toDos
            .sort((a, b) => a.done - b.done)
            .map((t) =>
              t.working === working ? (
                <View style={styles.toDo} key={t.id}>
                  <View flexDirection="row">
                    <TouchableOpacity onPress={() => doneToggle(t.id)}>
                      <Fontisto
                        name={
                          t.done == false
                            ? "checkbox-passive"
                            : "checkbox-active"
                        }
                        size={20}
                        color={t.done == false ? "white" : theme.lightGrey}
                      />
                    </TouchableOpacity>
                    <Text
                      style={{
                        ...styles.toDoText,
                        color: t.done == false ? "white" : theme.lightGrey,
                        textDecorationLine:
                          t.done == false ? "none" : "line-through",
                      }}
                    >
                      {t.text}
                    </Text>
                  </View>
                  <View flexDirection="row">
                    <TouchableOpacity
                      onPress={() => {
                        setModalShow(true);
                        setToEdit(t.id);
                        setEditText(t.text);
                      }}
                      style={{ marginRight: 10 }}
                    >
                      <Feather name="edit" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteToDo(t.id)}>
                      <Fontisto name="trash" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null
            )
        ) : (
          <View>
            <Text color="white">Your List is empty</Text>
          </View>
        )}

        <View style={styles.modalContainer}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalShow}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setModalVisible(!modalShow);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                {/* <Text></Text> */}
                <TextInput
                  returnKeyType="done"
                  style={styles.inputEdit}
                  placeholder={editText}
                  autoCapitalize={"sentences"}
                  autoCorrect={true}
                  onChangeText={(e) => {
                    setNewText(e);
                  }}
                  onSubmitEditing={addToDo}
                  // value={editText}
                />
                <View flexDirection="row">
                  <Pressable
                    style={styles.btnCancel}
                    onPress={() => {
                      setModalShow(!modalShow);
                      setEditText("");
                    }}
                  >
                    <Text style={{ color: "white" }}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.btnEdit} onPress={editToDo}>
                    <Text style={{ color: "white" }}>Edit</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.modalContainer}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={nameModalShow}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setModalVisible(!nameModalShow);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                {/* <Text></Text> */}
                <TextInput
                  returnKeyType="done"
                  style={styles.inputEdit}
                  placeholder={name != "" ? name : "Guest"}
                  autoCapitalize={"words"}
                  autoCorrect={true}
                  onChangeText={(e) => {
                    setNewName(e);
                  }}
                  maxLength={20}
                  onSubmitEditing={() => setName(newName)}
                  // value={editText}
                />
                <View flexDirection="row">
                  <Pressable
                    style={styles.btnCancel}
                    onPress={() => {
                      setNameModalShow(!nameModalShow);
                      setNewName("");
                    }}
                  >
                    <Text style={{ color: "white" }}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.btnEdit}
                    onPress={() => {
                      setName(newName);
                      setNameModalShow(false);
                      saveName(newName);
                    }}
                  >
                    <Text style={{ color: "white" }}>Edit</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>
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
  headerLogo: {
    marginTop: 60,
    paddingLeft: 8,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    width: 120,
    height: 50,
  },
  logo: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: "contain",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
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
    borderRadius: 8,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  btnCancel: {
    backgroundColor: "darkgray",
    marginRight: 10,
    color: "white",
    borderRadius: 20,
    height: 40,
    padding: 5,
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  btnEdit: {
    backgroundColor: "blue",
    marginRight: 10,
    color: "white",
    borderRadius: 20,
    height: 40,
    padding: 5,
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  inputEdit: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 20,
    fontSize: 18,
    width: "90%",
    borderBottomColor: "grey",
    borderBottomWidth: 1,
    // borderbottom: "solid"
  },
});
