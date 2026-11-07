import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  Platform,
} from "react-native";

export default function IntervalTimer() {
  const [workH, setWorkH] = useState("0");
  const [workM, setWorkM] = useState("0");
  const [workS, setWorkS] = useState("30");

  const [restH, setRestH] = useState("0");
  const [restM, setRestM] = useState("0");
  const [restS, setRestS] = useState("10");

  const [roundsInput, setRoundsInput] = useState("5");

  const [phase, setPhase] = useState("idle");
  const [remaining, setRemaining] = useState(0);
  const [round, setRound] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [workSeconds, setWorkSeconds] = useState(30);
  const [restSeconds, setRestSeconds] = useState(10);
  const [totalRounds, setTotalRounds] = useState(5);

  const timeoutRef = useRef(null);

  const phaseStartMsRef = useRef(null);
  const phaseDurationSecRef = useRef(0);

  const phaseRef = useRef(phase);
  const roundRef = useRef(round);

  let BIAS_MS;
  if (Platform.OS === "ios") {
    BIAS_MS = 350;
  } else {
    BIAS_MS = 450;
  }

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  function convertToSeconds(h, m, s) {
    return (
      parseInt(h || 0, 10) * 3600 +
      parseInt(m || 0, 10) * 60 +
      parseInt(s || 0, 10)
    );
  }

  function stopTicker() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function startPhase(phaseName, durationSec) {
    setPhase(phaseName);
    phaseStartMsRef.current = Date.now();
    phaseDurationSecRef.current = Math.max(0, durationSec);
    setRemaining(Math.max(0, durationSec));
  }

  function handlePhaseSwitch() {
    const currentPhase = phaseRef.current;

    if (currentPhase === "work") {
      if (restSeconds > 0) {
        startPhase("rest", restSeconds);
      } else {
        advanceRound();
      }
    } else if (currentPhase === "rest") {
      advanceRound();
    }
  }

  function advanceRound() {
    const next = roundRef.current + 1;

    if (next > totalRounds) {
      setIsRunning(false);
      setPhase("done");
      setRemaining(0);
      phaseStartMsRef.current = null;
      Alert.alert("Complete", "All rounds finished!");
      return;
    }

    setRound(next);
    startPhase("work", workSeconds);
  }

  function runTimerTick() {
    stopTicker();

    const tick = () => {
      if (!phaseStartMsRef.current) return;

      const now = Date.now();
      const elapsedMs = now - phaseStartMsRef.current;

      const biasedElapsedMs = elapsedMs + BIAS_MS;

      const elapsedSec = Math.floor(biasedElapsedMs / 1000);

      const dur = phaseDurationSecRef.current || 0;
      const rem = Math.max(0, dur - elapsedSec);
      setRemaining(rem);

      if (rem <= 0) {
        handlePhaseSwitch();
        if (!phaseStartMsRef.current) return;
        timeoutRef.current = setTimeout(tick, 0);
        return;
      }

      const msIntoThisSecond = biasedElapsedMs % 1000;
      const msToNextSecond = 1000 - msIntoThisSecond;

      timeoutRef.current = setTimeout(tick, msToNextSecond);
    };

    tick();
  }

  useEffect(() => {
    if (isRunning) runTimerTick();
    else stopTicker();

    return () => stopTicker();
  }, [isRunning]);

  function startTimer() {
    Keyboard.dismiss();

    const w = convertToSeconds(workH, workM, workS);
    const r = convertToSeconds(restH, restM, restS);
    const t = parseInt(roundsInput || "0", 10);

    if (w <= 0 || t <= 0) {
      Alert.alert("Invalid Input", "Work time and rounds must be > 0.");
      return;
    }

    stopTicker();

    setWorkSeconds(w);
    setRestSeconds(r);
    setTotalRounds(t);

    setRound(1);
    startPhase("work", w);
    setIsRunning(true);
  }

  function handlePauseResume() {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    if (remaining > 0) {
      const p = phaseRef.current;

      let resumePhase;
      if (p === "idle" || p === "done") {
        resumePhase = "work";
      } else {
        resumePhase = p;
      }

      startPhase(resumePhase, remaining);
      setIsRunning(true);
    }
  }

  function resetTimer() {
    stopTicker();
    setIsRunning(false);
    setPhase("idle");
    setRemaining(0);
    setRound(0);
    phaseStartMsRef.current = null;
  }

  function formatTime(sec) {
    const s = Math.max(0, sec);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const secOnly = s % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(secOnly)}`;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Interval Timer</Text>

      <Text style={styles.section}>Work Time</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={workH}
          onChangeText={setWorkH}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
        <TextInput
          style={styles.input}
          value={workM}
          onChangeText={setWorkM}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
        <TextInput
          style={styles.input}
          value={workS}
          onChangeText={setWorkS}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
      </View>

      <Text style={styles.section}>Rest Time</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={restH}
          onChangeText={setRestH}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
        <TextInput
          style={styles.input}
          value={restM}
          onChangeText={setRestM}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
        <TextInput
          style={styles.input}
          value={restS}
          onChangeText={setRestS}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
      </View>

      <Text style={styles.section}>Rounds</Text>
      <TextInput
        style={[styles.input, { width: "40%", alignSelf: "center" }]}
        value={roundsInput}
        onChangeText={setRoundsInput}
        keyboardType="numeric"
        returnKeyType="done"
        onSubmitEditing={Keyboard.dismiss}
      />

      <View style={styles.card}>
        <Text style={styles.phase}>{phase.toUpperCase()}</Text>
        <Text style={styles.time}>{formatTime(remaining)}</Text>
        <Text style={styles.round}>
          {round}/{totalRounds}
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={startTimer}>
          <Text style={styles.btnText}>Start</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handlePauseResume}>
          <Text style={styles.btnText}>{isRunning ? "Pause" : "Resume"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={resetTimer}>
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
    padding: 18,
  },

  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  section: {
    color: "darkgray",
    fontSize: 18,
    marginTop: 10,
    marginBottom: 6,
  },

  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  input: {
    backgroundColor: "dimgray",
    color: "white",
    padding: 14,
    borderRadius: 8,
    width: "30%",
    textAlign: "center",
    fontSize: 18,
    borderWidth: 1,
    borderColor: "gray",
  },

  card: {
    backgroundColor: "dimgray",
    paddingVertical: 30,
    borderRadius: 16,
    marginVertical: 24,
    alignItems: "center",
  },

  phase: {
    color: "lightgray",
    fontSize: 18,
  },

  time: {
    color: "white",
    fontSize: 50,
    fontWeight: "bold",
  },

  round: {
    color: "lightgray",
    fontSize: 16,
    marginTop: 8,
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  button: {
    flex: 1,
    backgroundColor: "gray",
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 10,
  },

  btnText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
});
