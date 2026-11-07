import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  TextInput,
  FlatList,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
const windowHeight = Dimensions.get('window').height;
const STORAGE_KEY = 'saved_routes_v1';
const ELEVATION_THRESHOLD_METERS = 2;

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatElapsedTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  const min = String(minutes).padStart(2, '0');
  const sec = String(seconds).padStart(2, '0');

  if (hours > 0) {
    const hr = String(hours).padStart(2, '0');
    return `${hr}:${min}:${sec}`;
  }

  return `${min}:${sec}`;
}

function formatDateString(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function formatElevation(value) {
  if (Number.isFinite(value)) {
    return `${value.toFixed(1)} m`;
  }
  return '--';
}

function getAltitudeValue(value) {
  if (value === null || value === undefined) {
    return 0;
  }
  return value;
}

function calculateElevationStats(points) {
  if (!points || points.length === 0) {
    return {
      startElevation: 0,
      endElevation: 0,
      elevationGain: 0,
      elevationLoss: 0,
      netElevationChange: 0,
      minElevation: 0,
      maxElevation: 0,
      currentElevation: 0,
    };
  }

  const startElevation = getAltitudeValue(points[0].altitude);
  const endElevation = getAltitudeValue(points[points.length - 1].altitude);

  let minElevation = startElevation;
  let maxElevation = startElevation;
  let elevationGain = 0;
  let elevationLoss = 0;

  for (let i = 1; i < points.length; i++) {
    const prev = getAltitudeValue(points[i - 1].altitude);
    const curr = getAltitudeValue(points[i].altitude);
    const diff = curr - prev;

    if (curr < minElevation) {
      minElevation = curr;
    }

    if (curr > maxElevation) {
      maxElevation = curr;
    }

    if (diff > ELEVATION_THRESHOLD_METERS) {
      elevationGain = elevationGain + diff;
    } else if (diff < -ELEVATION_THRESHOLD_METERS) {
      elevationLoss = elevationLoss + Math.abs(diff);
    }
  }

  const netElevationChange = endElevation - startElevation;

  return {
    startElevation: startElevation,
    endElevation: endElevation,
    elevationGain: elevationGain,
    elevationLoss: elevationLoss,
    netElevationChange: netElevationChange,
    minElevation: minElevation,
    maxElevation: maxElevation,
    currentElevation: endElevation,
  };
}

function IntroScreen({ navigation }) {
  const [savedRoutes, setSavedRoutes] = useState([]);

  const loadRoutes = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        setSavedRoutes(JSON.parse(stored));
      } else {
        setSavedRoutes([]);
      }
    } catch (error) {
      console.log('Error loading routes:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRoutes();
    }, [])
  );

  const renderSavedRoute = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.savedRouteCard}
        onPress={() =>
          navigation.navigate('RouteDetail', {
            routeData: item,
          })
        }>
        <Text style={styles.savedRouteTitle}>{item.name}</Text>
        <Text style={styles.savedRouteText}>
          Distance: {(item.totalDistance / 1609.34).toFixed(2)} miles
        </Text>
        <Text style={styles.savedRouteText}>
          Average Pace: {item.averagePace}
        </Text>
        <Text style={styles.savedRouteText}>Time: {item.formattedTime}</Text>
        <Text style={styles.savedRouteText}>
          Elevation Gain: {formatElevation(item.elevationGain)}
        </Text>
        <Text style={styles.savedRouteText}>
          Elevation Loss: {formatElevation(item.elevationLoss)}
        </Text>
        <Text style={styles.savedRouteText}>
          Net Change: {formatElevation(item.netElevationChange)}
        </Text>
        <Text style={styles.savedRouteDate}>{formatDateString(item.date)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.introScroll}>
        <View style={styles.heroCard}>
          <Text style={styles.appTitle}>Run Tracker</Text>
          <Text style={styles.subtitle}>
            A running app that tracks total distance, pace, elapsed time, and
            elevation while drawing your live route on the map.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>How To Use</Text>
          <Text style={styles.bodyText}>
            • Tap Start Run to open the live map.
          </Text>
          <Text style={styles.bodyText}>
            • The map will zoom into your current location automatically.
          </Text>
          <Text style={styles.bodyText}>
            • Press Start Run on the map screen to begin tracking.
          </Text>
          <Text style={styles.bodyText}>
            • Use Pause Run if you need to stop temporarily.
          </Text>
          <Text style={styles.bodyText}>
            • Distance is shown in miles and pace is shown in min/mile.
          </Text>
          <Text style={styles.bodyText}>
            • Elevation gain, loss, and net change are tracked separately.
          </Text>
          <Text style={styles.bodyText}>
            • Tap a saved route later to view it again or delete it.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryWideButton}
          onPress={() => navigation.navigate('Run')}>
          <Text style={styles.primaryButtonText}>Start Run</Text>
        </TouchableOpacity>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Previous Routes</Text>
          {savedRoutes.length === 0 ? (
            <Text style={styles.emptyText}>No saved routes yet.</Text>
          ) : (
            <FlatList
              data={savedRoutes}
              keyExtractor={(item) => item.id}
              renderItem={renderSavedRoute}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RunScreen({ navigation }) {
  const mapRef = useRef(null);
  const previousLocation = useRef(null);
  const previousTime = useRef(Date.now());
  const locationSubscriptionRef = useRef(null);
  const hasCenteredMapRef = useRef(false);

  const [time, setTime] = useState('00:00');
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [location, setLocation] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [route, setRoute] = useState([]);
  const [speedMinPerMile, setSpeedMinPerMile] = useState('--:--');
  const [mapMode, setMapMode] = useState('follow');

  const [currentElevation, setCurrentElevation] = useState(0);
  const [elevationGain, setElevationGain] = useState(0);
  const [elevationLoss, setElevationLoss] = useState(0);
  const [netElevationChange, setNetElevationChange] = useState(0);
  const [startElevation, setStartElevation] = useState(0);
  const [minElevation, setMinElevation] = useState(0);
  const [maxElevation, setMaxElevation] = useState(0);

  useEffect(() => {
    let interval = null;
    let last = Date.now();

    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((prev) => {
          const now = Date.now();
          const diff = now - last;
          last = now;
          const total = prev + diff;
          setTime(formatElapsedTime(total));
          return total;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Location permission is required to track your run.'
        );
        navigation.goBack();
        return;
      }

      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 1,
          timeInterval: 1000,
        },
        (loc) => {
          if (!mounted) {
            return;
          }

          const coordsNow = loc.coords;
          const altitudeNow = getAltitudeValue(coordsNow.altitude);
          const now = Date.now();

          setLocation(coordsNow);
          setCurrentElevation(altitudeNow);

          if (!hasCenteredMapRef.current && mapRef.current) {
            hasCenteredMapRef.current = true;
            mapRef.current.animateCamera(
              {
                center: {
                  latitude: coordsNow.latitude,
                  longitude: coordsNow.longitude,
                },
                zoom: 20,
                heading: 0,
                pitch: 55,
              },
              { duration: 0 }
            );
          }

          if (!hasStarted) {
            setStartElevation(altitudeNow);
            setMinElevation(altitudeNow);
            setMaxElevation(altitudeNow);
          }

          if (hasStarted) {
            setMinElevation((prev) => Math.min(prev, altitudeNow));
            setMaxElevation((prev) => Math.max(prev, altitudeNow));
            setNetElevationChange(altitudeNow - startElevation);
          }

          if (isRunning) {
            let pointTimestamp = now;

            if (loc.timestamp !== null && loc.timestamp !== undefined) {
              pointTimestamp = loc.timestamp;
            }

            const point = {
              latitude: coordsNow.latitude,
              longitude: coordsNow.longitude,
              altitude: altitudeNow,
              timestamp: pointTimestamp,
            };

            if (previousLocation.current) {
              const dist = getDistance(
                previousLocation.current.latitude,
                previousLocation.current.longitude,
                coordsNow.latitude,
                coordsNow.longitude
              );

              const timeDiffSec = (now - previousTime.current) / 1000;
              const milesDiff = dist / 1609.34;

              const previousAltitude = getAltitudeValue(
                previousLocation.current.altitude
              );
              const altitudeDiff = altitudeNow - previousAltitude;

              if (altitudeDiff > ELEVATION_THRESHOLD_METERS) {
                setElevationGain((prev) => prev + altitudeDiff);
              } else if (altitudeDiff < -ELEVATION_THRESHOLD_METERS) {
                setElevationLoss((prev) => prev + Math.abs(altitudeDiff));
              }

              if (dist > 1) {
                setRoute((prev) => [...prev, point]);
                setTotalDistance((prev) => prev + dist);
              }

              if (milesDiff > 0 && timeDiffSec > 0 && dist > 1) {
                const paceMin = timeDiffSec / 60 / milesDiff;
                const minutes = Math.floor(paceMin);
                const seconds = Math.floor((paceMin - minutes) * 60);

                setSpeedMinPerMile(
                  `${minutes}:${String(seconds).padStart(2, '0')}`
                );
              }
            }

            previousLocation.current = coordsNow;
            previousTime.current = now;
          } else {
            previousLocation.current = coordsNow;
            previousTime.current = now;
          }

          if (mapRef.current && mapMode === 'follow') {
            mapRef.current.animateCamera(
              {
                center: {
                  latitude: coordsNow.latitude,
                  longitude: coordsNow.longitude,
                },
                zoom: 20,
                heading: 0,
                pitch: 55,
              },
              { duration: 400 }
            );
          }
        }
      );
    })();

    return () => {
      mounted = false;
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
    };
  }, [navigation, isRunning, mapMode, hasStarted, startElevation]);

  useEffect(() => {
    if (mapRef.current && mapMode === 'route' && route.length > 1) {
      mapRef.current.fitToCoordinates(route, {
        edgePadding: {
          top: 80,
          right: 50,
          bottom: 80,
          left: 50,
        },
        animated: true,
      });

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.animateCamera(
            {
              heading: 0,
              pitch: 0,
            },
            { duration: 200 }
          );
        }
      }, 300);
    }
  }, [route, mapMode]);

  const startRun = () => {
    if (!location) {
      return;
    }

    const altitude = getAltitudeValue(location.altitude);

    const startPoint = {
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: altitude,
      timestamp: Date.now(),
    };

    if (!hasStarted) {
      setRoute([startPoint]);
      setTotalDistance(0);
      setElevationGain(0);
      setElevationLoss(0);
      setNetElevationChange(0);
      setCurrentElevation(altitude);
      setStartElevation(altitude);
      setMinElevation(altitude);
      setMaxElevation(altitude);
      previousLocation.current = location;
      previousTime.current = Date.now();
    } else {
      previousLocation.current = location;
      previousTime.current = Date.now();
    }

    setHasStarted(true);
    setIsRunning(true);
    setIsPaused(false);
    setMapMode('follow');

    if (mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          zoom: 20,
          heading: 0,
          pitch: 55,
        },
        { duration: 300 }
      );
    }
  };

  const pauseRun = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const stopRun = () => {
    setIsRunning(false);
    setIsPaused(false);

    const miles = totalDistance / 1609.34;
    let averagePace = '--:--';

    if (miles > 0) {
      const totalMinutes = elapsed / 60000;
      const pace = totalMinutes / miles;
      const mins = Math.floor(pace);
      const secs = Math.floor((pace - mins) * 60);
      averagePace = `${mins}:${String(secs).padStart(2, '0')}`;
    }

    const elevationStats = calculateElevationStats(route);

    navigation.navigate('Summary', {
      totalDistance: totalDistance,
      elapsed: elapsed,
      formattedTime: time,
      averagePace: averagePace,
      currentPace: speedMinPerMile,
      route: route,
      currentElevation: elevationStats.currentElevation,
      startElevation: elevationStats.startElevation,
      endElevation: elevationStats.endElevation,
      elevationGain: elevationStats.elevationGain,
      elevationLoss: elevationStats.elevationLoss,
      netElevationChange: elevationStats.netElevationChange,
      minElevation: elevationStats.minElevation,
      maxElevation: elevationStats.maxElevation,
      date: Date.now(),
    });
  };

  const followUser = () => {
    if (!location || !mapRef.current) {
      return;
    }

    setMapMode('follow');
    mapRef.current.animateCamera(
      {
        center: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        zoom: 20,
        heading: 0,
        pitch: 55,
      },
      { duration: 400 }
    );
  };

  const routeView = () => {
    setMapMode('route');

    if (route.length > 1 && mapRef.current) {
      mapRef.current.fitToCoordinates(route, {
        edgePadding: {
          top: 80,
          right: 50,
          bottom: 80,
          left: 50,
        },
        animated: true,
      });

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.animateCamera(
            {
              heading: 0,
              pitch: 0,
            },
            { duration: 200 }
          );
        }
      }, 300);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.runMapContainerTop}>
        <MapView
          ref={mapRef}
          style={styles.map}
          rotateEnabled={false}
          pitchEnabled={true}
          maxZoomLevel={20}
          initialRegion={{
            latitude: 40,
            longitude: -74,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          }}
          onPanDrag={() => setMapMode('free')}>
          {location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You"
              description={`Elevation: ${formatElevation(currentElevation)}`}
              pinColor="#D4AF37"
            />
          )}

          {route.length > 0 && (
            <Marker
              coordinate={route[0]}
              title="Start"
              description="Beginning of your route"
              pinColor="green"
            />
          )}

          {route.length > 1 && (
            <Marker
              coordinate={route[route.length - 1]}
              title="End"
              description="Current end of your route"
              pinColor="red"
            />
          )}

          {route.length > 0 && (
            <Polyline
              coordinates={route}
              strokeColor="#D4AF37"
              strokeWidth={5}
            />
          )}
        </MapView>
      </View>

      <ScrollView
        contentContainerStyle={styles.runBottomScroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.runTopPanel}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Distance</Text>
              <Text style={styles.metricNumber}>
                {(totalDistance / 1609.34).toFixed(2)}
              </Text>
              <Text style={styles.metricSmall}>miles</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Pace</Text>
              <Text style={styles.metricNumber}>{speedMinPerMile}</Text>
              <Text style={styles.metricSmall}>min/mile</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Time</Text>
              <Text style={styles.metricNumber}>{time}</Text>
              <Text style={styles.metricSmall}>elapsed</Text>
            </View>
          </View>

          <View style={styles.metricsRowSecond}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Elevation</Text>
              <Text style={styles.metricNumberSmall}>
                {formatElevation(currentElevation)}
              </Text>
              <Text style={styles.metricSmall}>current</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Net Change</Text>
              <Text style={styles.metricNumberSmall}>
                {formatElevation(netElevationChange)}
              </Text>
              <Text style={styles.metricSmall}>end minus start</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Highest</Text>
              <Text style={styles.metricNumberSmall}>
                {formatElevation(maxElevation)}
              </Text>
              <Text style={styles.metricSmall}>peak</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomControls}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={followUser}>
              <Text style={styles.secondaryButtonText}>Follow Me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={routeView}>
              <Text style={styles.secondaryButtonText}>Route View</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            {!isRunning ? (
              <TouchableOpacity
                style={[
                  styles.primaryButtonHalf,
                  !location && styles.disabledButton,
                ]}
                onPress={startRun}
                disabled={!location}>
                <Text style={styles.primaryButtonText}>
                  {!hasStarted
                    ? 'Start Run'
                    : isPaused
                    ? 'Resume Run'
                    : 'Start Run'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.pauseButton} onPress={pauseRun}>
                <Text style={styles.pauseButtonText}>Pause Run</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.stopButton, !hasStarted && styles.disabledButton]}
              onPress={stopRun}
              disabled={!hasStarted}>
              <Text style={styles.stopButtonText}>End Run</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryScreen({ route, navigation }) {
  const {
    totalDistance,
    elapsed,
    formattedTime,
    averagePace,
    currentPace,
    route: savedPath,
    currentElevation,
    startElevation,
    endElevation,
    elevationGain,
    elevationLoss,
    netElevationChange,
    minElevation,
    maxElevation,
    date,
  } = route.params;

  const mapRef = useRef(null);
  const [routeName, setRouteName] = useState('');

  useEffect(() => {
    if (mapRef.current && savedPath && savedPath.length > 0) {
      setTimeout(() => {
        if (savedPath.length === 1) {
          mapRef.current.animateCamera(
            {
              center: {
                latitude: savedPath[0].latitude,
                longitude: savedPath[0].longitude,
              },
              zoom: 20,
              heading: 0,
              pitch: 55,
            },
            { duration: 700 }
          );
        } else {
          mapRef.current.fitToCoordinates(savedPath, {
            edgePadding: {
              top: 120,
              right: 40,
              bottom: 120,
              left: 40,
            },
            animated: true,
          });

          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.animateCamera(
                {
                  heading: 0,
                  pitch: 0,
                },
                { duration: 200 }
              );
            }
          }, 300);
        }
      }, 500);
    }
  }, [savedPath]);

  const saveRoute = async () => {
    const trimmedName = routeName.trim();

    if (!trimmedName) {
      Alert.alert('Missing Name', 'Please enter a name for this route.');
      return;
    }

    const newRoute = {
      id: `${Date.now()}`,
      name: trimmedName,
      totalDistance: totalDistance,
      elapsed: elapsed,
      formattedTime: formattedTime,
      averagePace: averagePace,
      currentPace: currentPace,
      route: savedPath,
      currentElevation: currentElevation,
      startElevation: startElevation,
      endElevation: endElevation,
      elevationGain: elevationGain,
      elevationLoss: elevationLoss,
      netElevationChange: netElevationChange,
      minElevation: minElevation,
      maxElevation: maxElevation,
      date: date,
    };

    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      let parsed = [];

      if (existing) {
        parsed = JSON.parse(existing);
      }

      const updated = [newRoute, ...parsed];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      Alert.alert('Saved', 'Your route has been saved.');
      navigation.popToTop();
    } catch (error) {
      console.log('Error saving route:', error);
      Alert.alert('Error', 'There was a problem saving the route.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled">
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Name This Route</Text>
            <TextInput
              style={styles.input}
              placeholder="Example: Saturday Park Run"
              placeholderTextColor="#94A3B8"
              value={routeName}
              onChangeText={setRouteName}
            />

            <TouchableOpacity
              style={styles.primaryWideButton}
              onPress={saveRoute}>
              <Text style={styles.primaryButtonText}>Save Route</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryWideButton}
              onPress={() => navigation.popToTop()}>
              <Text style={styles.secondaryButtonText}>Skip and Return Home</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryMapContainerTop}>
            <MapView
              ref={mapRef}
              style={styles.map}
              rotateEnabled={false}
              pitchEnabled={false}
              maxZoomLevel={20}
              initialRegion={{
                latitude:
                  savedPath && savedPath.length > 0 ? savedPath[0].latitude : 40,
                longitude:
                  savedPath && savedPath.length > 0
                    ? savedPath[0].longitude
                    : -74,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}>
              {savedPath && savedPath.length > 0 && (
                <Polyline
                  coordinates={savedPath}
                  strokeColor="#D4AF37"
                  strokeWidth={5}
                />
              )}

              {savedPath && savedPath.length > 0 && (
                <Marker
                  coordinate={savedPath[0]}
                  title="Start"
                  pinColor="green"
                />
              )}

              {savedPath && savedPath.length > 1 && (
                <Marker
                  coordinate={savedPath[savedPath.length - 1]}
                  title="End"
                  description={`Elevation: ${formatElevation(endElevation)}`}
                  pinColor="red"
                />
              )}
            </MapView>
          </View>

          <View style={styles.topPanel}>
            <Text style={styles.modeTitle}>Run Summary</Text>
            <Text style={styles.modeText}>
              Review and save your completed route
            </Text>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summarySectionTitle}>Run Stats</Text>
            <Text style={styles.summaryText}>
              Distance: {(totalDistance / 1609.34).toFixed(2)} miles
            </Text>
            <Text style={styles.summaryText}>Time: {formattedTime}</Text>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summarySectionTitle}>Pace</Text>
            <Text style={styles.summaryText}>Average Pace: {averagePace}</Text>
            <Text style={styles.summaryText}>Last Pace: {currentPace}</Text>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summarySectionTitle}>Elevation</Text>
            <Text style={styles.summaryText}>
              Start Elevation: {formatElevation(startElevation)}
            </Text>
            <Text style={styles.summaryText}>
              End Elevation: {formatElevation(endElevation)}
            </Text>
            <Text style={styles.summaryText}>
              Elevation Gain: {formatElevation(elevationGain)}
            </Text>
            <Text style={styles.summaryText}>
              Elevation Loss: {formatElevation(elevationLoss)}
            </Text>
            <Text style={styles.summaryText}>
              Net Elevation Change: {formatElevation(netElevationChange)}
            </Text>
            <Text style={styles.summaryText}>
              Highest Point: {formatElevation(maxElevation)}
            </Text>
            <Text style={styles.summaryText}>
              Lowest Point: {formatElevation(minElevation)}
            </Text>
            <Text style={styles.summaryText}>
              Finish Elevation: {formatElevation(currentElevation)}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RouteDetailScreen({ route, navigation }) {
  const { routeData } = route.params;
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && routeData.route && routeData.route.length > 0) {
      setTimeout(() => {
        if (routeData.route.length === 1) {
          mapRef.current.animateCamera(
            {
              center: routeData.route[0],
              zoom: 20,
              heading: 0,
              pitch: 55,
            },
            { duration: 700 }
          );
        } else {
          mapRef.current.fitToCoordinates(routeData.route, {
            edgePadding: {
              top: 120,
              right: 60,
              bottom: 120,
              left: 60,
            },
            animated: true,
          });

          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.animateCamera(
                {
                  heading: 0,
                  pitch: 0,
                },
                { duration: 200 }
              );
            }
          }, 300);
        }
      }, 500);
    }
  }, [routeData]);

  const deleteRoute = async () => {
    Alert.alert(
      'Delete Route',
      `Are you sure you want to delete "${routeData.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const existing = await AsyncStorage.getItem(STORAGE_KEY);
              let parsed = [];

              if (existing) {
                parsed = JSON.parse(existing);
              }

              const updated = parsed.filter((item) => item.id !== routeData.id);

              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              Alert.alert('Deleted', 'Route deleted successfully.');
              navigation.goBack();
            } catch (error) {
              console.log('Error deleting route:', error);
              Alert.alert('Error', 'There was a problem deleting this route.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.summaryMapContainerTop}>
          <MapView
            ref={mapRef}
            style={styles.map}
            rotateEnabled={false}
            pitchEnabled={false}
            initialRegion={{
              latitude:
                routeData.route && routeData.route.length > 0
                  ? routeData.route[0].latitude
                  : 40,
              longitude:
                routeData.route && routeData.route.length > 0
                  ? routeData.route[0].longitude
                  : -74,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}>
            {routeData.route && routeData.route.length > 0 && (
              <Polyline
                coordinates={routeData.route}
                strokeColor="#D4AF37"
                strokeWidth={5}
              />
            )}

            {routeData.route && routeData.route.length > 0 && (
              <Marker
                coordinate={routeData.route[0]}
                title="Start"
                pinColor="green"
              />
            )}

            {routeData.route && routeData.route.length > 1 && (
              <Marker
                coordinate={routeData.route[routeData.route.length - 1]}
                title="End"
                description={`Elevation: ${formatElevation(
                  routeData.endElevation
                )}`}
                pinColor="red"
              />
            )}
          </MapView>
        </View>

        <View style={styles.topPanel}>
          <Text style={styles.modeTitle}>{routeData.name}</Text>
          <Text style={styles.modeText}>
            Saved on {formatDateString(routeData.date)}
          </Text>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              Distance: {(routeData.totalDistance / 1609.34).toFixed(2)} miles
            </Text>
            <Text style={styles.summaryText}>
              Average Pace: {routeData.averagePace}
            </Text>
            <Text style={styles.summaryText}>
              Time: {routeData.formattedTime}
            </Text>
            <Text style={styles.summaryText}>
              Start Elevation: {formatElevation(routeData.startElevation)}
            </Text>
            <Text style={styles.summaryText}>
              End Elevation: {formatElevation(routeData.endElevation)}
            </Text>
            <Text style={styles.summaryText}>
              Elevation Gain: {formatElevation(routeData.elevationGain)}
            </Text>
            <Text style={styles.summaryText}>
              Elevation Loss: {formatElevation(routeData.elevationLoss)}
            </Text>
            <Text style={styles.summaryText}>
              Net Elevation Change:{' '}
              {formatElevation(routeData.netElevationChange)}
            </Text>
            <Text style={styles.summaryText}>
              Highest Point: {formatElevation(routeData.maxElevation)}
            </Text>
            <Text style={styles.summaryText}>
              Lowest Point: {formatElevation(routeData.minElevation)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.secondaryWideButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryButtonText}>Back to Routes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteWideButton}
            onPress={deleteRoute}>
            <Text style={styles.deleteWideButtonText}>Delete Route</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Intro"
          screenOptions={{
            headerStyle: { backgroundColor: '#111827' },
            headerTintColor: '#F8FAFC',
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: '#0F172A' },
          }}>
          <Stack.Screen
            name="Intro"
            component={IntroScreen}
            options={{ title: 'Run Tracker' }}
          />
          <Stack.Screen
            name="Run"
            component={RunScreen}
            options={{ title: 'Run Tracker', headerBackVisible: false }}
          />
          <Stack.Screen
            name="Summary"
            component={SummaryScreen}
            options={{ title: 'Run Summary', headerBackVisible: false }}
          />
          <Stack.Screen
            name="RouteDetail"
            component={RouteDetailScreen}
            options={{ title: 'Saved Route' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardWrap: {
    flex: 1,
  },
  introScroll: {
    padding: 16,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#243041',
  },
  appTitle: {
    color: '#F8FAFC',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#243041',
    marginHorizontal: 14,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  bodyText: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 4,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 15,
  },
  topPanel: {
    backgroundColor: '#111827',
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#243041',
  },
  runTopPanel: {
    backgroundColor: '#111827',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#243041',
  },
  modeTitle: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  modeText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  metricsRowSecond: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginTop: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  metricLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  metricNumber: {
    color: '#F8FAFC',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  metricNumberSmall: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  metricSmall: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  runMapContainerTop: {
    height: 0.46 * windowHeight,
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#243041',
  },
  summaryMapContainerTop: {
    height: 0.42 * windowHeight,
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#243041',
  },
  summaryMapContainer: {
    height: 0.48 * windowHeight,
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#243041',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  runBottomScroll: {
    paddingBottom: 18,
  },
  bottomControls: {
    marginHorizontal: 14,
    marginBottom: 16,
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  primaryWideButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonHalf: {
    width: '48%',
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '48%',
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryWideButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
  pauseButton: {
    width: '48%',
    backgroundColor: '#F59E0B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  pauseButtonText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },
  stopButton: {
    width: '48%',
    backgroundColor: '#B91C1C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  deleteWideButton: {
    backgroundColor: '#B91C1C',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteWideButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summarySection: {
    backgroundColor: '#111827',
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#243041',
  },
  summarySectionTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  summaryText: {
    color: '#F8FAFC',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 10,
  },
  savedRouteCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  savedRouteTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  savedRouteText: {
    color: '#CBD5E1',
    fontSize: 14,
    marginBottom: 2,
  },
  savedRouteDate: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 6,
  },
});