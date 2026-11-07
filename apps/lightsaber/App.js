import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';

const saber_crash = require('./saber_crash.mp3');
const saber_off = require('./saber_off.mp3');
const saber_on = require('./saber_on.mp3');
const saber_swing = require('./saber_swing.mp3');

const saber_handle = require('./handle.png');

export default function App() {
  const onPlayer = useAudioPlayer(saber_on);
  const offPlayer = useAudioPlayer(saber_off);
  const swingPlayer = useAudioPlayer(saber_swing);
  const crashPlayer = useAudioPlayer(saber_crash);

  const [saberOn, setSaberOn] = useState(false);
  const saberOnRef = useRef(false);

  const [, setData] = useState({ x: 0, y: 0, z: 0 });
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });

  const subscriptionRef = useRef(null);
  const lastSwing = useRef(0);
  const lastCrash = useRef(0);

  const isPhoneRightSideUp = () => {
    const { x, y, z } = lastAccel.current;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    if (magnitude === 0) return false;

    const normalizedY = y / magnitude;
    return normalizedY < -0.75;
  };

  const isPhoneUpsideDown = () => {
    const { x, y, z } = lastAccel.current;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    if (magnitude === 0) return false;

    const normalizedY = y / magnitude;
    return normalizedY > 0.75;
  };

  const _subscribe = () => {
    const sub = Accelerometer.addListener((data) => {
      setData(data);
      lastAccel.current = data;

      if (!saberOnRef.current) return;

      const { x, y, z } = data;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (magnitude > 2.75 && now - lastCrash.current > 600) {
        lastCrash.current = now;
        crashPlayer.seekTo(0);
        crashPlayer.play();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else if (magnitude > 1.5 && now - lastSwing.current > 600) {
        lastSwing.current = now;
        swingPlayer.seekTo(0);
        swingPlayer.play();
      }
    });

    subscriptionRef.current = sub;
  };

  const _unsubscribe = () => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  };

  useEffect(() => {
    saberOnRef.current = saberOn;
  }, [saberOn]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
    });

    const lockScreen = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };

    lockScreen();

    _subscribe();

    return () => {
      _unsubscribe();
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const toggleSaber = () => {
    if (saberOnRef.current) {
      if (!isPhoneUpsideDown()) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }

      offPlayer.seekTo(0);
      offPlayer.play();
      saberOnRef.current = false;
      setSaberOn(false);
      return;
    }

    if (!isPhoneRightSideUp()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    onPlayer.seekTo(0);
    onPlayer.play();
    saberOnRef.current = true;
    setSaberOn(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.title}>Darth Vader's Saber</Text>

        <Text style={[styles.statusText, saberOn ? styles.statusOn : styles.statusOff]}>
          {saberOn ? 'STATUS: ON' : 'STATUS: OFF'}
        </Text>
      </View>

      <View style={styles.bottomSection}>
        {saberOn && (
          <View style={styles.bladeContainer}>
            <View style={styles.bladeGlowOuter} />
            <View style={styles.bladeGlowInner} />
            <View style={styles.bladeCore} />
          </View>
        )}

        <TouchableOpacity onPress={toggleSaber} style={styles.handleButton} activeOpacity={0.95}>
          <Image
            source={saber_handle}
            style={styles.handleImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030303',
  },

  topSection: {
    alignItems: 'center',
    paddingTop: 40,
  },

  bottomSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },

  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    letterSpacing: 1,
  },

  statusOn: {
    color: '#ff3b30',
  },

  statusOff: {
    color: '#777',
  },

  bladeContainer: {
    position: 'absolute',
    bottom: 210,
    alignItems: 'center',
  },

  bladeGlowOuter: {
    position: 'absolute',
    width: 34,
    height: 420,
    backgroundColor: 'rgba(255, 0, 0, 0.18)',
    borderRadius: 25,
  },

  bladeGlowInner: {
    position: 'absolute',
    width: 20,
    height: 420,
    backgroundColor: 'rgba(255, 0, 0, 0.45)',
    borderRadius: 20,
  },

  bladeCore: {
    width: 8,
    height: 420,
    backgroundColor: '#ff2d2d',
    borderRadius: 10,
  },

  handleButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  handleImage: {
    width: 280,
    height: 280,
    opacity: 0.95,
  },
});