import ZegoExpressEngine, {
  ZegoUser,
  ZegoRoomConfig,
  ZegoEngineProfile,
  ZegoView,
  ZegoViewMode,
  ZegoUpdateType,
  ZegoRemoteDeviceState,
  ZegoPublishStreamQuality,
  ZegoPlayStreamQuality,
  ZegoStream,
  ZegoRoomState,
  ZegoRoomExtraInfo,
  ZegoRoomSetRoomExtraInfoResult,
} from 'zego-express-engine-reactnative';

import {
  ZegoDeviceUpdateType,
  ZegoMediaOptions,
  ZegoParticipant,
} from './index.entity';

export class ZegoExpressManager {
  // key is UserID, value is participant model
  private participantDic: Map<string, ZegoParticipant> = new Map();
  // key is streamID, value is participant model
  private streamDic: Map<string, ZegoParticipant> = new Map();
  private localParticipant!: ZegoParticipant;
  private roomID = '';
  private mediaOptions: ZegoMediaOptions[] = [];
  private deviceUpdateCallback: ((
    updateType: ZegoDeviceUpdateType,
    userID: string,
    roomID: string,
  ) => void)[] = [];
  private isPublish = false;
  private roomExtraInfo!: ZegoRoomExtraInfo;
  static shared: ZegoExpressManager;
  private constructor() {
    if (!ZegoExpressManager.shared) {
      this.localParticipant = {} as ZegoParticipant;
      ZegoExpressManager.shared = this;
    }
    return ZegoExpressManager.shared;
  }
  static instance() {
    return ZegoExpressManager.shared;
  }
  static createEngine(profile: ZegoEngineProfile): Promise<ZegoExpressEngine> {
    ZegoExpressManager.shared = new ZegoExpressManager();
    return ZegoExpressEngine.createEngineWithProfile(profile).then(
      (engine: ZegoExpressEngine) => {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][createEngineWithProfile] - Create success',
        );
        ZegoExpressManager.shared.onOtherEvent();
        return engine;
      },
    );
  }
  joinRoom(
    roomID: string,
    token: string,
    user: ZegoUser,
    options: ZegoMediaOptions[],
  ): Promise<boolean> {
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

    const roomConfig = new ZegoRoomConfig(0, true, token);
    return ZegoExpressEngine.instance()
      .loginRoom(roomID, user, roomConfig)
      .then(async () => {
        console.warn('[ZEGOCLOUD LOG][Manager][loginRoom] - Login success');
        this.localParticipant.camera = this.mediaOptions.includes(
          ZegoMediaOptions.PublishLocalVideo,
        );
        this.localParticipant.mic = this.mediaOptions.includes(
          ZegoMediaOptions.PublishLocalAudio,
        );
        if (this.localParticipant.camera || this.localParticipant.mic) {
          ZegoExpressEngine.instance()
            .startPublishingStream(this.localParticipant.streamID)
            .then(() => {
              console.warn(
                '[ZEGOCLOUD LOG][Manager][startPublishingStream] - Publish success',
              );
              this.isPublish = true;
            });
          ZegoExpressEngine.instance()
            .enableCamera(this.localParticipant.camera)
            .then(() => {
              console.warn(
                '[ZEGOCLOUD LOG][Manager][enableCamera] - Enable success',
                this.localParticipant.camera,
              );
            });
          ZegoExpressEngine.instance()
            .muteMicrophone(!this.localParticipant.mic)
            .then(() => {
              console.warn(
                '[ZEGOCLOUD LOG][Manager][muteMicrophone] - Mute success',
                !this.localParticipant.mic,
              );
            });
        }
        return true;
      });
  }
  enableCamera(enable: boolean): Promise<void> {
    return ZegoExpressEngine.instance()
      .enableCamera(enable)
      .then(() => {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][enableCamera] - Enable success',
          enable,
        );
        this.localParticipant.camera = enable;
        this.triggerStreamHandle('camera', enable);
      });
  }
  enableMic(enable: boolean): Promise<void> {
    return ZegoExpressEngine.instance()
      .muteMicrophone(!enable)
      .then(() => {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][muteMicrophone] - Mute success',
          !enable,
        );
        this.localParticipant.mic = enable;
        this.triggerStreamHandle('mic', enable);
      });
  }
  setLocalVideoView(renderView: number) {
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
    const {streamID, userID} = this.localParticipant;
    this.localParticipant.renderView = renderView;
    this.participantDic.set(userID, this.localParticipant);
    this.streamDic.set(streamID, this.localParticipant);
    this.triggerPreview('start');
  }
  setRemoteVideoView(userID: string, renderView: number) {
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
    const participant = this.participantDic.get(userID) as ZegoParticipant;
    participant.renderView = renderView;
    this.participantDic.set(userID, participant);
    if (participant.streamID) {
      // inner roomStreamUpdate -> inner roomUserUpdate -> out roomUserUpdate
      this.streamDic.set(participant.streamID, participant);
    } else {
      // inner roomUserUpdate -> out roomUserUpdate -> inner roomStreamUpdate
    }
    this.playStream(userID);
  }
  setRoomExtraInfo(key: string, value: string): Promise<boolean> {
    // Currently, only one key-value pair is allowed for room additional messages.
    // The maximum length of key is 10 bytes, and the maximum length of value is 100 bytes.
    return ZegoExpressEngine.instance()
      .setRoomExtraInfo(this.roomID, key, value)
      .then((result: ZegoRoomSetRoomExtraInfoResult) => {
        if (result.errorCode === 0) {
          console.warn(
            '[ZEGOCLOUD LOG][Manager][setRoomExtraInfo] - Set success',
          );
          // const { userID, name: userName } = this.localParticipant;
          // this.roomExtraInfo = {
          //   key,
          //   value,
          //   updateUser: { userID, userName },
          //   updateTime: new Date().getTime(),
          // };
        }
        return result.errorCode === 0;
      });
  }
  leaveRoom(): Promise<void> {
    console.warn(
      '[ZEGOCLOUD LOG][Manager][leaveRoom] - Stop publishing stream',
    );
    console.warn('[ZEGOCLOUD LOG][Manager][leaveRoom] - Stop preview');
    const roomID = this.roomID;
    ZegoExpressEngine.instance().stopPublishingStream();
    ZegoExpressEngine.instance().stopPreview();
    this.participantDic.forEach(participant => {
      ZegoExpressEngine.instance().stopPlayingStream(participant.streamID);
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
    this.deviceUpdateCallback.length = 0;
    this.mediaOptions = [];
    this.isPublish = false;
    return ZegoExpressEngine.instance()
      .logoutRoom(roomID)
      .then(() => {
        console.warn('[ZEGOCLOUD LOG][Manager][logoutRoom] - Logout success');
      });
  }
  onRoomUserUpdate(
    fun: (
      updateType: ZegoUpdateType,
      userList: string[],
      roomID: string,
    ) => void,
  ) {
    return ZegoExpressEngine.instance().on(
      'roomUserUpdate',
      (roomID: string, updateType: ZegoUpdateType, userList: ZegoUser[]) => {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][onRoomUserUpdate]',
          roomID,
          updateType,
          userList,
        );
        const userIDList: string[] = [];
        userList.forEach((user: ZegoUser) => {
          userIDList.push(user.userID);
        });
        fun(updateType, userIDList, roomID);
      },
    );
  }
  onRoomUserDeviceUpdate(
    fun: (
      updateType: ZegoDeviceUpdateType,
      userID: string,
      roomID: string,
    ) => void,
  ) {
    this.deviceUpdateCallback.push(fun);
  }
  onRoomTokenWillExpire(
    fun: (roomID: string, remainTimeInSecond: number) => void,
  ) {
    return ZegoExpressEngine.instance().on('roomTokenWillExpire', fun);
  }
  onRoomExtraInfoUpdate(fun: (roomExtraInfoList: ZegoRoomExtraInfo[]) => void) {
    return ZegoExpressEngine.instance().on(
      'roomExtraInfoUpdate',
      (roomID: string, roomExtraInfoList: ZegoRoomExtraInfo[]) => {
        // this.roomExtraInfo = roomExtraInfoList[0];
        console.warn(
          '[ZEGOCLOUD LOG][Manager][onRoomExtraInfoUpdate]',
          roomID,
          roomExtraInfoList,
        );
        fun(roomExtraInfoList);
      },
    );
  }
  onRoomStateUpdate(fun: (state: ZegoRoomState) => void) {
    return ZegoExpressEngine.instance().on(
      'roomStateUpdate',
      (roomID: string, state: ZegoRoomState) => {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][onRoomStateUpdate]',
          roomID,
          state,
        );
        fun(state);
      },
    );
  }
  private generateStreamID(userID: string, roomID: string): string {
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
    const streamID = roomID + userID + '_main';
    return streamID;
  }
  private onOtherEvent() {
    ZegoExpressEngine.instance().on(
      'roomUserUpdate',
      (roomID: string, updateType: ZegoUpdateType, userList: ZegoUser[]) => {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][roomUserUpdate]',
          roomID,
          updateType,
          userList,
        );
        userList.forEach(user => {
          if (updateType === ZegoUpdateType.Add) {
            const participant = this.participantDic.get(user.userID);
            if (participant) {
              // inner roomStreamUpdate -> inner roomUserUpdate -> out roomUserUpdate
            } else {
              // inner roomUserUpdate -> out roomUserUpdate -> inner roomStreamUpdate
              this.participantDic.set(user.userID, {
                userID: user.userID,
                name: user.userName,
              } as ZegoParticipant);
            }
          } else {
            this.participantDic.delete(user.userID);
          }
        });
      },
    );
    ZegoExpressEngine.instance().on(
      'roomStreamUpdate',
      (
        roomID: string,
        updateType: ZegoUpdateType,
        streamList: ZegoStream[],
      ) => {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][roomStreamUpdate]',
          roomID,
          updateType,
          streamList,
        );
        streamList.forEach(stream => {
          const participant = this.participantDic.get(stream.user.userID);
          if (updateType === ZegoUpdateType.Add) {
            const participant_ = {
              userID: stream.user.userID,
              name: stream.user.userName,
              streamID: stream.streamID,
            };
            if (participant) {
              // inner roomUserUpdate -> out roomUserUpdate -> inner roomStreamUpdate
              participant.streamID = stream.streamID;
              this.participantDic.set(stream.user.userID, participant);
              this.streamDic.set(stream.streamID, participant);
            } else {
              // inner roomStreamUpdate -> inner roomUserUpdate -> out roomUserUpdate
              this.participantDic.set(
                stream.user.userID,
                participant_ as ZegoParticipant,
              );
              this.streamDic.set(
                stream.streamID,
                participant_ as ZegoParticipant,
              );
            }
            this.playStream(stream.user.userID);
          } else {
            ZegoExpressEngine.instance().stopPlayingStream(stream.streamID);
            this.streamDic.delete(stream.streamID);
          }
        });
      },
    );
    ZegoExpressEngine.instance().on(
      'publisherQualityUpdate',
      (streamID: string, quality: ZegoPublishStreamQuality) => {
        const participant = this.streamDic.get(streamID);
        if (!participant) {
          return;
        }

        participant.publishQuality = quality.level;

        this.streamDic.set(streamID, participant);
        this.participantDic.set(participant.userID, participant);
      },
    );
    ZegoExpressEngine.instance().on(
      'playerQualityUpdate',
      (streamID: string, quality: ZegoPlayStreamQuality) => {
        const participant = this.streamDic.get(streamID);
        if (!participant) {
          return;
        }

        participant.playQuality = quality.level;

        this.streamDic.set(streamID, participant);
        this.participantDic.set(participant.userID, participant);
      },
    );
    ZegoExpressEngine.instance().on(
      'remoteCameraStateUpdate',
      (streamID: string, state: ZegoRemoteDeviceState) => {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][remoteCameraStatusUpdate]',
          streamID,
          state,
        );
        const participant = this.streamDic.get(streamID);
        if (participant) {
          const updateType =
            state === ZegoRemoteDeviceState.Open
              ? ZegoDeviceUpdateType.CameraOpen
              : ZegoDeviceUpdateType.CameraClose;
          participant.camera = state === ZegoRemoteDeviceState.Open;
          this.streamDic.set(streamID, participant);
          this.participantDic.set(participant.userID, participant);
          this.deviceUpdateCallback.forEach(fun => {
            fun(updateType, participant.userID, this.roomID);
          });
        }
      },
    );
    ZegoExpressEngine.instance().on(
      'remoteMicStateUpdate',
      (streamID: string, state: ZegoRemoteDeviceState) => {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][remoteMicStatusUpdate]',
          streamID,
          state,
        );
        const participant = this.streamDic.get(streamID);
        if (participant) {
          const updateType =
            state === ZegoRemoteDeviceState.Open
              ? ZegoDeviceUpdateType.MicUnmute
              : ZegoDeviceUpdateType.MicMute;
          participant.mic = state === ZegoRemoteDeviceState.Open;
          this.streamDic.set(streamID, participant);
          this.participantDic.set(participant.userID, participant);
          this.deviceUpdateCallback.forEach(fun => {
            fun(updateType, participant.userID, this.roomID);
          });
        }
      },
    );
    ZegoExpressEngine.instance().on(
      'roomStateUpdate',
      (roomID, state, errorCode) => {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][roomStateUpdate]',
          roomID,
          state,
          errorCode,
        );
      },
    );
  }
  private playStream(userID: string) {
    if (
      this.mediaOptions.includes(ZegoMediaOptions.AutoPlayAudio) ||
      this.mediaOptions.includes(ZegoMediaOptions.AutoPlayVideo)
    ) {
      const participant = this.participantDic.get(userID);
      if (participant && participant.streamID && participant.renderView) {
        const zegoView = new ZegoView(
          participant.renderView,
          ZegoViewMode.AspectFit,
          0,
        );
        console.warn(
          '[ZEGOCLOUD LOG][Manager][playStream] - Start playing stream',
        );
        ZegoExpressEngine.instance().startPlayingStream(
          participant.streamID,
          zegoView,
        );
        ZegoExpressEngine.instance().mutePlayStreamAudio(
          participant.streamID,
          !this.mediaOptions.includes(ZegoMediaOptions.AutoPlayAudio),
        );
        ZegoExpressEngine.instance().mutePlayStreamVideo(
          participant.streamID,
          !this.mediaOptions.includes(ZegoMediaOptions.AutoPlayVideo),
        );
      }
    }
  }
  private triggerStreamHandle(type: 'camera' | 'mic', enable: boolean) {
    const {streamID, camera, mic} = this.localParticipant;
    if (enable) {
      if (!this.isPublish) {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][triggerStreamHandle] - Start publishing stream',
        );
        ZegoExpressEngine.instance()
          .startPublishingStream(streamID)
          .then(() => {
            this.isPublish = true;
            this.triggerPreview('start');
          });
      }
    } else {
      if (
        ((type === 'camera' && !mic) || (type === 'mic' && !camera)) &&
        !this.mediaOptions.includes(ZegoMediaOptions.PublishLocalAudio) &&
        !this.mediaOptions.includes(ZegoMediaOptions.PublishLocalVideo)
      ) {
        console.warn(
          '[ZEGOCLOUD LOG][Manager][triggerStreamHandle] - Stop publishing stream',
        );
        ZegoExpressEngine.instance()
          .stopPublishingStream()
          .then(() => {
            this.isPublish = false;
            this.triggerPreview('stop');
          });
      }
    }
  }
  private triggerPreview(type: 'start' | 'stop') {
    if (this.localParticipant.renderView) {
      if (type === 'stop') {
        // Stop preview
        console.warn(
          '[ZEGOCLOUD LOG][Manager][triggerPreview] - Stop preview',
          this.localParticipant.streamID,
        );
        ZegoExpressEngine.instance()
          .stopPreview()
          .then(() => {
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
        const zegoView = new ZegoView(
          this.localParticipant.renderView,
          ZegoViewMode.AspectFit,
          0,
        );
        ZegoExpressEngine.instance()
          .startPreview(zegoView)
          .then(() => {
            console.warn(
              '[ZEGOCLOUD LOG][Manager][triggerPreview] - Preview success',
            );
          });
      }
    }
  }
}
