import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  Platform,
  TouchableOpacity,
  Animated,
  Easing
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function App() {
  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(width > height);
  const [isRotating, setIsRotating] = useState(false);
  const [badgeColor, setBadgeColor] = useState('#E63946');
  const [textColor, setTextColor] = useState('#1D3557');
  const spinValue = new Animated.Value(0);

  // Colors for customization
  const colorPalette = [
    '#E63946', '#457B9D', '#2A9D8F', '#E9C46A', '#F4A261', '#9D4EDD'
  ];

  // Simple text icons
  const icons = {
    rotate: '🔄',
    portrait: '📱',
    landscape: '🌄',
    palette: '🎨',
    text: '✏️'
  };

  // Update orientation when dimensions change
  useEffect(() => {
    const updateOrientation = () => {
      const newIsLandscape = width > height;
      if (newIsLandscape !== isLandscape) {
        setIsLandscape(newIsLandscape);
        triggerRotationAnimation();
      }
    };
    
    updateOrientation();
  }, [width, height]);

  // Set up orientation
  useEffect(() => {
    async function setupOrientation() {
      try {
        // Allow both portrait and landscape
        await ScreenOrientation.unlockAsync();
      } catch (error) {
        console.log('Orientation setup error:', error);
      }
    }
    setupOrientation();
    
    // Clean up on unmount
    return () => {
      async function cleanup() {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      }
      cleanup();
    };
  }, []);

  // Rotation animation
  const triggerRotationAnimation = () => {
    setIsRotating(true);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      spinValue.setValue(0);
      setIsRotating(false);
    });
  };

  // Manual rotation button handler
  const handleManualRotate = async () => {
    try {
      if (isLandscape) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
        );
      }
    } catch (error) {
      console.log('Manual rotation error:', error);
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Responsive calculations
  const getResponsiveValues = () => {
    const screenShortSide = Math.min(width, height);
    const screenLongSide = Math.max(width, height);
    
    if (isLandscape) {
      return {
        welcomeFontSize: screenShortSide * 0.14,
        subtitleFontSize: screenShortSide * 0.05,
        nameFontSize: screenShortSide * 0.10,
        nameBoxHeight: screenShortSide * 0.5,
        nameBoxWidth: screenLongSide * 0.8,
        paddingHorizontal: 40,
        marginVertical: 10,
        pronounFontSize: screenShortSide * 0.045,
        taglineFontSize: screenShortSide * 0.0375,
        buttonFontSize: screenShortSide * 0.04
      };
    } else {
      return {
        welcomeFontSize: screenShortSide * 0.14,
        subtitleFontSize: screenShortSide * 0.045,
        nameFontSize: screenShortSide * 0.10,
        nameBoxHeight: screenShortSide * 0.40,
        nameBoxWidth: screenShortSide * 0.9,
        paddingHorizontal: 20,
        marginVertical: 5,
        pronounFontSize: screenShortSide * 0.045,
        taglineFontSize: screenShortSide * 0.0375,
        buttonFontSize: screenShortSide * 0.04
      };
    }
  };

  const responsive = getResponsiveValues();

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: badgeColor }]}>
        <SafeAreaView style={[styles.safeArea, { paddingHorizontal: responsive.paddingHorizontal }]}>
          {/* Header with controls */}
          <View style={styles.header}>
            <Text style={styles.title}>Name Badge</Text>
            
            <View style={styles.controls}>
              {/* Manual rotation button */}
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleManualRotate}
                activeOpacity={0.7}
              >
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Text style={styles.iconText}>
                    {icons.rotate}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
              
              {/* Color picker */}
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => {
                  // Cycle through colors
                  const currentIndex = colorPalette.indexOf(badgeColor);
                  const nextIndex = (currentIndex + 1) % colorPalette.length;
                  setBadgeColor(colorPalette[nextIndex]);
                }}
              >
                <Text style={styles.iconText}>{icons.palette}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main content */}
          <View style={[styles.content, { marginVertical: responsive.marginVertical }]}>
            <Animated.View style={[styles.textContainer, { opacity: spinValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 0.5, 1]
            }) }]}>
              <Text style={[
                styles.welcomeText,
                { fontSize: responsive.welcomeFontSize }
              ]}>
                Hello
              </Text>
              
              <Text style={[
                styles.subtitleText,
                { fontSize: responsive.subtitleFontSize }
              ]}>
                my name is
              </Text>
            </Animated.View>
            
            <Animated.View style={[
              styles.nameBox,
              {
                height: responsive.nameBoxHeight,
                width: responsive.nameBoxWidth,
              }
            ]}>
              <Text style={[
                styles.nameText,
                { 
                  fontSize: responsive.nameFontSize,
                  color: textColor
                }
              ]}>
                Chris 👨‍💻
              </Text>
              
              <View style={styles.nameDetails}>
                <Text style={[styles.pronounText, {fontSize: responsive.pronounFontSize}]}>(he/him)</Text>
                <Text style={[styles.taglineText, {fontSize: responsive.taglineFontSize}]}>React Native Developer</Text>
              </View>
              
              {/* Custom text color picker */}
              <TouchableOpacity 
                style={styles.textColorButton}
                onPress={() => {
                  const colors = ['#1D3557', '#000000', '#2A9D8F', '#9D4EDD'];
                  const currentIndex = colors.indexOf(textColor);
                  const nextIndex = (currentIndex + 1) % colors.length;
                  setTextColor(colors[nextIndex]);
                }}
              >
                <Text style={[styles.textColorButtonText, {fontSize: responsive.buttonFontSize}]}>
                  {icons.text} Change Text Color
                </Text>
              </TouchableOpacity>
            </Animated.View>
            
            {/* Orientation indicator */}
            <View style={styles.orientationIndicator}>
              <Text style={styles.orientationIcon}>
                {isLandscape ? icons.landscape : icons.portrait}
              </Text>
              <Text style={styles.orientationText}>
                {isLandscape ? 'Landscape Mode' : 'Portrait Mode'}
              </Text>
              <Text style={styles.dimensionsText}>
                {Math.round(width)} x {Math.round(height)}
              </Text>
            </View>
            
            {/* Instructions */}
            <Text style={styles.instructions}>
              {Platform.OS === 'ios' 
                ? 'Tip: Rotate your device or click the 🔄 icon above'
                : 'Tip: Rotate your device or use the rotation button'
              }
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  welcomeText: {
    textTransform: 'uppercase',
    fontWeight: Platform.OS === 'ios' ? '900' : 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    includeFontPadding: false,
  },
  subtitleText: {
    textTransform: 'uppercase',
    fontWeight: Platform.OS === 'ios' ? '700' : '600',
    color: 'white',
    textAlign: 'center',
    includeFontPadding: false,
    letterSpacing: 1,
  },
  nameBox: {
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
      marginBottom: 30,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  nameText: {
    textAlign: 'center',
    fontWeight: Platform.OS === 'ios' ? '900' : 'bold',
    includeFontPadding: false,
    marginTop: 25,
    marginRight: 14,
  },
  nameDetails: {
    alignItems: 'center',
    marginTop: 10,
  },
  pronounText: {
    color: '#666',
    fontWeight: '500',
  },
  taglineText: {
    color: '#333',
    marginTop: 5,
    marginLeft: 70,
    marginRight: 4,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  textColorButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textColorButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  orientationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 30,
  },
  orientationIcon: {
    fontSize: 20,
  },
  orientationText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  dimensionsText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  instructions: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 15,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
});