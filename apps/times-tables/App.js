import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function IntroScreen({ navigation }) {
  const numbers = [1,2,3,4,5,6,7,8,9,10,11,12];
  const [lowerRange, setLowerRange] = useState(null);
  const [upperRange, setUpperRange] = useState(null);

  const handleStart = () => {
    if (lowerRange && upperRange && lowerRange <= upperRange) {
      navigation.navigate('Questions', {
        first: lowerRange,
        second: upperRange
      });
    }
  };

  const isInvalidRange =
    lowerRange !== null &&
    upperRange !== null &&
    lowerRange > upperRange;

  function getButtonLabel() {
    let label = 'Select Range';

    if (lowerRange && upperRange) {
      if (isInvalidRange) {
        label = 'Invalid Range';
      } else {
        label = 'Start Practice';
      }
    }

    return label;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Select Your Range</Text>
        <Text style={{ marginBottom: 10 }}>Choose a lower and upper bound (1–12)</Text>

        <Text style={styles.subTitle}>Lower Range:</Text>
        <View style={styles.grid}>
          {numbers.map(num => (
            <TouchableOpacity
              key={num}
              style={[
                styles.gridButton,
                lowerRange === num && styles.selectedButton
              ]}
              onPress={() => setLowerRange(num)}
            >
              <Text style={styles.gridText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subTitle}>Upper Range:</Text>
        <View style={styles.grid}>
          {numbers.map(num => (
            <TouchableOpacity
              key={num}
              style={[
                styles.gridButton,
                upperRange === num && styles.selectedButton
              ]}
              onPress={() => setUpperRange(num)}
            >
              <Text style={styles.gridText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleStart}
          disabled={!lowerRange || !upperRange || isInvalidRange}
          style={[
            styles.button,
            (!lowerRange || !upperRange || isInvalidRange) && styles.disabledButton
          ]}
        >
          <Text style={styles.buttonText}>{getButtonLabel()}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function QuestionsScreen({ route, navigation }) {
  const { first, second } = route.params;

  const [problems] = useState(() => {
    const arr = [];
    const start = Math.min(first, second);
    const end = Math.max(first, second);

    for (let a = start; a <= end; a++) {
      for (let b = start; b <= end; b++) {
        arr.push({ a, b });
      }
    }
    return shuffle(arr);
  });

  const totalQuestions = problems.length;

  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [numCorrect, setNumCorrect] = useState(0);
  const [numWrong, setNumWrong] = useState(0);

  const current = problems[idx];
  const correctAnswer = current.a * current.b;

  function whenPress(value) {
    setInput(input + value);
  }

  function whenDelete() {
    setInput(input.slice(0, -1));
  }

  function whenEquals() {
    if (!input) return;

    const userAnswer = Number(input);

    if (userAnswer === correctAnswer) {
      const newCorrect = numCorrect + 1;
      setNumCorrect(newCorrect);

      if (idx < problems.length - 1) {
        setIdx(idx + 1);
        setInput('');
      } else {
        alert(
          `You finished all your questions!\nCorrect: ${newCorrect}\nWrong: ${numWrong}\nTotal Attempts: ${newCorrect + numWrong}`
        );
        navigation.navigate('Intro');
      }
    } else {
      const newWrong = numWrong + 1;
      setNumWrong(newWrong);

      navigation.navigate('Incorrect Question', {
        numCorrect: numCorrect,
        numWrong: newWrong,
        total: problems.length
      });
    }
  }

  const totalAttempted = numCorrect + numWrong;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scoreRow}>
        <Text style={styles.scoreText}>Correct: {numCorrect}</Text>
        
        <Text style={styles.scoreText}>
          Total: {totalAttempted} / {totalQuestions}
        </Text>
      </View>

      <View style={[styles.resultView, styles.initialStyle]}>
        <Text style={{ fontSize: 30, color: 'black' }}>
          {current.a} x {current.b} = ?
        </Text>
        <Text style={{ fontSize: 40, color: 'blue' }}>{input}</Text>
      </View>

      {/* Row 1 */}
      <View style={styles.inputView}>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('7')}>
          <Text style={styles.buttonFont}>7</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('8')}>
          <Text style={styles.buttonFont}>8</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('9')}>
          <Text style={styles.buttonFont}>9</Text>
        </TouchableOpacity>
      </View>

      {/* Row 2 */}
      <View style={styles.inputView}>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('4')}>
          <Text style={styles.buttonFont}>4</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('5')}>
          <Text style={styles.buttonFont}>5</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('6')}>
          <Text style={styles.buttonFont}>6</Text>
        </TouchableOpacity>
      </View>

      {/* Row 3 */}
      <View style={styles.inputView}>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('1')}>
          <Text style={styles.buttonFont}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('2')}>
          <Text style={styles.buttonFont}>2</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('3')}>
          <Text style={styles.buttonFont}>3</Text>
        </TouchableOpacity>
      </View>

      {/* Row 4 */}
      <View style={styles.inputView}>
        <TouchableOpacity style={styles.buttonStyle} onPress={whenDelete}>
          <Text style={styles.buttonFont}>Del</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('0')}>
          <Text style={styles.buttonFont}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonStyle} onPress={whenEquals}>
          <Text style={styles.buttonFont}>=</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function IncorrectQuestions({ route, navigation }) {
  const { numCorrect = 0, numWrong = 0, total = 0 } = route.params;
  const attempted = numCorrect + numWrong;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Incorrect!</Text>

        <Text style={{ fontSize: 18, marginVertical: 8 }}>
          Correct: {numCorrect}   Wrong: {numWrong}
        </Text>
        {total > 0 && (
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            Attempted: {attempted} / {total}
          </Text>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('Intro')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Intro"
        screenOptions={{ headerTitleAlign: 'center' }}
      >
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Questions" component={QuestionsScreen} />
        <Stack.Screen name="Incorrect Question" component={IncorrectQuestions} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ecf0f1' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1'
  },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  subTitle: { fontSize: 18, marginTop: 8, marginBottom: 4 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: windowWidth * 0.8,
    justifyContent: 'center'
  },
  gridButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    margin: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedButton: { backgroundColor: 'orange' },
  gridText: { fontWeight: 'bold' },


  button: {
    marginTop: 10,
    paddingVertical: windowHeight * 0.017,
    paddingHorizontal: windowWidth * 0.055,
    backgroundColor: '#1A73E8',
    borderRadius: 12
  },
  buttonText: { color: 'black', fontWeight: '700', fontSize: 16 },
  disabledButton: { backgroundColor: '#A0C4F0' },

 
  inputView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: windowWidth * 0.9,
    marginTop: 8,
    marginBottom: 4
  },


  buttonStyle: {
    width: windowWidth * 0.22,      
    height: windowHeight * 0.08,    
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonFont: { fontWeight: 'bold', fontSize: 20 },

  resultView: {
    flex: 5,
    backgroundColor: 'orange',
    width: windowWidth,
    alignItems: 'flex-start',
    justifyContent: 'space-evenly'
  },

  initialStyle: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 10
  },

  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: windowWidth,
    marginTop: 20,
    marginBottom: 10
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600'
  }
});
