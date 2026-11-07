import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
} from "react-native";

export default function CountdownTimer() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [popup, setPopup] = useState(false);

  const timeRef = useRef({ h: 0, m: 0, s: 0 });
  const intervalRef = useRef(null);

  useEffect(() => {
    timeRef.current = { h: hours, m: minutes, s: seconds };
  }, [hours, minutes, seconds]);

  useEffect(() => {
    if (running) startInternal();
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function startInternal() {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      let { h, m, s } = timeRef.current;
      const total = h * 3600 + m * 60 + s;

      if (total <= 0) {
        clearInterval(intervalRef.current);
        setRunning(false);
        setPopup(true);
        return;
      }

      const t = total - 1;
      const nh = Math.floor(t / 3600);
      const nm = Math.floor((t % 3600) / 60);
      const ns = t % 60;

      setHours(nh);
      setMinutes(nm);
      setSeconds(ns);
      timeRef.current = { h: nh, m: nm, s: ns };
    }, 1000);
  }

  function reset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  }

  const format = (n) => (n < 10 ? `0${n}` : `${n}`);

  function change(type, val) {
    if (type === "h") setHours((x) => Math.max(0, x + val));
    if (type === "m") setMinutes((x) => Math.max(0, Math.min(59, x + val)));
    if (type === "s") setSeconds((x) => Math.max(0, Math.min(59, x + val)));
  }

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={popup} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Time’s Up!</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setPopup(false)}
            >
              <Text style={styles.modalBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Countdown Timer</Text>

      <Text style={styles.time}>
        {format(hours)}:{format(minutes)}:{format(seconds)}
      </Text>

      <View style={styles.row}>
        {["h", "m", "s"].map((t) => (
          <View key={t} style={styles.col}>
            <TouchableOpacity onPress={() => change(t, 1)}>
              <Text style={styles.arrow}>▲</Text>
            </TouchableOpacity>

            <Text style={styles.label}>
              {t === "h" ? "Hours" : t === "m" ? "Minutes" : "Seconds"}
            </Text>

            <TouchableOpacity onPress={() => change(t, -1)}>
              <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setRunning((r) => !r)}
        >
          <Text style={styles.btnText}>{running ? "Pause" : "Start"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={reset}>
          <Text style={styles.btnText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: 20,
    alignItems: "center",
  },

  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  time: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 25,
  },

  row: {
    flexDirection: "row",
    marginBottom: 30,
  },

  col: {
    alignItems: "center",
    width: 100,
  },

  arrow: {
    color: "white",
    fontSize: 30,
    paddingVertical: 10,
  },

  label: {
    color: "lightgray",
    fontSize: 16,
    marginVertical: 6,
  },

  buttons: {
    flexDirection: "row",
    marginTop: 10,
  },

  button: {
    backgroundColor: "dimgray",
    paddingVertical: 14,
    paddingHorizontal: 30,
    marginHorizontal: 8,
    borderRadius: 10,
  },

  btnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)", // still overlay
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    backgroundColor: "verydarkgray", // human-readable substitute for deep dark
    padding: 25,
    borderRadius: 12,
    alignItems: "center",
  },

  modalTitle: {
    color: "white",
    fontSize: 22,
    marginBottom: 20,
    fontWeight: "600",
  },

  modalButton: {
    backgroundColor: "dimgray",
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },

  modalBtnText: {
    color: "white",
    fontSize: 16,
  },
});
