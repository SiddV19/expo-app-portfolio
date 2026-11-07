import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  View,
  TextInput,
  Image,
  Platform,
  Dimensions
} from "react-native";
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Card } from "react-native-paper";

const Stack = createStackNavigator();

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8787";
const UNITS = "imperial";

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="City"
        screenOptions={{ headerTitleAlign: "center" }}
      >
        <Stack.Screen
          name="City"
          component={SpecificCity}
          options={{ title: "Forecast" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function iconUrl(iconCode) {
  return "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";
}

function dayLabelFrom(dateKey) {
  const parts = dateKey.split("-");
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const dt = new Date(y, m, d);
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return names[dt.getDay()];
}

function getTodaySummary(forecastJson) {
  const list = forecastJson.list;
  const todayKey = list[0].dt_txt.slice(0, 10);

  let min = list[0].main.temp;
  let max = list[0].main.temp;

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const dateKey = item.dt_txt.slice(0, 10);
    if (dateKey !== todayKey) break;

    const t = item.main.temp;
    if (t < min) min = t;
    if (t > max) max = t;
  }

  return {
    todayKey: todayKey,
    todayHigh: Math.round(max),
    todayLow: Math.round(min),
  };
}

function buildDailyForecast(forecastJson, excludeDate) {
  const byDate = {};
  const list = forecastJson.list;

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const dateKey = item.dt_txt.slice(0, 10);

    if (dateKey === excludeDate) continue;

    const temp = item.main.temp;
    const wind = item.wind.speed;
    const desc = item.weather[0].description;
    const icon = item.weather[0].icon;

    if (!byDate[dateKey]) {
      byDate[dateKey] = {
        min: temp,
        max: temp,
        windSum: 0,
        windCount: 0,
        descCount: {},
        iconCount: {},
      };
    }

    if (temp < byDate[dateKey].min) byDate[dateKey].min = temp;
    if (temp > byDate[dateKey].max) byDate[dateKey].max = temp;

    byDate[dateKey].windSum += wind;
    byDate[dateKey].windCount += 1;

    if (!byDate[dateKey].descCount[desc]) byDate[dateKey].descCount[desc] = 1;
    else byDate[dateKey].descCount[desc] += 1;

    if (!byDate[dateKey].iconCount[icon]) byDate[dateKey].iconCount[icon] = 1;
    else byDate[dateKey].iconCount[icon] += 1;
  }

  const daily = [];
  for (let date in byDate) {
    let topDesc = "";
    let topCount = 0;
    for (let d in byDate[date].descCount) {
      if (byDate[date].descCount[d] > topCount) {
        topDesc = d;
        topCount = byDate[date].descCount[d];
      }
    }

    let topIcon = "";
    let topIconCount = 0;
    for (let ic in byDate[date].iconCount) {
      if (byDate[date].iconCount[ic] > topIconCount) {
        topIcon = ic;
        topIconCount = byDate[date].iconCount[ic];
      }
    }

    daily.push({
      date: date,
      dayLabel: dayLabelFrom(date),
      high: Math.round(byDate[date].max),
      low: Math.round(byDate[date].min),
      wind: Math.round(byDate[date].windSum / byDate[date].windCount),
      condition: topDesc,
      icon: topIcon,
    });
  }

  daily.sort((a, b) => (a.date > b.date ? 1 : -1));
  return daily.slice(0, 5);
}

function cleanNumberText(text) {
  let t = text.replace(/[^0-9\.\-]/g, "");

  if (t.indexOf("-") > -1) {
    const startsWithMinus = t[0] === "-";
    t = t.replace(/-/g, "");
    if (startsWithMinus) t = "-" + t;
  }

  const firstDot = t.indexOf(".");
  if (firstDot > -1) {
    const before = t.slice(0, firstDot + 1);
    const after = t.slice(firstDot + 1).replace(/\./g, "");
    t = before + after;
  }

  return t;
}

function toggleMinus(text) {
  if (text.startsWith("-")) return text.slice(1);
  if (text === "") return "-";
  return "-" + text;
}

function SpecificCity() {
  const [latText, setLatText] = useState("");
  const [lonText, setLonText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [forecast, setForecast] = useState(null);
  const [daily, setDaily] = useState([]);

  const [todayKey, setTodayKey] = useState("");
  const [todayHigh, setTodayHigh] = useState(null);
  const [todayLow, setTodayLow] = useState(null);

  const [currentBlock, setCurrentBlock] = useState(null);

  function isValidLatLon(lat, lon) {
    if (Number.isNaN(lat) || Number.isNaN(lon)) return false;
    if (lat < -90 || lat > 90) return false;
    if (lon < -180 || lon > 180) return false;
    return true;
  }

  function fetchWeatherByCoords() {
    const lat = parseFloat(latText);
    const lon = parseFloat(lonText);

    if (!isValidLatLon(lat, lon)) {
      setError("Enter valid coordinates. Lat: -90 to 90, Lon: -180 to 180.");
      return;
    }

    setLoading(true);
    setError("");
    setForecast(null);
    setDaily([]);
    setTodayKey("");
    setTodayHigh(null);
    setTodayLow(null);
    setCurrentBlock(null);

    const forecastUrl =
      API_BASE_URL + "/api/weather/forecast?lat=" +
      lat +
      "&lon=" +
      lon +
      "&units=" +
      UNITS;

    fetch(forecastUrl)
      .then((r) => r.json())
      .then((forecastJson) => {
        if (!forecastJson.list || forecastJson.list.length === 0) {
          throw new Error("Forecast returned no data.");
        }

        setForecast(forecastJson);

        setCurrentBlock(forecastJson.list[0]);

        const t = getTodaySummary(forecastJson);
        setTodayKey(t.todayKey);
        setTodayHigh(t.todayHigh);
        setTodayLow(t.todayLow);

        setDaily(buildDailyForecast(forecastJson, t.todayKey));

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Forecast</Text>
      <Text style={styles.subtitle}>
        Enter latitude and longitude. Use the ± buttons to make it negative.
      </Text>

      <View style={styles.coordLine}>
        <TouchableOpacity
          style={styles.minusButton}
          onPress={() => setLatText((prev) => toggleMinus(prev))}
        >
          <Text style={styles.minusText}>±</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Latitude (ex: 40.71)"
          value={latText}
          onChangeText={(t) => setLatText(cleanNumberText(t))}
          style={styles.coordInput}
          placeholderTextColor="#888"
          keyboardType="numeric"
          returnKeyType="next"
        />
      </View>

      <View style={styles.coordLine}>
        <TouchableOpacity
          style={styles.minusButton}
          onPress={() => setLonText((prev) => toggleMinus(prev))}
        >
          <Text style={styles.minusText}>±</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Longitude (ex: -74.01)"
          value={lonText}
          onChangeText={(t) => setLonText(cleanNumberText(t))}
          style={styles.coordInput}
          placeholderTextColor="#888"
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={fetchWeatherByCoords}
        />
      </View>

      <TouchableOpacity
        style={styles.searchButtonFull}
        onPress={fetchWeatherByCoords}
      >
        <Text style={styles.searchButtonText}>Get Forecast</Text>
      </TouchableOpacity>

      {error !== "" && (
        <Text style={[styles.subtitle, { color: "red", marginTop: 10 }]}>
          {error}
        </Text>
      )}

      {loading && <Text style={styles.subtitle}>Loading forecast...</Text>}

      {!loading && forecast && currentBlock && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: Platform.OS === "ios" ? 22 : 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { marginTop: 14 }]}>
            Location:{" "}
            {forecast.city && forecast.city.name ? forecast.city.name : "Coordinates"}{" "}
            ({parseFloat(latText).toFixed(2)}, {parseFloat(lonText).toFixed(2)})
          </Text>

          <Card style={styles.bigCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>
                Current Conditions (Forecast Table)
              </Text>

              <Text style={styles.bigTemp}>
                {Math.round(currentBlock.main.temp)}°F
              </Text>

              <Image
                source={{ uri: iconUrl(currentBlock.weather[0].icon) }}
                style={styles.iconLarge}
              />

              <Text style={styles.detailText}>
                Condition: {currentBlock.weather[0].description}
              </Text>

              <Text style={styles.detailText}>
                Wind: {Math.round(currentBlock.wind.speed)} mph
              </Text>

              <Text style={styles.detailText}>
                Forecast time: {currentBlock.dt_txt}
              </Text>

              <Text style={styles.detailText}>
                <Text style={styles.highTemp}>Today High: {todayHigh}°F</Text>
                <Text style={styles.detailText}>  •  </Text>
                <Text style={styles.lowTemp}>Today Low: {todayLow}°F</Text>
              </Text>
            </Card.Content>
          </Card>

          <Text style={styles.sectionTitle}>Next 5 Days</Text>

          <View style={styles.verticalForecastContainer}>
            {daily.map((d) => (
              <Card key={d.date} style={styles.forecastTileVertical}>
                <Card.Content style={styles.tileContentVertical}>
                  <View style={styles.tileTopRow}>
                    <Text style={styles.tileDay}>
                      {d.dayLabel} {d.date.slice(5)}
                    </Text>

                    <Image
                      source={{ uri: iconUrl(d.icon) }}
                      style={styles.tileIcon}
                    />
                  </View>

                  <Text style={styles.tileCondition}>{d.condition}</Text>

                  <View style={styles.tileTemps}>
                    <Text style={styles.tileHigh}>H {d.high}°F</Text>
                    <Text style={styles.tileLow}>L {d.low}°F</Text>
                  </View>

                  <Text style={styles.tileWind}>Wind {d.wind} mph</Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 12,
   
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 6,
    color: "#fff",
  },

  subtitle: {
    textAlign: "center",
    marginTop: 6,
    opacity: 0.7,
    color: "#ccc",
  },

  coordLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  minusButton: {
    width: 52,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#2c3e50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  minusText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },

  coordInput: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: "#fff",
  },

  searchButtonFull: {
    marginTop: 12,
    backgroundColor: "#2c3e50",
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  searchButtonText: {
    color: "#fff",
    fontWeight: "800",
  },

  sectionTitle: {
    marginTop: 18,
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },

  bigCard: {
    borderRadius: 18,
    marginTop: 10,
    paddingVertical: 6,
    backgroundColor: "#111",
  },

  cardTitle: {
    fontWeight: "800",
    opacity: 0.8,
    color: "#ccc",
    textAlign: "center",
  },

  bigTemp: {
    fontSize: 52,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 8,
    color: "#fff",
  },

  detailText: {
    marginTop: 6,
    fontSize: 14,
    opacity: 0.85,
    textAlign: "center",
    color: "#ccc",
    textTransform: "capitalize",
  },

  highTemp: {
    fontWeight: "900",
    color: "#e74c3c",
  },

  lowTemp: {
    fontWeight: "900",
    color: "#3498db",
  },

  iconLarge: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginTop: 6,
  },

  verticalForecastContainer: {
    marginTop: 10,
    
  },

  forecastTileVertical: {
    borderRadius: 16,
    backgroundColor: "#111",
    marginBottom: 10,
  },

  tileContentVertical: {
    paddingVertical: 12,
  },

  tileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  tileDay: {
    fontWeight: "900",
    fontSize: 14,
    color: "#fff",
  },

  tileIcon: {
    width: 0.12 * windowWidth,
    height: 0.12 * windowWidth,
  },

  tileCondition: {
    marginTop: 6,
    fontSize: 12,
    color: "#ccc",
    opacity: 0.85,
    textTransform: "capitalize",
    textAlign: "left",
  },

  tileTemps: {
    flexDirection: "row",
    marginTop: 10,
  },

  tileHigh: {
    fontWeight: "900",
    color: "#e74c3c",
    fontSize: 14,
    marginRight: 14,
  },

  tileLow: {
    fontWeight: "900",
    color: "#3498db",
    fontSize: 14,
  },

  tileWind: {
    marginTop: 8,
    fontSize: 12,
    color: "#ccc",
    opacity: 0.75,
  },
});
