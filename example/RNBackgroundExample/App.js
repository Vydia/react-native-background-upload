/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  ActivityIndicator,
  Platform,
  TouchableOpacity
} from "react-native";

import { Header, Colors } from "react-native/Libraries/NewAppScreen";

import Upload from "react-native-background-upload";

import RNFS from "react-native-fs";

const url10SecDelayPut = `http://${Platform.OS === 'ios' ? 'localhost' : '10.0.2.2'}:8080/10secDelay`;
const url5secDelayFail = `http://${Platform.OS === 'ios' ? 'localhost' : '10.0.2.2'}:8080/5secDelayFail`;

const path = RNFS.TemporaryDirectoryPath + "/test.json";

const commonOptions = {
  url: "",
  path: "",
  method: "PUT",
  type: "raw",
  // only supported on Android
  notification: {
    enabled: true
  }
};

const prefix = Platform.OS === 'ios' ? 'file://' : '';

RNFS.writeFile(path, "");

const App: () => React$Node = () => {
  const [delay10Completed, set10SecDelayCompleted] = useState(false);
  const [delay5Completed, set5SecDelayCompleted] = useState(false);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView testID="main_screen">
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}
        >
          <Header />
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                testID="10_sec_delay_button"
                onPress={async () => {
                  const options = {
                    ...commonOptions,
                    url: url10SecDelayPut,
                    path: prefix + path,
                    method: "PUT",
                    type: "raw",
                    // Below are options only supported on Android
                    notification: {
                      enabled: true
                    }
                  };

                  Upload.startUpload(options)
                    .then(uploadId => {
                      Upload.addListener(
                        "completed",
                        uploadId,
                        ({ responseCode }) => {
                          if (responseCode <= 299) {
                            set10SecDelayCompleted(true);
                          }
                        }
                      );
                    })
                    .catch(err => {
                      console.warn(err.message);
                    });
                }}
              >
                <Text>10 Sec Delay Success</Text>
              </TouchableOpacity>

              {delay10Completed && (
                <ActivityIndicator testID="10_sec_delay_completed" />
              )}
            </View>
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                testID="5_sec_delay_button"
                onPress={async () => {
                  const options = {
                    ...commonOptions,
                    url: url5secDelayFail,
                    path: prefix + path,

                    method: "PUT",
                    type: "raw",
                    // Below are options only supported on Android
                    notification: {
                      enabled: true
                    }
                  };

                  Upload.startUpload(options)
                    .then(uploadId => {
                      Upload.addListener(
                        "completed",
                        uploadId,
                        ({ responseCode }) => {
                          if (responseCode === 502) {
                            set5SecDelayCompleted(true);
                          }
                        }
                      );

                      Upload.addListener("error", uploadId, ({ responseCode }) => {
                        if (responseCode === 502) {
                          set5SecDelayCompleted(true);
                        }
                      })
                    })
                    .catch(err => {
                      console.warn(err.message);
                    });
                }}
              >
                <Text>5 Sec Delay Error</Text>
              </TouchableOpacity>

              {delay5Completed && (
                <ActivityIndicator testID="5_sec_delay_completed" />
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter
  },
  engine: {
    position: "absolute",
    right: 0
  },
  body: {
    backgroundColor: Colors.white
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.black
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400",
    color: Colors.dark
  },
  highlight: {
    fontWeight: "700"
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: "600",
    padding: 4,
    paddingRight: 12,
    textAlign: "right"
  }
});

export default App;
