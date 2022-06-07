/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import {Button, StyleSheet, Text, View, TextInput} from 'react-native';
import {Actions} from 'react-native-router-flux';

const styles = StyleSheet.create({
  // ZegoEasyExample
  homePage: {
    width: '100%',
    height: '100%',
    display: 'flex',
  },
  logo: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    marginTop: '20%',
    marginBottom: '15%',
  },
  roomInputCon: {
    width: 200,
    height: 40,
    borderWidth: 2,
    borderColor: '#005a90',
    marginTop: '20%',
    marginBottom: '15%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  roomInput: {
    width: '100%',
    height: '100%',
  },
  joinRoomBtn: {
    width: 200,
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: '15%',
  },
});

const now = new Date().getTime();
const config = {
  // Get your AppID from ZEGOCLOUD Console [My Projects] : https://console.zegocloud.com/project
  appID: 1719562607,
  // Heroku server url for example
  // Heroku server url for example
  // Get the server from: https://github.com/ZEGOCLOUD/dynamic_token_server_nodejs
  // e.g. https://xxx.herokuapp.com
  tokerServerUrl: 'https://easy-example-call.herokuapp.com',
  userID: 'rn_user_' + now,
  userName: 'rn_user_' + now,
  roomID: '',
};

export default class Home extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    inputValue: '',
  };
  onChangeText(value) {
    this.setState({
      inputValue: value,
    });
  }
  async startLive(isHost) {
    // TODO roomID should be unique for every live streaming. And do not use special characters for it.
    // We recommend only contain letters, numbers, and '_'.
    config.roomID = this.state.inputValue;
    if (!config.roomID) {
      return;
    }
    const tokenObj = await this.generateToken();
    Actions.live({
      appID: config.appID,
      token: tokenObj.token,
      roomID: config.roomID,
      userID: config.userID,
      userName: config.userName,
      isHost: isHost,
    });
  }
  generateToken() {
    // Obtain the token interface provided by the App Server
    return fetch(`${config.tokerServerUrl}/access_token?uid=${config.userID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }).then(data => data.json());
  }
  render() {
    return (
      <View style={[styles.homePage]}>
        <Text style={styles.logo}>ZEGOCLOUD</Text>
        <View style={styles.roomInputCon}>
          <TextInput
            placeholder="Please enter roomID here"
            style={styles.roomInput}
            onChangeText={text => this.onChangeText(text)}
          />
        </View>
        <View style={styles.joinRoomBtn}>
          <Button
            onPress={this.startLive.bind(this, true)}
            title="join Live As Host"
          />
        </View>
        <View style={styles.joinRoomBtn}>
          <Button
            onPress={this.startLive.bind(this, false)}
            title="join Live As Audience"
          />
        </View>
      </View>
    );
  }
}
