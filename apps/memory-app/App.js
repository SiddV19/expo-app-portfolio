import React, { useMemo, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  View,
  Image,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const initialCards = [
  { id: "1", brand: "BMW", flipped: false, matched: false },
  { id: "2", brand: "BMW", flipped: false, matched: false },
  { id: "3", brand: "Audi", flipped: false, matched: false },
  { id: "4", brand: "Audi", flipped: false, matched: false },
  { id: "5", brand: "Porsche", flipped: false, matched: false },
  { id: "6", brand: "Porsche", flipped: false, matched: false },
  { id: "7", brand: "Genesis", flipped: false, matched: false },
  { id: "8", brand: "Genesis", flipped: false, matched: false },
  { id: "9", brand: "Bentley", flipped: false, matched: false },
  { id: "10", brand: "Bentley", flipped: false, matched: false },
  { id: "11", brand: "Aston Martin", flipped: false, matched: false },
  { id: "12", brand: "Aston Martin", flipped: false, matched: false },
  { id: "13", brand: "Ferrari", flipped: false, matched: false },
  { id: "14", brand: "Ferrari", flipped: false, matched: false },
  { id: "15", brand: "Range Rover", flipped: false, matched: false },
  { id: "16", brand: "Range Rover", flipped: false, matched: false },
  { id: "17", brand: "Mustang", flipped: false, matched: false },
  { id: "18", brand: "Mustang", flipped: false, matched: false },
  { id: "19", brand: "Rolls Royce", flipped: false, matched: false },
  { id: "20", brand: "Rolls Royce", flipped: false, matched: false },
];

const BRAND_IMAGES = {
  BMW: require("./BMW.webp"),
  Audi: require("./Audi.png"),
  Porsche: require("./Porsche.webp"),
  Genesis: require("./Genesis.png"),
  Bentley: require("./Bentley.png"),
  "Aston Martin": require("./Aston-Martin-logo.png"),
  Ferrari: require("./Ferrari.jpg"),
  "Range Rover": require("./land-rover-2-logo-png-transparent.png"),
  Mustang: require("./ford-mustang-emblem-sticker-ford-mustang-logo-11562940334cmopgfxsgu.png"),
  "Rolls Royce": require("./rolls-royce-2-logo-black-and-white.png"),
};

const HIGH_SCORE_KEY = "car_memory_high_score_moves";

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ title: "Welcome" }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ title: "Car Brand Memory" }}
        />
        <Stack.Screen
          name="Win"
          component={WinScreen}
          options={{ title: "You Win!" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Car Brand Memory</Text>
      <Text style={styles.subtitle}>
        Match all the pairs in as few moves as possible.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("Game")}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>Start Game</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function GameScreen({ navigation }) {
  const { width: screenW } = useWindowDimensions();

  const [cards, setCards] = useState(() => shuffleArray(initialCards));

  const [firstPickId, setFirstPickId] = useState(null);
  const [secondPickId, setSecondPickId] = useState(null);
  const [lockBoard, setLockBoard] = useState(false);

  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [highScore, setHighScore] = useState(null);

  const [gridAreaH, setGridAreaH] = useState(0);

  useEffect(() => {
    async function loadHighScore() {
      try {
        const stored = await AsyncStorage.getItem(HIGH_SCORE_KEY);
        if (stored !== null) setHighScore(Number(stored));
      } catch (e) {}
    }
    loadHighScore();
  }, []);

  const numColumns = 4;
  const gap = 10;
  const gridPadding = 16;

  const numRows = useMemo(() => {
    return Math.ceil(initialCards.length / numColumns); 
  }, []);

  const cardSize = useMemo(() => {
    if (!gridAreaH) return 0;

    const totalGapsH = gap * (numRows - 1);
    const totalPaddingH = gridPadding * 2;
    const sizeByHeight = (gridAreaH - totalPaddingH - totalGapsH) / numRows;

    const totalGapsW = gap * (numColumns - 1);
    const totalPaddingW = gridPadding * 2;
    const sizeByWidth = (screenW - totalPaddingW - totalGapsW) / numColumns;

    return Math.max(10, Math.floor(Math.min(sizeByHeight, sizeByWidth)));
  }, [gridAreaH, screenW, numRows]);

  function resetGame() {
    setCards(shuffleArray(initialCards));
    setFirstPickId(null);
    setSecondPickId(null);
    setLockBoard(false);
    setMoves(0);
    setMatches(0);
  }

  function handleFlip(id) {
    if (lockBoard) return;

    const tapped = cards.find((c) => c.id === id);
    if (!tapped) return;

    if (tapped.matched || tapped.flipped) return;

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c))
    );

    if (firstPickId === null) {
      setFirstPickId(id);
    } else if (secondPickId === null && id !== firstPickId) {
      setSecondPickId(id);
      setLockBoard(true);
    }
  }

  useEffect(() => {
  if (firstPickId === null || secondPickId === null) {
    return;
  }

  const first = cards.find((c) => c.id === firstPickId);
  const second = cards.find((c) => c.id === secondPickId);

  if (first === undefined || second === undefined) {
    return;
  }

  setMoves((m) => m + 1);

  if (first.brand === second.brand) {
    setCards((prev) => {
      return prev.map((c) => {
        if (c.id === firstPickId || c.id === secondPickId) {
          return {
            ...c,
            matched: true,
          };
        }
        return c;
      });
    });

    setMatches((x) => x + 1);

    setFirstPickId(null);
    setSecondPickId(null);
    setLockBoard(false);
  } else {
    const timeout = setTimeout(() => {
      setCards((prev) => {
        return prev.map((c) => {
          if (c.id === firstPickId || c.id === secondPickId) {
            return {
              ...c,
              flipped: false,
            };
          }
          return c;
        });
      });

      setFirstPickId(null);
      setSecondPickId(null);
      setLockBoard(false);
    }, 700);

    return () => clearTimeout(timeout);
  }
}, [firstPickId, secondPickId, cards]);


  useEffect(() => {
    const totalPairs = initialCards.length / 2;
    if (matches !== totalPairs) return;

    async function saveIfBest() {
      try {
        if (highScore === null || moves < highScore) {
          await AsyncStorage.setItem(HIGH_SCORE_KEY, String(moves));
          setHighScore(moves);
        }
      } catch (e) {}
    }

    saveIfBest();
    navigation.replace("Win", { moves });
  }, [matches]);

  function renderItem({ item }) {
    const img = BRAND_IMAGES[item.brand];

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleFlip(item.id)}
        style={[
          styles.card,
          {
            width: cardSize,
            height: cardSize,
            marginBottom: gap,
            marginHorizontal: gap / 2,
          },
          item.flipped ? styles.cardFlipped : styles.cardHidden,
        ]}
      >
        {!item.flipped && (
          <View style={styles.cover}>
            <Text style={styles.questionMark}>?</Text>
          </View>
        )}

        {item.flipped && (
          <View style={styles.faceUp}>
            {img ? (
              <Image source={img} style={styles.logo} resizeMode="contain" />
            ) : (
              <Text style={styles.placeholderText}>{item.brand}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Car Brand Memory</Text>

      <View style={styles.scoreRow}>
        <Text style={styles.scoreText}>Moves: {moves}</Text>
        <Text style={styles.scoreText}>Matches: {matches}</Text>
        <Text style={styles.scoreText}>
          Best: {highScore === null ? "-" : highScore}
        </Text>
      </View>

      {/* Measured grid container */}
      <View
        style={{ flex: 1, alignItems: "center" }}
        onLayout={(e) => setGridAreaH(e.nativeEvent.layout.height)}
      >
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={numColumns}
          contentContainerStyle={{
            padding: gridPadding,
            paddingBottom: gridPadding,
            alignItems: "center",
          }}
          columnWrapperStyle={{
            justifyContent: "center",
          }}
          scrollEnabled={false}
          removeClippedSubviews={false}
        />
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={resetGame}
        activeOpacity={0.85}
      >
        <Text style={styles.secondaryButtonText}>Reset</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function WinScreen({ navigation, route }) {
  const moves = route?.params?.moves ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>You Win! 🎉</Text>
      <Text style={styles.subtitle}>Finished in {moves} moves.</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.replace("Game")}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>Play Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.popToTop()}
        activeOpacity={0.85}
      >
        <Text style={styles.secondaryButtonText}>Back to Welcome</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
  },

  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
  },

  subtitle: {
    color: "white",
    opacity: 0.85,
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 20,
  },

  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  scoreText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },

  card: {
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  cardHidden: {
    backgroundColor: "#1f2a44",
  },

  cardFlipped: {
    backgroundColor: "#f8fafc",
  },

  cover: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1f2a44",
    alignItems: "center",
    justifyContent: "center",
  },

  questionMark: {
    color: "white",
    fontSize: 40,
    fontWeight: "900",
  },

  faceUp: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },

  logo: {
    width: "100%",
    height: "100%",
  },

  placeholderText: {
    color: "#0b1220",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 14,
  },

  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignSelf: "center",
    marginTop: 8,
    minWidth: 180,
  },

  primaryButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },

  secondaryButton: {
    borderWidth: 2,
    borderColor: "#93c5fd",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 12,
    minWidth: 180,
  },

  secondaryButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },
});
