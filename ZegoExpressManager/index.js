'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) {
            throw t[1];
          }
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = {next: verb(0), throw: verb(1), return: verb(2)}),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) {
        throw new TypeError('Generator is already executing.');
      }
      while (_) {
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y.return
                  : op[0]
                  ? y.throw || ((t = y.return) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          ) {
            return t;
          }
          if (((y = 0), t)) {
            op = [op[0] & 2, t.value];
          }
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return {value: op[1], done: false};
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) {
                _.ops.pop();
              }
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      }
      if (op[0] & 5) {
        throw op[1];
      }
      return {value: op[0] ? op[1] : void 0, done: true};
    }
  };
exports.__esModule = true;
exports.ZegoExpressManager = void 0;
var zego_express_engine_reactnative_1 = require('zego-express-engine-reactnative');
var index_entity_1 = require('./index.entity');
/// A wrapper for using ZegoExpressEngine's methods
///
/// We do some basic logic inside this class, if you use it somewhere then we will recommend you use it anywhere.
/// If you don't understand ZegoExpressEngine very well, do not mix two of the class on your code.
/// Instead you should use every methods call of ZegoExpressEngine inside this class
/// and do everything you want via ZegoExpressManager
/// Read more about ZegoExpressEngine: https://docs.zegocloud.com/article/13577
var ZegoExpressManager = /** @class */ (function () {
  function ZegoExpressManager() {
    // key is UserID, value is participant model
    this.participantDic = new Map();
    // key is streamID, value is participant model
    this.streamDic = new Map();
    this.roomID = '';
    this.mediaOptions = [];
    this.deviceUpdateCallback = [];
    this.roomStateUpdateCallback = [];
    this.roomTokenWillExpireCallback = [];
    this.roomUserUpdateCallback = [];
    this.broadcastMessageRecvCallback = [];
    this.roomExtraInfoUpdateCallback = [];
    this.isPublish = false;
    this.onOtherEventSwitch = false;
    if (!ZegoExpressManager.shared) {
      this.localParticipant = {};
      ZegoExpressManager.shared = this;
    }
    return ZegoExpressManager.shared;
  }
  /// Instance of ZegoExpressManager
  ///
  /// You should call all of the method via this instance
  ZegoExpressManager.instance = function () {
    return ZegoExpressManager.shared;
  };
  /// Create SDK instance and setup some callbacks
  ///
  /// You need to call createEngine before call any of other methods of the SDK
  /// Read more about it: https://doc-en-api.zego.im/ReactNative/classes/_zegoexpressengine_.zegoexpressengine.html#createengine
  ZegoExpressManager.createEngine = function (profile) {
    ZegoExpressManager.shared = new ZegoExpressManager();
    return zego_express_engine_reactnative_1.default
      .createEngineWithProfile(profile)
      .then(function (engine) {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][createEngineWithProfile] - Create success',
        );
        if (!ZegoExpressManager.shared.onOtherEventSwitch) {
          ZegoExpressManager.shared.onOtherEvent();
          ZegoExpressManager.shared.onOtherEventSwitch = true;
        }
        return engine;
      });
  };
  /// Destroy the SDK instance if you have no need to use ZEGOCLOUD's API anymore.
  ZegoExpressManager.destroyEngine = function () {
    ZegoExpressManager.shared.offOtherEvent();
    ZegoExpressManager.shared.onOtherEventSwitch = false;
    return zego_express_engine_reactnative_1.default
      .destroyEngine()
      .then(function () {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][destroyEngine] - Destroy engine success',
        );
        ZegoExpressManager.shared.deviceUpdateCallback.length = 0;
        ZegoExpressManager.shared.roomStateUpdateCallback.length = 0;
        ZegoExpressManager.shared.roomTokenWillExpireCallback.length = 0;
        ZegoExpressManager.shared.roomUserUpdateCallback.length = 0;
        ZegoExpressManager.shared.broadcastMessageRecvCallback.length = 0;
        ZegoExpressManager.shared.roomExtraInfoUpdateCallback.length = 0;
        // @ts-ignore
        ZegoExpressManager.shared = null;
      });
  };
  /// User [user] joins into the room with id [roomID] with [options] and then can talk to others who are in the room
  ///
  /// Options are different from scenario to scenario, here are some example
  /// Video Call: [ZegoMediaOption.autoPlayVideo, ZegoMediaOption.autoPlayAudio, ZegoMediaOption.publishLocalAudio, ZegoMediaOption.publishLocalVideo]
  /// Live Streaming: - host: [ZegoMediaOption.autoPlayVideo, ZegoMediaOption.autoPlayAudio, ZegoMediaOption.publishLocalAudio, ZegoMediaOption.publishLocalVideo]
  /// Live Streaming: - audience:[ZegoMediaOption.autoPlayVideo, ZegoMediaOption.autoPlayAudio]
  /// Chat Room: - host:[ZegoMediaOption.autoPlayAudio, ZegoMediaOption.publishLocalAudio]
  /// Chat Room: - audience:[ZegoMediaOption.autoPlayAudio]
  ZegoExpressManager.prototype.joinRoom = function (
    roomID,
    token,
    user,
    options,
  ) {
    var _this = this;
    if (!token) {
      console.error(
        '[ZEGOCLOUD LOG][Manager][joinRoom] - Token is empty, please enter a right token',
      );
      return Promise.resolve(false);
    }
    if (!options) {
      console.error(
        '[ZEGOCLOUD LOG][Manager][joinRoom] - Options is empty, please enter a right options',
      );
      return Promise.resolve(false);
    }
    this.roomID = roomID;
    this.mediaOptions = options;
    this.localParticipant.userID = user.userID;
    this.localParticipant.name = user.userName;
    this.localParticipant.streamID = this.generateStreamID(user.userID, roomID);
    this.participantDic.set(
      this.localParticipant.userID,
      this.localParticipant,
    );
    this.streamDic.set(this.localParticipant.streamID, this.localParticipant);
    var roomConfig = new zego_express_engine_reactnative_1.ZegoRoomConfig(
      0,
      true,
      token,
    );
    return zego_express_engine_reactnative_1.default
      .instance()
      .loginRoom(roomID, user, roomConfig)
      .then(function () {
        return __awaiter(_this, void 0, void 0, function () {
          var _this = this;
          return __generator(this, function (_a) {
            console.warn('[ZEGOCLOUD LOG][Manager][loginRoom] - Login success');
            this.localParticipant.camera = this.mediaOptions.includes(
              index_entity_1.ZegoMediaOptions.PublishLocalVideo,
            );
            this.localParticipant.mic = this.mediaOptions.includes(
              index_entity_1.ZegoMediaOptions.PublishLocalAudio,
            );
            if (this.localParticipant.camera || this.localParticipant.mic) {
              zego_express_engine_reactnative_1.default
                .instance()
                .startPublishingStream(this.localParticipant.streamID)
                .then(function () {
                  console.warn(
                    '[ZEGOCLOUD LOG][Manager][startPublishingStream] - Publish success',
                  );
                  _this.isPublish = true;
                });
              zego_express_engine_reactnative_1.default
                .instance()
                .enableCamera(this.localParticipant.camera)
                .then(function () {
                  console.warn(
                    '[ZEGOCLOUD LOG][Manager][enableCamera] - Enable success',
                    _this.localParticipant.camera,
                  );
                });
              zego_express_engine_reactnative_1.default
                .instance()
                .muteMicrophone(!this.localParticipant.mic)
                .then(function () {
                  console.warn(
                    '[ZEGOCLOUD LOG][Manager][muteMicrophone] - Mute success',
                    !_this.localParticipant.mic,
                  );
                });
            }
            return [2 /*return*/, true];
          });
        });
      });
  };
  /// Turn on your camera if [enable] is true
  ZegoExpressManager.prototype.enableCamera = function (enable) {
    return zego_express_engine_reactnative_1.default
      .instance()
      .enableCamera(enable)
      .then(function () {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][enableCamera] - Enable success',
          enable,
        );
      });
  };
  ZegoExpressManager.prototype.useFrontCamera = function (enable) {
    var _this = this;
    return zego_express_engine_reactnative_1.default
      .instance()
      .useFrontCamera(enable)
      .then(function () {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][useFrontCamera] - Enable success',
          enable,
        );
        _this.localParticipant.camera = enable;
        _this.triggerStreamHandle('camera', enable);
      });
  };
  /// Turn on your microphone if [enable] is true
  ZegoExpressManager.prototype.enableMic = function (enable) {
    var _this = this;
    return zego_express_engine_reactnative_1.default
      .instance()
      .muteMicrophone(!enable)
      .then(function () {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][muteMicrophone] - Mute success',
          !enable,
        );
        _this.localParticipant.mic = enable;
        _this.triggerStreamHandle('mic', enable);
      });
  };
  /// Set the tag value of ref control which can obtain by findNodeHandle method to render your own video
  ZegoExpressManager.prototype.setLocalVideoView = function (renderView) {
    if (!this.roomID) {
      console.error(
        '[ZEGOCLOUD LOG][Manager][setLocalVideoView] - You need to join the room first and then set the videoView',
      );
      return;
    }
    if (renderView === null) {
      console.error(
        '[ZEGOCLOUD LOG][Manager][setLocalVideoView] - You need to pass in the correct element',
      );
      return;
    }
    var _a = this.localParticipant,
      streamID = _a.streamID,
      userID = _a.userID;
    this.localParticipant.renderView = renderView;
    this.participantDic.set(userID, this.localParticipant);
    this.streamDic.set(streamID, this.localParticipant);
    this.triggerPreview('start');
  };
  /// Set the tag value of ref control which can obtain by findNodeHandle method to render video of user with id [userID]
  ZegoExpressManager.prototype.setRemoteVideoView = function (
    userID,
    renderView,
  ) {
    if (renderView === null) {
      console.error(
        '[ZEGOCLOUD LOG][Manager][setRemoteVideoView] - You need to pass in the correct element',
      );
      return;
    }
    if (!userID) {
      console.error(
        '[ZEGOCLOUD LOG][Manager][setRemoteVideoView] - UserID is empty, please enter a right userID',
      );
    }
    var participant = this.participantDic.get(userID);
    participant.renderView = renderView;
    this.participantDic.set(userID, participant);
    if (participant.streamID) {
      // inner roomStreamUpdate -> inner roomUserUpdate -> out roomUserUpdate
      this.streamDic.set(participant.streamID, participant);
    } else {
      // inner roomUserUpdate -> out roomUserUpdate -> inner roomStreamUpdate
    }
    this.playStream(userID);
  };
  /// Set room extra information
  ///
  /// You can set some room-related business attributes, such as whether someone is Co-hosting.
  /// You should call it after joining the room.
  /// Restrictions: https://docs.zegocloud.com/article/7611
  ZegoExpressManager.prototype.setRoomExtraInfo = function (key, value) {
    // Currently, only one key-value pair is allowed for room additional messages.
    // The maximum length of key is 10 bytes, and the maximum length of value is 100 bytes.
    return zego_express_engine_reactnative_1.default
      .instance()
      .setRoomExtraInfo(this.roomID, key, value)
      .then(function (result) {
        if (result.errorCode === 0) {
          console.warn(
            '[ZEGOCLOUD LOG][Manager][setRoomExtraInfo] - Set success',
          );
        }
        return result.errorCode === 0;
      });
  };
  /// Send a room message broadcast to others
  ZegoExpressManager.prototype.sendBroadcastMessage = function (message) {
    return zego_express_engine_reactnative_1.default
      .instance()
      .sendBroadcastMessage(this.roomID, message)
      .then(function (result) {
        if (result.errorCode === 0) {
          console.warn(
            '[ZEGOCLOUD LOG][Manager][sendBroadcastMessage] - Send success',
          );
        }
        return result.errorCode === 0;
      });
  };
  /// Leave the room when you are done the talk or if you want to join another room
  ZegoExpressManager.prototype.leaveRoom = function () {
    console.warn(
      '[ZEGOCLOUD LOG][Manager][leaveRoom] - Stop publishing stream',
    );
    console.warn('[ZEGOCLOUD LOG][Manager][leaveRoom] - Stop preview');
    var roomID = this.roomID;
    zego_express_engine_reactnative_1.default.instance().stopPublishingStream();
    zego_express_engine_reactnative_1.default.instance().stopPreview();
    this.participantDic.forEach(function (participant) {
      zego_express_engine_reactnative_1.default
        .instance()
        .stopPlayingStream(participant.streamID);
      console.warn(
        '[ZEGOCLOUD LOG][Manager][leaveRoom] - Stop playing stream',
        participant.streamID,
      );
    });
    this.participantDic.clear();
    this.streamDic.clear();
    this.roomID = '';
    // @ts-ignore
    this.localParticipant = {};
    this.mediaOptions = [];
    this.isPublish = false;
    return zego_express_engine_reactnative_1.default
      .instance()
      .logoutRoom(roomID)
      .then(function () {
        console.warn('[ZEGOCLOUD LOG][Manager][logoutRoom] - Logout success');
      });
  };
  /// Set a new token to keep access ZEGOCLOUD's SDK while onRoomTokenWillExpire has been triggered
  ZegoExpressManager.prototype.renewToken = function (roomID, token) {
    return zego_express_engine_reactnative_1.default
      .instance()
      .renewToken(roomID, token)
      .then(function () {
        console.warn('ZEGO RN LOG - renewToken success');
      });
  };
  /// When you join in the room it will let you know who is in the room right now with [userIDList] and will let you know who is joining the room or who is leaving after you have joined
  ZegoExpressManager.prototype.onRoomUserUpdate = function (fun) {
    // If the parameter is null, the previously registered callback is cleared
    if (fun) {
      this.roomUserUpdateCallback.push(fun);
    } else {
      this.roomUserUpdateCallback.length = 0;
    }
  };
  /// Trigger when device's status of user with [userID] has been update
  ZegoExpressManager.prototype.onRoomUserDeviceUpdate = function (fun) {
    // If the parameter is null, the previously registered callback is cleared
    if (fun) {
      this.deviceUpdateCallback.push(fun);
    } else {
      this.deviceUpdateCallback.length = 0;
    }
  };
  /// Trigger when the access token will expire which mean you should call renewToken to set new token
  ZegoExpressManager.prototype.onRoomTokenWillExpire = function (fun) {
    // If the parameter is null, the previously registered callback is cleared
    if (fun) {
      this.roomTokenWillExpireCallback.push(fun);
    } else {
      this.roomTokenWillExpireCallback.length = 0;
    }
  };
  /// Trigger when room extra info has been updated by you or others
  ZegoExpressManager.prototype.onRoomExtraInfoUpdate = function (fun) {
    // If the parameter is null, the previously registered callback is cleared
    if (fun) {
      this.roomExtraInfoUpdateCallback.push(fun);
    } else {
      this.roomExtraInfoUpdateCallback.length = 0;
    }
  };
  /// Trigger when room's state changed
  ZegoExpressManager.prototype.onRoomStateUpdate = function (fun) {
    // If the parameter is null, the previously registered callback is cleared
    if (fun) {
      this.roomStateUpdateCallback.push(fun);
    } else {
      this.roomStateUpdateCallback.length = 0;
    }
  };
  /// Triggered when a room broadcast message is received
  ZegoExpressManager.prototype.onBroadcastMessageRecv = function (fun) {
    // If the parameter is null, the previously registered callback is cleared
    if (fun) {
      this.broadcastMessageRecvCallback.push(fun);
    } else {
      this.broadcastMessageRecvCallback.length = 0;
    }
  };
  ZegoExpressManager.prototype.generateStreamID = function (userID, roomID) {
    if (!userID) {
      console.error(
        '[ZEGOCLOUD LOG][Manager][generateStreamID] - UserID is empty, please enter a right userID',
      );
    }
    if (!roomID) {
      console.error(
        '[ZEGOCLOUD LOG][Manager][generateStreamID] - RoomID is empty, please enter a right roomID',
      );
    }
    // The streamID can use any character.
    // For the convenience of query, roomID + UserID + suffix is used here.
    var streamID = roomID + userID + '_main';
    return streamID;
  };
  /// Register callback, read more about: https://doc-en-api.zego.im/ReactNative/classes/_zegoexpressengine_.zegoexpressengine.html#on
  ZegoExpressManager.prototype.onOtherEvent = function () {
    var _this = this;
    zego_express_engine_reactnative_1.default
      .instance()
      .on('roomUserUpdate', function (roomID, updateType, userList) {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][roomUserUpdate]',
          roomID,
          updateType,
          userList,
        );
        var userIDList = [];
        userList.forEach(function (user) {
          userIDList.push(user.userID);
          if (
            updateType === zego_express_engine_reactnative_1.ZegoUpdateType.Add
          ) {
            var participant = _this.participantDic.get(user.userID);
            if (participant) {
              // inner roomStreamUpdate -> inner roomUserUpdate -> out roomUserUpdate
            } else {
              // inner roomUserUpdate -> out roomUserUpdate -> inner roomStreamUpdate
              _this.participantDic.set(user.userID, {
                userID: user.userID,
                name: user.userName,
              });
            }
          } else {
            _this.participantDic.delete(user.userID);
          }
        });
        _this.roomUserUpdateCallback.forEach(function (fun) {
          fun(updateType, userIDList, roomID);
        });
      });
    zego_express_engine_reactnative_1.default
      .instance()
      .on('roomStreamUpdate', function (roomID, updateType, streamList) {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][roomStreamUpdate]',
          roomID,
          updateType,
          streamList,
        );
        streamList.forEach(function (stream) {
          var participant = _this.participantDic.get(stream.user.userID);
          if (
            updateType === zego_express_engine_reactnative_1.ZegoUpdateType.Add
          ) {
            var participant_ = {
              userID: stream.user.userID,
              name: stream.user.userName,
              streamID: stream.streamID,
            };
            if (participant) {
              // inner roomUserUpdate -> out roomUserUpdate -> inner roomStreamUpdate
              participant.streamID = stream.streamID;
              _this.participantDic.set(stream.user.userID, participant);
              _this.streamDic.set(stream.streamID, participant);
            } else {
              // inner roomStreamUpdate -> inner roomUserUpdate -> out roomUserUpdate
              _this.participantDic.set(stream.user.userID, participant_);
              _this.streamDic.set(stream.streamID, participant_);
            }
            _this.playStream(stream.user.userID);
          } else {
            zego_express_engine_reactnative_1.default
              .instance()
              .stopPlayingStream(stream.streamID);
            _this.streamDic.delete(stream.streamID);
          }
        });
      });
    zego_express_engine_reactnative_1.default
      .instance()
      .on('publisherQualityUpdate', function (streamID, quality) {
        var participant = _this.streamDic.get(streamID);
        if (!participant) {
          return;
        }
        participant.publishQuality = quality.level;
        _this.streamDic.set(streamID, participant);
        _this.participantDic.set(participant.userID, participant);
      });
    zego_express_engine_reactnative_1.default
      .instance()
      .on('playerQualityUpdate', function (streamID, quality) {
        var participant = _this.streamDic.get(streamID);
        if (!participant) {
          return;
        }
        participant.playQuality = quality.level;
        _this.streamDic.set(streamID, participant);
        _this.participantDic.set(participant.userID, participant);
      });
    zego_express_engine_reactnative_1.default
      .instance()
      .on('remoteCameraStateUpdate', function (streamID, state) {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][remoteCameraStatusUpdate]',
          streamID,
          state,
        );
        var participant = _this.streamDic.get(streamID);
        if (participant) {
          var updateType_1 =
            state ===
            zego_express_engine_reactnative_1.ZegoRemoteDeviceState.Open
              ? index_entity_1.ZegoDeviceUpdateType.CameraOpen
              : index_entity_1.ZegoDeviceUpdateType.CameraClose;
          participant.camera =
            state ===
            zego_express_engine_reactnative_1.ZegoRemoteDeviceState.Open;
          _this.streamDic.set(streamID, participant);
          _this.participantDic.set(participant.userID, participant);
          _this.deviceUpdateCallback.forEach(function (fun) {
            fun(updateType_1, participant.userID, _this.roomID);
          });
        }
      });
    zego_express_engine_reactnative_1.default
      .instance()
      .on('remoteMicStateUpdate', function (streamID, state) {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][remoteMicStatusUpdate]',
          streamID,
          state,
        );
        var participant = _this.streamDic.get(streamID);
        if (participant) {
          var updateType_2 =
            state ===
            zego_express_engine_reactnative_1.ZegoRemoteDeviceState.Open
              ? index_entity_1.ZegoDeviceUpdateType.MicUnmute
              : index_entity_1.ZegoDeviceUpdateType.MicMute;
          participant.mic =
            state ===
            zego_express_engine_reactnative_1.ZegoRemoteDeviceState.Open;
          _this.streamDic.set(streamID, participant);
          _this.participantDic.set(participant.userID, participant);
          _this.deviceUpdateCallback.forEach(function (fun) {
            fun(updateType_2, participant.userID, _this.roomID);
          });
        }
      });
    zego_express_engine_reactnative_1.default
      .instance()
      .on('roomStateUpdate', function (roomID, state, errorCode) {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][roomStateUpdate]',
          roomID,
          state,
          errorCode,
        );
        _this.roomStateUpdateCallback.forEach(function (fun) {
          fun(state);
        });
      });
    zego_express_engine_reactnative_1.default
      .instance()
      .on('roomTokenWillExpire', function (roomID, remainTimeInSecond) {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][roomTokenWillExpire]',
          roomID,
          remainTimeInSecond,
        );
        _this.roomTokenWillExpireCallback.forEach(function (fun) {
          fun(roomID, remainTimeInSecond);
        });
      });
    zego_express_engine_reactnative_1.default
      .instance()
      .on('roomExtraInfoUpdate', function (roomID, roomExtraInfoList) {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][onRoomExtraInfoUpdate]',
          roomID,
          roomExtraInfoList,
        );
        _this.roomExtraInfoUpdateCallback.forEach(function (fun) {
          fun(roomExtraInfoList);
        });
      });
    zego_express_engine_reactnative_1.default
      .instance()
      .on('IMRecvBroadcastMessage', function (roomID, chatData) {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][IMRecvBroadcastMessage]',
          roomID,
          chatData,
        );
        var msgList = chatData.map(function (item) {
          return {fromUser: item.fromUser, message: item.message};
        });
        _this.broadcastMessageRecvCallback.forEach(function (fun) {
          fun(msgList);
        });
      });
  };
  ZegoExpressManager.prototype.offOtherEvent = function () {
    zego_express_engine_reactnative_1.default.instance().off('roomUserUpdate');
    zego_express_engine_reactnative_1.default
      .instance()
      .off('roomStreamUpdate');
    zego_express_engine_reactnative_1.default
      .instance()
      .off('publisherQualityUpdate');
    zego_express_engine_reactnative_1.default
      .instance()
      .off('playerQualityUpdate');
    zego_express_engine_reactnative_1.default
      .instance()
      .off('remoteCameraStateUpdate');
    zego_express_engine_reactnative_1.default
      .instance()
      .off('remoteMicStateUpdate');
    zego_express_engine_reactnative_1.default.instance().off('roomStateUpdate');
    zego_express_engine_reactnative_1.default
      .instance()
      .off('roomTokenWillExpire');
    zego_express_engine_reactnative_1.default
      .instance()
      .off('IMRecvBroadcastMessage');
    zego_express_engine_reactnative_1.default
      .instance()
      .off('roomExtraInfoUpdate');
  };
  ZegoExpressManager.prototype.playStream = function (userID) {
    if (
      this.mediaOptions.includes(
        index_entity_1.ZegoMediaOptions.AutoPlayAudio,
      ) ||
      this.mediaOptions.includes(index_entity_1.ZegoMediaOptions.AutoPlayVideo)
    ) {
      var participant = this.participantDic.get(userID);
      if (participant && participant.streamID && participant.renderView) {
        var zegoView = new zego_express_engine_reactnative_1.ZegoView(
          participant.renderView,
          zego_express_engine_reactnative_1.ZegoViewMode.AspectFit,
          0,
        );
        console.warn(
          '[ZEGOCLOUD LOG][Manager][playStream] - Start playing stream',
        );
        zego_express_engine_reactnative_1.default
          .instance()
          .startPlayingStream(participant.streamID, zegoView);
        zego_express_engine_reactnative_1.default
          .instance()
          .mutePlayStreamAudio(
            participant.streamID,
            !this.mediaOptions.includes(
              index_entity_1.ZegoMediaOptions.AutoPlayAudio,
            ),
          );
        zego_express_engine_reactnative_1.default
          .instance()
          .mutePlayStreamVideo(
            participant.streamID,
            !this.mediaOptions.includes(
              index_entity_1.ZegoMediaOptions.AutoPlayVideo,
            ),
          );
      }
    }
  };
  ZegoExpressManager.prototype.triggerStreamHandle = function (type, enable) {
    var _this = this;
    var _a = this.localParticipant,
      streamID = _a.streamID,
      camera = _a.camera,
      mic = _a.mic;
    if (enable) {
      if (!this.isPublish) {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][triggerStreamHandle] - Start publishing stream',
        );
        zego_express_engine_reactnative_1.default
          .instance()
          .startPublishingStream(streamID)
          .then(function () {
            _this.isPublish = true;
            _this.triggerPreview('start');
          });
      }
    } else {
      if (
        ((type === 'camera' && !mic) || (type === 'mic' && !camera)) &&
        !this.mediaOptions.includes(
          index_entity_1.ZegoMediaOptions.PublishLocalAudio,
        ) &&
        !this.mediaOptions.includes(
          index_entity_1.ZegoMediaOptions.PublishLocalVideo,
        )
      ) {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][triggerStreamHandle] - Stop publishing stream',
        );
        zego_express_engine_reactnative_1.default
          .instance()
          .stopPublishingStream()
          .then(function () {
            _this.isPublish = false;
            _this.triggerPreview('stop');
          });
      }
    }
  };
  ZegoExpressManager.prototype.triggerPreview = function (type) {
    if (this.localParticipant.renderView) {
      if (type === 'stop') {
        // Stop preview
        console.warn(
          '[ZEGOCLOUD LOG][Manager][triggerPreview] - Stop preview',
          this.localParticipant.streamID,
        );
        zego_express_engine_reactnative_1.default
          .instance()
          .stopPreview()
          .then(function () {
            console.warn(
              '[ZEGOCLOUD LOG][Manager][triggerPreview] - Stop preview success',
            );
          });
      } else {
        // Start preview
        console.warn(
          '[ZEGOCLOUD LOG][Manager][triggerPreview] - Start preview',
          this.localParticipant.streamID,
        );
        var zegoView = new zego_express_engine_reactnative_1.ZegoView(
          this.localParticipant.renderView,
          zego_express_engine_reactnative_1.ZegoViewMode.AspectFit,
          0,
        );
        zego_express_engine_reactnative_1.default
          .instance()
          .startPreview(zegoView)
          .then(function () {
            console.warn(
              '[ZEGOCLOUD LOG][Manager][triggerPreview] - Preview success',
            );
          });
      }
    }
  };
  return ZegoExpressManager;
})();
exports.ZegoExpressManager = ZegoExpressManager;
