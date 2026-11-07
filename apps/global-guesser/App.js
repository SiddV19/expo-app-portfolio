import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, Polyline } from 'react-native-maps';



const STORAGE_KEYS = {
  highScore: 'globalguesser_high_score',
  lastScore: 'globalguesser_last_score',
};

const locations = [
  {
    name: 'Chicago Bean IL',
    longitude: -87.623303,
    latitude: 41.882657,
    images: require('./ChicagoBean.jpg'),
  },
  {
    name: 'Monument Valley AZ',
    longitude: -110.178986,
    latitude: 36.998979,
    images: require('./MValley.jpg'),
  },
  {
    name: 'Grand Canyon AZ',
    longitude: -112.112997,
    latitude: 36.059446,
    images: require('./GrandCanyon.jpg'),
  },
  {
    name: 'Yellow Stone WY',
    longitude: -110.82814,
    latitude: 44.460552,
    images: require('./YellowStone.webp'),
  },
  {
    name: 'Miami Beach FL',
    longitude: -80.130045,
    latitude: 25.790654,
    images: require('./MiamiBeach.webp'),
  },
  {
    name: 'Chicago River IL',
    longitude: -87.623177,
    latitude: 41.888034,
    images: require('./Chicagoriver.webp'),
  },
  {
    name: 'Glacier Park MT',
    longitude: -113.718284,
    latitude: 48.696667,
    images: require('./GlacierPark.webp'),
  },
  {
    name: 'Route 66 AZ',
    longitude: -112.878803,
    latitude: 35.325007,
    images: require('./Route66.jpeg'),
  },
  {
    name: 'Bar Harbor ME',
    longitude: -68.204704,
    latitude: 44.387611,
    images: require('./BarHarbor.jpg'),
  },
  {
    name: 'Golden Gate Bridge CA',
    longitude: -122.478255,
    latitude: 37.819929,
    images: require('./GoldenGateBridge.webp'),
  },
];

const toRadians = (degrees) => (degrees * Math.PI) / 180;

function haversineKm(lat1, lon1, lat2, lon2) {
  const EARTH_RADIUS_KM = 6371;

  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const deltaLatRad = toRadians(lat2 - lat1);
  const deltaLonRad = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLonRad / 2) *
      Math.sin(deltaLonRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

function scoreFromDistanceKm(distanceKm) {
  const maxPoints = 5000;
  const score = maxPoints / Math.pow(1 + distanceKm / 150, 1.35);
  return Math.round(Math.min(maxPoints, Math.max(0, score)));
}

function shuffleArray(array) {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

function getFinalRating(score, totalRounds) {
  const percent = (score / (totalRounds * 5000)) * 100;

}

export default function App() {
  const mapRef = useRef(null);

  const [screen, setScreen] = useState('welcome');
  const [gameLocations, setGameLocations] = useState(() =>
    shuffleArray(locations)
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const [marker, setMarker] = useState(null);
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [roundScore, setRoundScore] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [hasGuessed, setHasGuessed] = useState(false);

  const [finalScore, setFinalScore] = useState(null);
  const [bestRoundScore, setBestRoundScore] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);

  const [highScore, setHighScore] = useState(0);
  const [lastSavedScore, setLastSavedScore] = useState(0);

  const current = gameLocations[currentIndex];

  const USA_BOUNDS = {
    northEast: { latitude: 49.5, longitude: -66.5 },
    southWest: { latitude: 24.5, longitude: -124.9 },
  };

  const USA_INITIAL_REGION = {
    latitude: 39.5,
    longitude: -98.35,
    latitudeDelta: 28,
    longitudeDelta: 38,
  };

const actualCoordinate = current && {
  latitude: current.latitude,
  longitude: current.longitude,
};

  useEffect(() => {
    loadSavedScores();
  }, []);

  const loadSavedScores = async () => {
  try {
    const high = await AsyncStorage.getItem(STORAGE_KEYS.highScore);
    const last = await AsyncStorage.getItem(STORAGE_KEYS.lastScore);

    if (high) setHighScore(Number(high));
    if (last) setLastSavedScore(Number(last));
  } catch (error) {
    console.log('Error loading scores:', error);
  }
};

 const saveScores = async (score) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.lastScore, String(score));
    setLastSavedScore(score);

    if (score > highScore) {
      await AsyncStorage.setItem(STORAGE_KEYS.highScore, String(score));
      setHighScore(score);
    }
  } catch (error) {
    console.log('Error saving scores:', error);
  }
};

  const resetRoundState = () => {
  setMarker(null);
  setRoundScore(null);
  setDistanceKm(null);
  setHasGuessed(false);

  setTimeout(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(USA_INITIAL_REGION, 800);
    }
  }, 100);
};

  const startNewGame = () => {
  setGameLocations(shuffleArray(locations));
  setCurrentIndex(0);
  setRound(1);
  setTotalScore(0);
  setFinalScore(null);
  setBestRoundScore(0);
  setTotalDistance(0);
  setRoundsPlayed(0);
  resetRoundState();
  setScreen('game');
};

  const handleGuess = () => {
  if (!marker || !current || hasGuessed) return;

  const distance = haversineKm(
    marker.latitude,
    marker.longitude,
    current.latitude,
    current.longitude
  );

  const points = scoreFromDistanceKm(distance);

  setDistanceKm(distance);
  setRoundScore(points);
  setTotalScore(totalScore + points);
  setBestRoundScore(Math.max(bestRoundScore, points));
  setTotalDistance(totalDistance + distance);
  setRoundsPlayed(roundsPlayed + 1);
  setHasGuessed(true);

  setTimeout(() => {
    mapRef.current?.fitToCoordinates([marker, actualCoordinate], {
      edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
      animated: true,
    });
  }, 250);
};

  const handleNext = () => {
  if (currentIndex === gameLocations.length - 1) {
    handleEndGame();
    return;
  }

  setCurrentIndex(currentIndex + 1);
  setRound(round + 1);
  resetRoundState();
};

  const handleEndGame = async () => {
  setFinalScore(totalScore);
  await saveScores(totalScore);

  setRound(1);
  setTotalScore(0);
  setGameLocations(shuffleArray(locations));
  setCurrentIndex(0);
  resetRoundState();
  setScreen('welcome');
};

  const averageDistance =
    roundsPlayed > 0 ? (totalDistance / roundsPlayed).toFixed(1) : null;

  if (screen === 'welcome') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>GlobalGuesser</Text>

          {finalScore !== null && (
            <View style={styles.finalScoreCard}>
              <Text style={styles.finalScoreLabel}>Game Complete</Text>
              <Text style={styles.finalScoreText}>{finalScore} pts</Text>
              <Text style={styles.finalScoreSubtext}>
                {getFinalRating(finalScore, locations.length)}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{bestRoundScore}</Text>
                  <Text style={styles.statLabel}>Best Round</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>
                    {averageDistance !== null ? averageDistance : '--'}
                  </Text>
                  <Text style={styles.statLabel}>Avg km Off</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.savedScoresCard}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{highScore}</Text>
                <Text style={styles.statLabel}>High Score</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{lastSavedScore}</Text>
                <Text style={styles.statLabel}>Last Score</Text>
              </View>
            </View>
          </View>

          {finalScore === null && (
            <View style={styles.card}>
              <Text style={styles.cardText}>• Press Start</Text>
              <Text style={styles.cardText}>
                • Top half shows a randomized location image
              </Text>
              <Text style={styles.cardText}>
                • Bottom half is the USA map to place your guess
              </Text>
              <Text style={styles.cardText}>
                • After guessing, the true location and line are shown
              </Text>
              <Text style={styles.cardText}>
                • Close guesses get much more points
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.singleButton} onPress={startNewGame}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topHalf}>
          <View style={styles.topBar}>
            <Text style={styles.sectionTitle}>
              Round {round} / {gameLocations.length}
            </Text>
            <Text style={styles.sectionTitle}>Total: {totalScore}</Text>
          </View>

          <View style={styles.imagePlaceholder}>
            {current ? (
              <Image
                source={current.images}
                style={styles.locationImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.imagePlaceholderText}>No image found</Text>
            )}
          </View>
        </View>

        <View style={styles.bottomHalf}>
          <Text style={styles.sectionTitle}>Tap USA map to guess</Text>

          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={USA_INITIAL_REGION}
              cameraBoundaries={USA_BOUNDS}
              minZoomLevel={3}
              maxZoomLevel={12}
              rotateEnabled={false}
              pitchEnabled={false}
              onPress={(e) => {
                if (hasGuessed) return;
                setMarker(e.nativeEvent.coordinate);
              }}
            >
              {marker && (
                <Marker
                  coordinate={marker}
                  title="Your Guess"
                  pinColor="blue"
                />
              )}

              {hasGuessed && actualCoordinate && (
                <Marker
                  coordinate={actualCoordinate}
                  title={current.name}
                  pinColor="red"
                />
              )}

              {hasGuessed && marker && actualCoordinate && (
                <Polyline
                  coordinates={[marker, actualCoordinate]}
                  strokeWidth={4}
                  strokeColor="#4da6ff"
                />
              )}
            </MapView>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                (!marker || hasGuessed) && styles.buttonDisabled,
              ]}
              disabled={!marker || hasGuessed}
              onPress={handleGuess}
            >
              <Text style={styles.buttonText}>Guess</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                !hasGuessed && styles.buttonDisabled,
              ]}
              disabled={!hasGuessed}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleEndGame}
            >
              <Text style={styles.buttonText}>End</Text>
            </TouchableOpacity>
          </View>

          {hasGuessed && distanceKm !== null && roundScore !== null && (
            <View style={styles.scoreCard}>
              <Text style={styles.scoreText}>
                Distance: {distanceKm.toFixed(1)} km
              </Text>
              <Text style={styles.scoreText}>Round Score: {roundScore}</Text>
              <Text style={styles.scoreText}>
                Correct Location: {current.name}
              </Text>
            </View>
          )}

          <TouchableOpacity onPress={handleEndGame}>
            <Text style={styles.link}>← End Game</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0b1020',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 14,
  },

  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },

  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },

  sectionTitle: {
    color: '#cdd5ff',
    fontSize: 14,
    fontWeight: '900',
  },

  finalScoreCard: {
    backgroundColor: '#121a33',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3b5bff',
    width: '100%',
    gap: 8,
  },

  savedScoresCard: {
    width: '100%',
  },

  finalScoreLabel: {
    color: '#9fb0ff',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  finalScoreText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },

  finalScoreSubtext: {
    color: '#cdd5ff',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },

  statBox: {
    flex: 1,
    backgroundColor: '#1a2342',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  statNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },

  statLabel: {
    color: '#9fb0ff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },

  card: {
    backgroundColor: '#121a33',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    gap: 6,
  },

  cardText: {
    color: '#d6dcff',
    fontSize: 13,
  },

  topHalf: {
    flex: 1,
    gap: 10,
  },

  bottomHalf: {
    flex: 1,
    gap: 10,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#121a33',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a3355',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 8,
  },

  imagePlaceholderText: {
    color: '#9fb0ff',
    textAlign: 'center',
    fontWeight: '800',
  },

  locationImage: {
    width: '100%',
    height: '100%',
  },

  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },

  map: {
    flex: 1,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
  },

  secondaryButton: {
    backgroundColor: '#2a3355',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },

  dangerButton: {
    backgroundColor: '#ff3b3b',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },

  singleButton: {
    backgroundColor: '#3b5bff',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignSelf: 'center',
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  buttonText: {
    color: 'white',
    fontWeight: '800',
  },

  scoreCard: {
    backgroundColor: '#121a33',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2a3355',
  },

  scoreText: {
    color: '#d6dcff',
    textAlign: 'center',
    fontWeight: '800',
  },

  link: {
    color: '#9fb0ff',
    textAlign: 'center',
    fontWeight: '800',
  },
});