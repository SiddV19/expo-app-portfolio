import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import * as Haptics from "expo-haptics";
import * as ScreenOrientation from "expo-screen-orientation";

const PLAYER_SIZE = 54;
const OBJECT_SIZE = 44;

const STARTING_LIVES = 3;
const MAX_LIVES = 5;

const TILT_SENSITIVITY = 30;
const TILT_DEAD_ZONE = 0.04;

const TILT_DIRECTION = Platform.OS === "android" ? -1 : 1;

const START_SPEED = 5;
const MAX_SPEED = 16;

const START_SPAWN_DELAY = 800;
const MIN_SPAWN_DELAY = 300;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fixTilt(rawX) {
  let fixedX = rawX * TILT_DIRECTION;

  if (Math.abs(fixedX) < TILT_DEAD_ZONE) {
    fixedX = 0;
  }

  return fixedX;
}

function isColliding(objectBox, playerBox) {
  return (
    objectBox.x < playerBox.x + playerBox.size &&
    objectBox.x + objectBox.size > playerBox.x &&
    objectBox.y < playerBox.y + playerBox.size &&
    objectBox.y + objectBox.size > playerBox.y
  );
}

async function playHaptic(type) {
  try {
    if (Platform.OS === "web") {
      return;
    }

    if (type === "star") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (type === "bomb") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (type === "heart") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.selectionAsync();
    }
  } catch (error) {
    console.log("Haptics did not work on this device.");
  }
}

function getRandomObjectType() {
  const randomNumber = Math.random();

  if (randomNumber < 0.64) {
    return "star";
  } else if (randomNumber < 0.88) {
    return "bomb";
  } else {
    return "heart";
  }
}

export default function App() {
  const { width, height } = useWindowDimensions();

  const playerY = height - 120;

  const [screen, setScreen] = useState("menu");
  const [playerX, setPlayerX] = useState(width / 2 - PLAYER_SIZE / 2);
  const [objects, setObjects] = useState([]);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [level, setLevel] = useState(1);

  const tiltX = useRef(0);

  const screenRef = useRef("menu");
  const playerXRef = useRef(width / 2 - PLAYER_SIZE / 2);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const livesRef = useRef(STARTING_LIVES);

  const objectSpeed = useRef(START_SPEED);
  const spawnDelay = useRef(START_SPAWN_DELAY);
  const lastSpawnTime = useRef(0);
  const nextObjectId = useRef(1);

  const backgroundDots = useRef(
    Array.from({ length: 35 }, function (_, index) {
      return {
        id: index,
        left: Math.random() * 500,
        top: Math.random() * 900,
        size: 2 + Math.random() * 3,
      };
    })
  ).current;

  useEffect(() => {
    async function lockScreenPortrait() {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      } catch (error) {
        console.log("Screen orientation lock did not work.");
      }
    }

    lockScreenPortrait();
  }, []);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  function startGame() {
    playHaptic("button");

    const startingX = width / 2 - PLAYER_SIZE / 2;

    screenRef.current = "playing";
    playerXRef.current = startingX;
    scoreRef.current = 0;
    livesRef.current = STARTING_LIVES;

    objectSpeed.current = START_SPEED;
    spawnDelay.current = START_SPAWN_DELAY;
    lastSpawnTime.current = Date.now();
    nextObjectId.current = 1;

    setScreen("playing");
    setPlayerX(startingX);
    setObjects([]);
    setScore(0);
    setLives(STARTING_LIVES);
    setLevel(1);
  }

  function endGame() {
    if (screenRef.current !== "playing") {
      return;
    }

    screenRef.current = "gameOver";

    if (scoreRef.current > highScoreRef.current) {
      highScoreRef.current = scoreRef.current;
      setHighScore(scoreRef.current);
    }

    setScreen("gameOver");
  }

  useEffect(() => {
    if (screen !== "playing") {
      return;
    }

    Accelerometer.setUpdateInterval(40);

    const subscription = Accelerometer.addListener(function (data) {
      tiltX.current = fixTilt(data.x);
    });

    return function () {
      subscription.remove();
    };
  }, [screen]);

  useEffect(() => {
    if (screen !== "playing") {
      return;
    }

    const gameTimer = setInterval(function () {
      if (screenRef.current !== "playing") {
        return;
      }

      let newPlayerX = playerXRef.current + tiltX.current * TILT_SENSITIVITY;
      newPlayerX = clamp(newPlayerX, 0, width - PLAYER_SIZE);

      playerXRef.current = newPlayerX;
      setPlayerX(newPlayerX);

      setObjects(function (currentObjects) {
        const updatedObjects = [];
        let bombHitThisFrame = false;

        for (let i = 0; i < currentObjects.length; i++) {
          const currentObject = currentObjects[i];

          const movedObject = {
            id: currentObject.id,
            type: currentObject.type,
            x: currentObject.x,
            y: currentObject.y + objectSpeed.current,
          };

          const objectBox = {
            x: movedObject.x,
            y: movedObject.y,
            size: OBJECT_SIZE,
          };

          const playerBox = {
            x: newPlayerX,
            y: playerY,
            size: PLAYER_SIZE,
          };

          const touchedPlayer = isColliding(objectBox, playerBox);

          if (touchedPlayer) {
            if (movedObject.type === "star") {
              playHaptic("star");

              scoreRef.current = scoreRef.current + 1;
              setScore(scoreRef.current);

              if (scoreRef.current % 5 === 0) {
                objectSpeed.current = Math.min(
                  MAX_SPEED,
                  objectSpeed.current + 1
                );

                spawnDelay.current = Math.max(
                  MIN_SPAWN_DELAY,
                  spawnDelay.current - 25
                );
              }
            } else if (movedObject.type === "bomb" && !bombHitThisFrame) {
              bombHitThisFrame = true;

              playHaptic("bomb");

              livesRef.current = livesRef.current - 1;
              setLives(livesRef.current);

              if (livesRef.current <= 0) {
                endGame();
              }
            } else if (movedObject.type === "heart") {
              playHaptic("heart");

              if (livesRef.current < MAX_LIVES) {
                livesRef.current = livesRef.current + 1;
                setLives(livesRef.current);
              } else {
                scoreRef.current = scoreRef.current + 2;
                setScore(scoreRef.current);
              }
            }
          } else {
            if (movedObject.y < height) {
              updatedObjects.push(movedObject);
            }
          }
        }

        const currentTime = Date.now();

        if (currentTime - lastSpawnTime.current >= spawnDelay.current) {
          const newObject = {
            id: nextObjectId.current,
            type: getRandomObjectType(),
            x: Math.random() * (width - OBJECT_SIZE),
            y: -OBJECT_SIZE,
          };

          updatedObjects.push(newObject);

          nextObjectId.current = nextObjectId.current + 1;
          lastSpawnTime.current = currentTime;
        }

        return updatedObjects;
      });
    }, 20);

    return function () {
      clearInterval(gameTimer);
    };
  }, [screen, width, height, playerY]);

  useEffect(() => {
    if (screen !== "playing") {
      return;
    }

    const difficultyTimer = setInterval(function () {
      objectSpeed.current = Math.min(MAX_SPEED, objectSpeed.current + 1);

      spawnDelay.current = Math.max(
        MIN_SPAWN_DELAY,
        spawnDelay.current - 55
      );

      setLevel(function (currentLevel) {
        return currentLevel + 1;
      });
    }, 5000);

    return function () {
      clearInterval(difficultyTimer);
    };
  }, [screen]);

  function getObjectEmoji(type) {
    if (type === "star") {
      return "⭐";
    } else if (type === "bomb") {
      return "💣";
    } else {
      return "❤️";
    }
  }

  function getObjectStyle(type) {
    if (type === "star") {
      return styles.starObject;
    } else if (type === "bomb") {
      return styles.bombObject;
    } else {
      return styles.heartObject;
    }
  }

  if (screen === "menu") {
    return (
      <SafeAreaView style={styles.container}>
        {backgroundDots.map(function (dot) {
          return (
            <View
              key={dot.id}
              style={[
                styles.backgroundDot,
                {
                  left: dot.left % width,
                  top: dot.top % height,
                  width: dot.size,
                  height: dot.size,
                  borderRadius: dot.size / 2,
                },
              ]}
            />
          );
        })}

        <View style={styles.centerCard}>
          <Text style={styles.title}>Star Rush</Text>

          <Text style={styles.subtitle}>
            Tilt your phone left and right to catch stars, dodge bombs, and grab
            hearts.
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Catch stars: +1 point</Text>
            <Text style={styles.infoText}>Hit bombs: lose 1 life</Text>
            <Text style={styles.infoText}>Catch hearts: gain 1 life</Text>
            <Text style={styles.infoText}>Max lives: 5</Text>
            <Text style={styles.infoText}>The pace increases as you play</Text>
            <Text style={styles.infoText}>Objects use haptic feedback</Text>
          </View>

          <Text style={styles.highScoreText}>High Score: {highScore}</Text>

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>START GAME</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "gameOver") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerCard}>
          <Text style={styles.gameOverTitle}>Game Over</Text>

          <Text style={styles.finalScoreText}>Final Score: {score}</Text>
          <Text style={styles.highScoreText}>High Score: {highScore}</Text>

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>PLAY AGAIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={function () {
              playHaptic("button");
              screenRef.current = "menu";
              setScreen("menu");
            }}
          >
            <Text style={styles.menuButtonText}>MAIN MENU</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {backgroundDots.map(function (dot) {
        return (
          <View
            key={dot.id}
            style={[
              styles.backgroundDot,
              {
                left: dot.left % width,
                top: dot.top % height,
                width: dot.size,
                height: dot.size,
                borderRadius: dot.size / 2,
              },
            ]}
          />
        );
      })}

      <View style={styles.hud}>
        <Text style={styles.hudText}>Score: {score}</Text>
        <Text style={styles.hudText}>Lives: {"❤️".repeat(lives)}</Text>
        <Text style={styles.hudText}>Pace Level: {level}</Text>
        <Text style={styles.hudText}>Best: {highScore}</Text>
      </View>

      {objects.map(function (object) {
        return (
          <View
            key={object.id}
            style={[
              styles.fallingObject,
              getObjectStyle(object.type),
              {
                transform: [
                  { translateX: object.x },
                  { translateY: object.y },
                ],
              },
            ]}
          >
            <Text style={styles.objectEmoji}>
              {getObjectEmoji(object.type)}
            </Text>
          </View>
        );
      })}

      <View
        style={[
          styles.player,
          {
            left: playerX,
            top: playerY,
          },
        ]}
      >
        <Text style={styles.playerEmoji}>🚀</Text>
      </View>

      <TouchableOpacity
        style={styles.endButton}
        onPress={function () {
          playHaptic("button");
          endGame();
        }}
      >
        <Text style={styles.endButtonText}>END</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111f",
    overflow: "hidden",
  },

  backgroundDot: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.55)",
  },

  centerCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "#51d1ff",
    textShadowRadius: 18,
  },

  subtitle: {
    fontSize: 16,
    color: "#d7e7ff",
    textAlign: "center",
    marginBottom: 25,
  },

  infoBox: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },

  infoText: {
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 8,
  },

  highScoreText: {
    color: "#ffd166",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
  },

  startButton: {
    backgroundColor: "#51d1ff",
    paddingVertical: 15,
    paddingHorizontal: 45,
    borderRadius: 30,
    marginBottom: 12,
  },

  startButtonText: {
    color: "#07111f",
    fontSize: 19,
    fontWeight: "bold",
  },

  menuButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 13,
    paddingHorizontal: 38,
    borderRadius: 30,
  },

  menuButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },

  gameOverTitle: {
    color: "#ff5c7a",
    fontSize: 46,
    fontWeight: "bold",
    marginBottom: 25,
  },

  finalScoreText: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },

  hud: {
    position: "absolute",
    top: 45,
    left: 18,
    right: 18,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  hudText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },

  fallingObject: {
    position: "absolute",
    left: 0,
    top: 0,
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
    borderRadius: OBJECT_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },

  starObject: {
    backgroundColor: "rgba(255, 209, 102, 0.65)",
    borderColor: "#ffe8a3",
    shadowColor: "#ffd166",
  },

  bombObject: {
    backgroundColor: "rgba(255, 92, 122, 0.7)",
    borderColor: "#ffc2ce",
    shadowColor: "#ff5c7a",
  },

  heartObject: {
    backgroundColor: "rgba(255, 105, 180, 0.7)",
    borderColor: "#ffd1e8",
    shadowColor: "#ff69b4",
  },

  objectEmoji: {
    fontSize: 30,
  },

  player: {
    position: "absolute",
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    borderRadius: PLAYER_SIZE / 2,
    backgroundColor: "rgba(81, 209, 255, 0.25)",
    borderWidth: 2,
    borderColor: "#51d1ff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#51d1ff",
    shadowOpacity: 1,
    shadowRadius: 12,
  },

  playerEmoji: {
    fontSize: 26,
  },

  endButton: {
    position: "absolute",
    bottom: 35,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
  },

  endButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});