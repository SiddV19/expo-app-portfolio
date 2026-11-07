import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function Stopwatch() {
  const [time, setTime] = useState(0);        
  const [lapTime, setLapTime] = useState(0);  
  const [intervalId, setIntervalId] = useState(null);
  const [laps, setLaps] = useState([]);

  function start() {
    if (intervalId) return;

    const id = setInterval(() => {
      setTime((t) => t + 10);
      setLapTime((lt) => lt + 10);
    }, 10);

    setIntervalId(id);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }

  function lap() {
    
    setLaps((prev) => [
      { lap: prev.length + 1, lapTime },
      ...prev,
    ]);
    setLapTime(0);
  }

  function reset() {
    stop();
    setTime(0);
    setLapTime(0);
    setLaps([]);
  }

  function format(t) {
    const min = Math.floor(t / 60000);
    const sec = Math.floor((t % 60000) / 1000);
    const ms = Math.floor((t % 1000) / 10);

    return (
      String(min).padStart(2, "0") +
      ":" +
      String(sec).padStart(2, "0") +
      "." +
      String(ms).padStart(2, "0")
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Stopwatch</Text>

      <View style={styles.center}>
        <Text style={styles.timer}>{format(time)}</Text>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={intervalId ? lap : reset}
          >
            <Text style={styles.btnText}>{intervalId ? "Lap" : "Reset"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={intervalId ? stop : start}
          >
            <Text style={styles.btnText}>{intervalId ? "Stop" : "Start"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.laps}>
        {laps.map((entry, idx) => (
          <Text key={idx} style={styles.lap}>
            Lap {entry.lap}: {format(entry.lapTime)}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  title: {
    textAlign: "center",
    color: "white",
    fontSize: 26,
    marginTop: 20,
    marginBottom: 20,
    fontWeight: "bold",
  },

  center: {
    alignItems: "center",
    marginTop: 40,
  },

  timer: {
    color: "white",
    fontSize: 58,
    marginBottom: 30,
    fontWeight: "bold",
  },

  btnRow: {
    flexDirection: "row",
  },

  button: {
    backgroundColor: "dimgray",
    marginHorizontal: 10,
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 10,
  },

  btnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  laps: {
    marginTop: 40,
    paddingHorizontal: 20,
  },

  lap: {
    color: "lightgray",
    fontSize: 18,
    paddingVertical: 8,
    textAlign: "center",
  },
});

