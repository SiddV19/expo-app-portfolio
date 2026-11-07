/**This calculator app is designed to replicate the look and functionality of a regular scientific calculator to some degree. My app has basic arithmetic operations like addition, subtraction, multiplication, and division, as well as additional functions like square roots, exponents, base 10 logarithms, percentages, and negative features. The app also includes decimals and rounds non integers results to 3 decimal places, so its cleaner to read. In terms of what would create an error, anything divided by 0 and unbalanced parenthesis would be the only two things. The square root operator has to option to include a negative number inside the operator, however a square root of a negative would result in an error anyway so I omitted it from this design, however it can be looked upon as a limitation. Another limitation of my app is that I use JSX’s eval() function to process the expressions. The limitation of using this is that it comes with security risks since it can execute untrusted input, like words and phrases for example if I implemented a keyboard aspect to the app. Another limitation of using eval is that JSX has to parse the string into code and then run it. This means that the sequence would go from parsing, to interpreting and then executing, which adds extra steps into something that can be done with one with the math.JS library. So, compute time and the untrusted input are the two things that I have to be careful in moving forward when considering to use eval(), however; I decided to use it for this app because this is a small calculator with not that many functions on it so there would not be much difference in speed and I didn’t program a functionality for the key board to be used when inputting numbers so I thought it would b apt to use for this project. The last limitation in this project is that there is no memory recall. Couple functional wise things, when given an error message, you must clear it (AC) before entering the next calculation, otherwise everything else will result in an error. I did not program the app to handle implicit multiplication, for example 8(7) would be an error but 8*(7) would work. The parenthesis in project was to handle and account for multiple operations at once rather than implicit multiplication, and same thing would follow for 9log10(4) would be an error but 9*log10(4) would not be. When a number is pressed, the entire number you want to be evaluated should be used because after you evaluate the expression and press another number, the previous value clears and the number you entered is the only one that displays (for example 8*7 = 56 and if you type 6, 6 will only be visible not 566). The display of the answer will just be the number or error respectively, but no expression is written other than the one the user writes. There are two ways to exponentiate, either the carrot ^, or **. When using the square root feature, the parenthesis have to be closed otherwise an error will occur, and you haev the press the square root first anf then type the numbers. Generally, whenever an error is received you will need to AC to start a new expression. For the percentage sign, just press the number and % next to it to convert it into a decimal (5% => .05). The 2 addtional items I added in my calculator is that I handle error operations, and I have color changing buttons for the operations.  */
import { Text, SafeAreaView, StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import Animated, { useSharedValue, withTiming, withRepeat, useAnimatedStyle, Easing, interpolateColor } from 'react-native-reanimated';
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function App() {
  const [input, setInput] = useState('0');
  const[justEval, setJustEval] = useState('0');

  const whenPress = (value) => {
  setInput((prevInput) => {
    const prev = prevInput || '0';

    if (justEval === true) {
      setJustEval(false);
      if (value === '.') {
        return '0.';
      } else {
        return value;
      }
    }

    if (value === '.') {
      const parts = prev.split(/[\+\-\*\/]/);
      const lastPart = parts[parts.length - 1] || '';
      if (lastPart.includes('.')) {
        return prev;
      }
      return prev + value;
    }

    if (prev === '0' && value !== '.') {
      return value;
    }

    return prev + value;
  });
};

  



  const whenClear = () => {
    setInput('0');
    setJustEval(false);
  };

  const whenEquals = () => {
    try {
      var result = input;
      result = result.replace(/(\d+(\.\d+)?)%/g, "($1/100)");
      result = result.replace(/\u00F7/g, '/');
      result = result.replace(/×/g, '*');
      result = result.replace(/√\(/g, 'Math.sqrt(');
      result = result.replace(/\^/g, '**');
      result = result.replace(/log\u2081\u2080\(/g, 'Math.log10(');

      var openCount = (result.match(/\(/g) || []).length;
      var closeCount = (result.match(/\)/g) || []).length;
      if(openCount !== closeCount){
        setInput("error");
        setJustEval(true);
        return;
      }


      var answer = eval(result);
      if (answer === Infinity || answer === -Infinity || Number.isNaN(answer)) {
        setInput('error');
        setJustEval(true);
        return;
      }
      if(!(answer === Infinity )&& !(answer === -Infinity) && !(Number.isNaN(answer))){
        answer = parseFloat(answer.toFixed(3));
      }
      setInput(answer.toString());
      setJustEval(true);
    } catch (error) {
      setInput("error");
    }
  };

  const whenNegate = () => {
      setInput((prev) => {
        if (prev.startsWith("-")){
          return prev.substring(1);
        }
        return "-" +prev;
      }
      
    );
  };

  const active = useSharedValue(0);
  useEffect(() => {
    active.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);
    
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(active.value, [0, 1], ['#64B5F6', '#FF9800'])
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.resultView, styles.initialStyle]}>
        <Text style={{ fontSize: 40, color: 'white' }}>{input}</Text>
      </View>

      <View style={styles.inputView}>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenClear()}>
          <Text style={styles.buttonFont}>AC</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenNegate()}>
          <Text style={styles.buttonFont}>+/-</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('√(')}>
          <Text style={styles.buttonFont}>√x</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('%')}>
          <Text style={styles.buttonFont}>%</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputView}>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('(')}>
          <Text style={styles.buttonFont}>(</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress(')')}>
          <Text style={styles.buttonFont}>)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('^')}>
          <Text style={styles.buttonFont}>^</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ ...styles.buttonStyle, paddingHorizontal: 30 }} onPress={() => whenPress('log\u2081\u2080(')}>
          <Text style={styles.buttonFont}>{'log\u2081\u2080'}</Text>
        </TouchableOpacity>
      </View>

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

        <AnimatedTouchable style={[styles.buttonStyle, animatedStyle]} onPress={() => whenPress('\u00F7')}>
          <Text style={styles.buttonFont}>{'\u00F7'}</Text>
        </AnimatedTouchable>
      </View>

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

        <AnimatedTouchable style={[styles.buttonStyle, animatedStyle]} onPress={() => whenPress('*')}>
          <Text style={styles.buttonFont}>*</Text>
        </AnimatedTouchable>
      </View>

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

        <AnimatedTouchable style={[styles.buttonStyle, animatedStyle]} onPress={() => whenPress('-')}>
          <Text style={styles.buttonFont}>-</Text>
        </AnimatedTouchable>
      </View>

      <View style={styles.inputView}>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('.')}>
          <Text style={styles.buttonFont}>.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenPress('0')}>
          <Text style={styles.buttonFont}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonStyle} onPress={() => whenEquals()}>
          <Text style={styles.buttonFont}>=</Text>
        </TouchableOpacity>

        <AnimatedTouchable style={[styles.buttonStyle, animatedStyle]} onPress={() => whenPress('+')}>
          <Text style={styles.buttonFont}>+</Text>
        </AnimatedTouchable>
      </View>
    </SafeAreaView>
  );
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 0
  },

  inputView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignContent: 'space-evenly',
    alignItems: 'flex-start',
    backgroundColor: '#1A1A1A',
    height: 0.1 * windowHeight,
    width: windowWidth,
  },

  resultView: {
    flex: 5,
    backgroundColor: '#37474F',
    height: 0.5 * windowHeight,
    width: windowWidth,
    alignItems: 'flex-start',
    justifyContent: 'space-evenly',
  },

  buttonStyle: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    fontSize: 20,
    backgroundColor: '#F5FFFA',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 20,
    

  },

  buttonFont: {
    fontWeight: 'bold',
    fontSize: 20
  },

  initialStyle: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 10,
  }
});
