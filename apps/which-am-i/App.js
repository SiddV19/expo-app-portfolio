/*
This app was designed to replicate the experience of any “Which Am I” quiz that you can find online to some degree. Specifically, this app recommends a car and its category (Eco, Sport, Utility, Luxury) based on a short 10-question survey. The idea behind the layout is to have multiple screens that are more user-friendly and self-explanatory for the user to navigate through the app. I divided the screens up into 4 main parts: one being the intro screen, which provides a welcome screen to the app. After the start button is pressed on the intro screen, the screen shifts to the questions screen. This is where I put all 10 of my questions that I will ask the user. The variety in terms of how the user can answer the question is a little bit limited, as I include 9 multiple-choice questions and the last one is a slider question. I did not use an alert in this build because I decided to lock the finish button on the bottom of the screen until all the questions are answered.
A couple of things about the way the questions work: when a multiple-choice answer is selected for a question, I have the color change to green to let the user know visually what answer they selected. I also check to make sure a choice is selected from the multiple-choice options (which was straightforward), and the slider by default is set at 1 — and that itself counts as an input. I was considering adding a 0 so the user had to interact with the slider element in order to pass on to the next screen, but then I realized that it does not make sense in the context of the app for there to be 0 people in terms of driving the car, so I left the default slider value at 1, and it will accept 1 as an input even if you don’t change it to move on to the next screen.
Algorithmically, the way questions work goes as follows: I assign weight scores to each answer choice to determine which car category (Eco, Sport, Utility, or Luxury (Lux)) best matches what the user put down in their answers to the questions. Each question has a set of answer options that include a weights object, which allows for each answer choice to award different points to each car category. When the user finishes all the questions, the app goes through a for loop that iterates through each response and adds up the weight for each of the axes/car categories. For example, if someone picks answers that align with the sporty category, then that SPORT score will accumulate more than the other categories, ultimately leading to a sports car decision/output. The slider question also works in a similar fashion, but each numeric value the slider lands on is mapped to letters A–D before applying weights. Once all the totals are calculated, the app identifies the category with the highest score and then outputs the car accordingly.
When a tie occurs between the categories, there is an algorithm that ensures there is only one output category so the car can be picked out respectively. The way the tiebreaker algorithm works is that after the scores are calculated, if there is a tie between two car categories, the category that gets picked is the one that comes first out of the two tied categories. For example, if the output of the array is ECO: 6, SPORT: 8, UTILITY: 8, LUX: 3, then the chosen category would be SPORT because that comes before UTILITY in the array. This design is biased to some degree, as some categories come before others, so that is a limitation that appears within my app.
After the finish button is pressed on the questions screen, I have a little summary screen that has a blurb on the results the user received, along with the actual array that was used in the selection process being displayed to the user. Finally, I have a button that leads the user to see their car and what they got based on the array result. The backend of this process is that the app looks up the associated car information and image key (like “sport”) from the CAR_RESULTS dictionary, then combines it with the color preference the user selected earlier to display the right car type with the right color. Based on our discussion in class, I decided to add the aspect of the car color being true to what the user picked — because what’s the point of asking the color and not providing that color to the user? After the search through the dictionary, the correct image then gets pulled from the assets folder, and finally, the car image gets displayed to the user.
Of course, there is no app without its limitations, so the limitations are the following: the results depend strictly on the predefined weights that I personally set, and that may not reflect every user’s preferences. The next limitation is the tiebreaker algorithm itself, because it introduces bias toward whichever category is listed first, meaning that it’s possible that two users with identical mixed car categories could both end up classified as one type due to the algorithm selection. From a scalability standpoint, I do include a lot of images in my project for each car type and each color type. Although it’s relatively okay for this project because of its small scale, it could cause issues in the future if more images were added to the algorithm. Finally, the last small detail about this app is that if it’s closed midway, the data does not save, so you have to answer all the questions again. If I had more time, I would have added a small easter egg in there — maybe for a specific combination, I would have given the user a horse and carriage as a joke but I didn’t get the chance to do so. However in all seriousness, I would have probably worked on maybe a more aesthetic experience overall for the app and added more variety of ways that users can put thier answers rather than the multiple choice and the one slider and even have more cars to choose from.

*/

import React, { useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, ScrollView, SafeAreaView, Pressable, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Slider from '@react-native-community/slider';

const Stack = createStackNavigator();


const AXES = ['ECO','SPORT','UTILITY','LUX'];
const COLOR_MAP = { A: 'grey', B: 'red', C: 'white', D: 'earth' };

const CAR_IMAGES = {
  eco: {
    grey: require('./assets/hyundai.jpg'),
    red: require('./assets/red_hyundai.webp'),
    white: require('./assets/Whitehyundai.png'),
    earth: require('./assets/hyundai_earth.png'),
  },
  sport: {
    grey: require('./assets/grey_Mustang.png'),
    red: require('./assets/red_Mustang.webp'),
    white: require('./assets/white_Mustang.png'),
    earth: require('./assets/Ford_Mustang.png'),
  },
  utility: {
    grey: require('./assets/gray_Jeep.png'),
    red: require('./assets/red_Jeep.png'),
    white: require('./assets/white_Jeep.webp'),
    earth: require('./assets/brown_Jeep.webp'),
  },
  lux: {
    grey: require('./assets/s_class.webp'),
    red: require('./assets/red_mercedez.png'),
    white: require('./assets/white_mercedez.webp'),
    earth: require('./assets/earth_mercedez.webp'),
  },
};

const QUIZ = {
  q1: {
    type: 'choice',
    prompt: '1. What is your ideal weekend activity?',
    options: [
      { value: 'A', label: 'A) Exploring off-road trails', weights: { UTILITY: 2 } },
      { value: 'B', label: 'B) Cruising downtown with friends', weights: { LUX: 1 } },
      { value: 'C', label: 'C) Going on a long road trip', weights: { ECO: 1, LUX: 1 } },
      { value: 'D', label: 'D) Racing on a track', weights: { SPORT: 3 } },
    ],
  },
  q2: {
    type: 'choice',
    prompt: '2. How important is fuel efficiency to you?',
    options: [
      { value: 'A', label: 'A) Very important — save on gas', weights: { ECO: 3 } },
      { value: 'B', label: 'B) Somewhat important', weights: { ECO: 1, LUX: 1 } },
      { value: 'C', label: 'C) Not very — power matters more', weights: { SPORT: 1 } },
      { value: 'D', label: 'D) Prefer electric or hybrid', weights: { ECO: 2 } },
    ],
  },
  q3: {
    type: 'choice',
    prompt: '3. Which driving style do you prefer?',
    options: [
      { value: 'A', label: 'A) Smooth and relaxed', weights: { LUX: 1 } },
      { value: 'B', label: 'B) Sporty and fast', weights: { SPORT: 3 } },
      { value: 'C', label: 'C) Practical and steady', weights: { ECO: 1 } },
      { value: 'D', label: 'D) Adventurous and rugged', weights: { UTILITY: 2 } },
    ],
  },
  q4: {
    type: 'choice',
    prompt: '4. What kind of car body do you like?',
    options: [
      { value: 'A', label: 'A) SUV or crossover', weights: { UTILITY: 2, LUX: 1 } },
      { value: 'B', label: 'B) Coupe or sports car', weights: { SPORT: 3 } },
      { value: 'C', label: 'C) Sedan or hatchback', weights: { ECO: 2, LUX: 1 } },
      { value: 'D', label: 'D) Pickup truck', weights: { UTILITY: 3 } },
    ],
  },
  q5: {
    type: 'choice',
    prompt: '5. What’s your favorite car color?',
    options: [
      { value: 'A', label: 'A) Black or dark gray', weights: { LUX: 1 } },
      { value: 'B', label: 'B) Red or bright colors', weights: { SPORT: 1 } },
      { value: 'C', label: 'C) White or silver', weights: { ECO: 1 } },
      { value: 'D', label: 'D) Earth tones (green, brown)', weights: { UTILITY: 1 } },
    ],
  },
  q6: {
    type: 'choice',
    prompt: '6. How much do you care about the latest tech features?',
    options: [
      { value: 'A', label: 'A) Must have the latest gadgets', weights: { LUX: 2, ECO: 1 } },
      { value: 'B', label: 'B) Some modern features are fine', weights: { LUX: 1 } },
      { value: 'C', label: 'C) Basic tech is fine', weights: { ECO: 1 } },
      { value: 'D', label: 'D) Durability over tech', weights: { UTILITY: 1 } },
    ],
  },
  q7: {
    type: 'choice',
    prompt: '7. Which describes your ideal driving environment?',
    options: [
      { value: 'A', label: 'A) City streets and highways', weights: { LUX: 1, ECO: 1 } },
      { value: 'B', label: 'B) Open roads and countryside', weights: { LUX: 1 } },
      { value: 'C', label: 'C) Off-road trails and mountains', weights: { UTILITY: 3 } },
      { value: 'D', label: 'D) Suburbs with mixed terrain', weights: { ECO: 1, LUX: 1 } },
    ],
  },
  q8: {
    type: 'choice',
    prompt: '8. How important is car brand prestige to you?',
    options: [
      { value: 'A', label: 'A) Very important — luxury brand', weights: { LUX: 3 } },
      { value: 'B', label: 'B) Somewhat important', weights: { LUX: 1 } },
      { value: 'C', label: 'C) Not important — function over brand', weights: { ECO: 1 } },
      { value: 'D', label: 'D) Prefer tough brands', weights: { UTILITY: 1 } },
    ],
  },
  q9: {
    type: 'choice',
    prompt: '9. What’s your budget range?',
    options: [
      { value: 'A', label: 'A) Economy/affordable', weights: { ECO: 2 } },
      { value: 'B', label: 'B) Mid-range', weights: { ECO: 1, LUX: 1 } },
      { value: 'C', label: 'C) High-end/luxury', weights: { LUX: 3 } },
      { value: 'D', label: 'D) Pay more for performance', weights: { SPORT: 2, LUX: 1 } },
    ],
  },
  q10: {
    type: 'slider',
    prompt: '10. How many passengers do you usually drive with?',
    min: 1,
    max: 4,
    labels: [
      'A) Just me',
      'B) 1–2 people',
      'C) 3+ (family or friends)',
      'D) Need to haul cargo',
    ],
    toLetter: (v) => ['A','B','C','D'][Math.min(Math.max(v,1),4) - 1],
    weightsByLetter: {
      A: { ECO: 1 },
      B: { LUX: 1 },
      C: { LUX: 1, ECO: 1 },
      D: { UTILITY: 3 },
    },
  },
};

const CAR_RESULTS = {
  ECO:     { name: 'Eco-Friendly Compact', imageKey: 'eco',     blurb: 'Efficient, practical, and city-friendly.' },
  SPORT:   { name: 'Track-Ready Sport',    imageKey: 'sport',   blurb: 'Fast, responsive, and fun to drive.' },
  UTILITY: { name: 'Rugged Utility',       imageKey: 'utility', blurb: 'Versatile, capable, and adventure-ready.' },
  LUX:     { name: 'Luxury Cruiser',       imageKey: 'lux',     blurb: 'Comfort, tech, and premium feel.' },
};

// ---- Screens ----
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Intro" screenOptions={{ headerTitleAlign: 'center' }}>
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Questions" component={QuestionScreen} />
        <Stack.Screen name="Results" component={ResultScreen} />
        <Stack.Screen name="Image" component={ImageScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function IntroScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollBody} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={true}>
        <View style={styles.container}>
          <Text style={styles.title}>Welcome to Which Car Am I?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Questions')} style={styles.button}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function OptionButton({ label, value, selectedValue, onSelect }) {
  const selected = selectedValue === value;
  return (
    <Pressable
      onPress={() => onSelect(value)}
      style={({ pressed }) => [
        styles.optionButton,
        pressed && styles.optionButtonPressed,
        selected && styles.optionButtonSelected,
      ]}
    >
      <View style={styles.optionRow}>
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function QuestionScreen({ navigation }) {
  const [answers, setAnswers] = useState({
    q1: null, q2: null, q3: null, q4: null, q5: null,
    q6: null, q7: null, q8: null, q9: null, q10: 1,
  });

  const setAnswer = (key) => (val) => setAnswers(prev => ({ ...prev, [key]: val }));
  const passengersLabel = (v) => QUIZ.q10.labels[(v ?? QUIZ.q10.min) - 1];

  
  const handleSeeResults = () => {
    
    

    // 2) Start totals
    const totals = { ECO: 0, SPORT: 0, UTILITY: 0, LUX: 0 };

    // 3) Add weights for each question 
    for (const [qKey, qConf] of Object.entries(QUIZ)) {
      const userAnswer = answers[qKey];
      if (qConf.type === 'choice') {
        const opt = qConf.options.find(o => o.value === userAnswer);
        const w = (opt && opt.weights) || {};
        totals.ECO     += w.ECO     || 0;
        totals.SPORT   += w.SPORT   || 0;
        totals.UTILITY += w.UTILITY || 0;
        totals.LUX     += w.LUX     || 0;
      } else if (qConf.type === 'slider') {
        const letter = qConf.toLetter(userAnswer);
        const w = qConf.weightsByLetter[letter] || {};
        totals.ECO     += w.ECO     || 0;
        totals.SPORT   += w.SPORT   || 0;
        totals.UTILITY += w.UTILITY || 0;
        totals.LUX     += w.LUX     || 0;
      }
    }

    // 4) Decide winner (simple max with tiebreak order)
    const tiebreak = ['SPORT','UTILITY','ECO','LUX'];
    const maxVal = Math.max(totals.ECO, totals.SPORT, totals.UTILITY, totals.LUX);
    const tied = AXES.filter(ax => totals[ax] === maxVal);
    const winner = tied.length === 1 ? tied[0] : tiebreak.find(ax => tied.includes(ax));

    // 5) Build result and navigate
    const result = CAR_RESULTS[winner];
    navigation.navigate('Results', { result, totals, answers });
  };

  const allAnswered = Object.keys(QUIZ).every(k => answers[k] != null && answers[k] !== '');

  const renderChoice = (qKey) => (
    <View key={qKey} style={styles.questionContainer}>
      <Text style={styles.questionText}>{QUIZ[qKey].prompt}</Text>
      {QUIZ[qKey].options.map(opt => (
        <OptionButton
          key={opt.value}
          label={opt.label}
          value={opt.value}
          selectedValue={answers[qKey]}
          onSelect={setAnswer(qKey)}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <Text style={styles.title}>Welcome to the questions section</Text>
        {['q1','q2','q3','q4','q5','q6','q7','q8','q9'].map(renderChoice)}

        <View style={[styles.questionContainer, { alignItems: 'center' }]}>
          <Text style={styles.questionText}>{QUIZ.q10.prompt}</Text>
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>{passengersLabel(answers.q10)}</Text>
          <Slider
            minimumValue={QUIZ.q10.min}
            maximumValue={QUIZ.q10.max}
            step={1}
            value={answers.q10 ?? QUIZ.q10.min}
            onValueChange={setAnswer('q10')}
            tapToSeek
            style={{ width: '70%', height: 15 }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '70%' }}>
            {Array.from({ length: QUIZ.q10.max - QUIZ.q10.min + 1 }, (_, i) => (
              <Text key={i}>{i + QUIZ.q10.min}</Text>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { marginTop: 8, opacity: allAnswered ? 1 : 0.5 }]}
          disabled={!allAnswered}
          onPress={handleSeeResults}
        >
          <Text style={styles.buttonText}>Finish</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultScreen({ route, navigation }) {
  const { result, totals, answers } = route.params ?? {};
  const colorKey = COLOR_MAP[answers?.q5]; // 'grey' | 'red' | 'white' | 'earth'

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollBody} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={true}>
        <View style={styles.container}>
          <Text style={styles.title}>{result?.name ?? 'Your Car Match'}</Text>
          <Text style={{ fontSize: 16, marginTop: 10 }}>{result?.blurb ?? ''}</Text>
          {totals && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontWeight: '700' }}>Score breakdown:</Text>
              <Text>ECO: {totals.ECO} · SPORT: {totals.SPORT} · UTILITY: {totals.UTILITY} · LUX: {totals.LUX}</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.button, { marginTop: 16 }]}
            onPress={() =>
              navigation.navigate('Image', {
                imageKey: result?.imageKey,
                colorKey, // pass chosen color
              })
            }
          >
            <Text style={styles.buttonText}>See the car image</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ImageScreen({ route }) {
  const { imageKey, colorKey } = route.params ?? {};
  const category = (imageKey && CAR_IMAGES[imageKey]) || null;

  const source =
    (category && colorKey && category[colorKey]) ||
    (category && category.grey) ||
    (category && category.red) ||
    (category && category.white) ||
    (category && category.earth) ||
    null;

  const messages = {
    eco: 'You will be driving a hyundai',
    sport: 'You will be driving Ford Mustang',
    utility: 'You will be driving a jeep',
    lux: 'You will driving a s class mercedez',
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollBody, { alignItems: 'center' }]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={true}
      >
        {source ? (
          <>
            <Image
              source={source}
              style={{
                width: 320,
                height: 200,
                resizeMode: 'contain',
                marginTop: 16,
                borderRadius: 12,
                backgroundColor: 'transparent',
              }}
            />
            <Text
              style={{
                marginTop: 12,
                fontSize: 16,
                fontStyle: 'italic',
                color: '#333',
                textAlign: 'center',
              }}
            >
              {messages[imageKey] ?? 'This car matches your style perfectly!'}
              {colorKey ? ` — in ${colorKey}.` : ''}
            </Text>
          </>
        ) : (
          <Text style={{ marginTop: 16, fontSize: 16 }}>No image available.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f0e68c' },
  scrollBody: { padding: 16, paddingBottom: 48, flexGrow: 1 },
  container: { backgroundColor: '#f0e68c', padding: 8 },
  title: { fontSize: 26, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },

  button: { backgroundColor: '#90EE90', padding: 15, borderRadius: 8 },
  buttonText: { color: 'black', fontWeight: 'bold', fontSize: 18, textAlign: 'center' },

  questionText: { fontSize: 18, marginBottom: 10 },

  optionButton: {
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#c7c7c7',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  optionButtonPressed: { backgroundColor: '#f2f2f2' },
  optionButtonSelected: { borderColor: '#16a34a', backgroundColor: '#d1fae5' },

  optionRow: { flexDirection: 'row', alignItems: 'center' },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#a3a3a3',
    marginRight: 10, alignItems: 'center', justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: '#16a34a' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#16a34a' },
  optionText: { fontSize: 16, color: '#111' },
  optionTextSelected: { fontWeight: '700', color: '#065f46' },

  questionContainer: {
    backgroundColor: '#a9a9a9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
});

