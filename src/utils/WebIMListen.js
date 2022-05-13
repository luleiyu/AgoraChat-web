
import WebIM from './WebIM'
import getContacts, { getBlackList } from '../api/contactsChat/getContacts'
import getGroups from '../api/groupChat/getGroups'
import getPublicGroups from '../api/groupChat/getPublicGroups'
import { getSilentModeForAll } from '../api/notificationPush'
import { createHashHistory } from 'history'
import store from '../redux/store'
import { setRequests, setFetchingStatus, presenceStatusImg, setPresenceList, setUnread } from '../redux/actions'
import { getToken } from '../api/loginChat'
import { agreeInviteGroup } from '../api/groupChat/addGroup'
import { getGroupMuted } from "../api/groupChat/groupMute";
import { getGroupWrite } from "../api/groupChat/groupWhite";
import { notification, getLocalStorageData, playSound, randomNumber, setTimeVSNowTime, checkBrowerNotifyStatus, notifyMe } from './notification'

import i18next from "i18next";
import { message } from '../components/common/alert'

import { EaseApp } from "luleiyu-agora-chat"

function publicNotify (message, msgType, iconTitle = {}, body = 'You Have A New Message') {
    const { chatType, from, data, type, to, time, url} = message
    let { myUserInfo: { agoraId }, muteDataObj, globalSilentMode: { global, single, group, threading } } = store.getState()
    console.log(iconTitle, 'iconTitle=publicNotify', message, msgType, body)
    console.log(global[agoraId], single, group, threading)
    handlerNewMessage(message, true)
    /**
     * 免打扰时间，全局权重最高，也高于类型
     */
    // 全局设置勿扰时间并且勿扰时间没过期，那就不能提示
    if ((global[agoraId]?.ignoreDuration && !setTimeVSNowTime(global[agoraId], true))) {
        console.log('全局，勿扰时间，未过期，类型为none')
        return
    }
    let sessionType = ''
    switch (type) {
        case 'chat' || 'singleChat':
            sessionType = 'singleChat'
            break
        case 'groupchat' || 'groupChat':
            sessionType = 'groupChat'
            break
        case 'chatroom' || 'chatRoom':
            sessionType = 'chatRoom'
            break
        default:
            break
    }
    // 如果单聊、群组，threading设置了勿扰时间并且勿扰时间没过期，那就不能提示
    if (sessionType === 'singleChat' && ((single[from]?.ignoreDuration && !setTimeVSNowTime(single[from], true)) || (single[from]?.type && single[from]?.type === 'NONE') || (!single[from].type && global[agoraId].type === 'NONE'))) {
        console.log('单聊，勿扰时间，未过期，类型为none')
        return
    } else if (sessionType === 'groupChat' && ((group[to]?.ignoreDuration && !setTimeVSNowTime(group[to], true)) || (group[to]?.type && group[to]?.type === 'NONE') || (!group[to].type && global[agoraId].type === 'NONE'))) {
        console.log('群组，勿扰时间，未过期，类型为none')
        return
    } else if (sessionType === 'threading' && ((threading[to]?.ignoreDuration && !setTimeVSNowTime(threading[to], true)) || (threading[to]?.type && threading[to]?.type === 'NONE') || (!threading[to].type && global[agoraId].type === 'NONE'))) {
        console.log('threading，勿扰时间，未过期，类型为none')
        return
    }
    /**
     * 免打扰类型
     */
    // 全局的权重最低
    if ((sessionType === 'singleChat' && (!single[from].type || (single[from]?.type && single[from]?.type === 'DEFAULT'))) || (sessionType === 'groupChat' && (!group[to].type || (group[to]?.type && group[to]?.type === 'DEFAULT'))) || (sessionType === 'threading' && (!threading[to].type || (threading[to]?.type && threading[to]?.type === 'DEFAULT')))) {
        console.log('单聊群组或threading,类型为-默认')
        if (global[agoraId]?.type && global[agoraId].type === 'NONE') {
            console.log('单聊群组或threading,类型为-默认，全局类型为none')
            return
        } else if (global[agoraId]?.type && global[agoraId].type === 'AT') {
            console.log('单聊群组或threading,类型为-默认,全局类型为-at')
            if (sessionType === 'singleChat') {
                console.log('当前是单聊')
                return
            } else {
                console.log('全局类型为-at，群组或threading,类型为-默认,当前不是单聊')
                if (!(new RegExp('^\@' + agoraId).test(data))) {
                    console.log('单聊群组或threading,类型为-默认，全局为-at,聊天内容不是-at')
                    return
                }
            }
        }
    }
    if ((sessionType === 'groupChat' && group[to]?.type && group[to]?.type === 'AT') || (sessionType === 'threading' && threading[to]?.type && threading[to]?.type === 'AT')) {
        console.log('群组或threading,类型为-at')
        if (!(new RegExp('^\@' + agoraId).test(data))) {
            console.log('群组或threading,类型为-at,聊天内容不是-at')
            return
        }
    }
    handlerNewMessage(message, false)
    body = `You Have A New Message?sessionType=${sessionType}&sessionId=${from}`
    if (getLocalStorageData().previewText) {
        switch(msgType){
            case 'text':
                body = `${from}: ${data}`
                break
            case 'img':
                body = `${from}: A Image Message?sessionType=${sessionType}&sessionId=${from}`
                break
            case 'file':
                body = `${from}: A File Message?sessionType=${sessionType}&sessionId=${from}`
                break
            case 'audio':
                body = `${from}: A Audio Message?sessionType=${sessionType}&sessionId=${from}`
                break
            case 'video':
                body = `${from}: A Video Message?sessionType=${sessionType}&sessionId=${from}`
                break
            default:
                break
        }
        
    }

    if (getLocalStorageData().sound) {
        playSound()
    }
    console.log('通过', iconTitle)
    // tag: time + Math.random().toString(),
    notification({body, icon: url}, iconTitle)
    notifyMe({body, tag: time + Math.random().toString(), icon: url}, iconTitle)
}
function handlerNewMessage (message, realFlag) {
    const { type, from, to } = message
    const { unread, currentSessionId } = store.getState()
    console.log(unread, 'unread')
    let sessionType = ''
    switch (type) {
        case 'chat' || 'singleChat':
            sessionType = 'singleChat'
            break
        case 'groupchat' || 'groupChat':
            sessionType = 'groupChat'
            break
        case 'chatroom' || 'chatRoom':
            sessionType = 'chatRoom'
            break
        default:
            break
    }
    let id = ''
    if (sessionType === 'singleChat') {
        id = from
    } else {
        id = to
    }
    if (id === currentSessionId) {
        return
    }
    console.log(unread, 'top')
    if (!unread[sessionType][id]) {
        unread[sessionType][id] = {
            realNum: 0,
            fakeNum: 0
        }
    }
    console.log(unread, 'middle')
    const tempObj = {
        [sessionType]: {
            [id]: {
                realNum: realFlag ? ++unread[sessionType][id].realNum : unread[sessionType][id].realNum,
                fakeNum: !realFlag ? ++unread[sessionType][id].fakeNum : unread[sessionType][id].fakeNum,
            }
        }
    }
    console.log(tempObj, 'bottom', unread)
    store.dispatch(setUnread(tempObj))
}
const history = createHashHistory()
const initListen = () => {
    WebIM.conn.listen({
        onOpened: () => {
            getSilentModeForAll().finally(res => {
                getContacts();
                getGroups();
            })
            getPublicGroups();
            getBlackList()
            history.push('/main')
            store.dispatch(setFetchingStatus(false))
        },
        onClosed: () => {
            store.dispatch(setFetchingStatus(false))
            history.push('/login')
        },
        onError: (err) => {
            console.log('onError>>>', err);
        },
        onPresence: (event) => {
            console.log('onPresence>>>', event);
            const { type } = event;
            switch (type) {
                case 'subscribed':
                    getContacts();
                    break;
                case 'joinPublicGroupSuccess':
                    getGroups();
                    break;
                case 'invite': 
                    agreeInviteGroup(event)
                    // if (getLocalStorageData().sound) {
                    //     playSound()
                    // }
                    // notification({body: 'Have A Group Invite', tag: randomNumber()}, {title: 'agora chat'})
                    break;
                case 'removedFromGroup':
                    message.info(`${i18next.t('You have been removed from the group:')}` + event.gid)
                    break;
                default:
                    break;
            }
        },
        onContactInvited: (msg) => {
            console.log('onContactInvited', msg)
        },

        onTokenWillExpire: () => {
            // let { myUserInfo } = store.getState()
            // getToken(myUserInfo.agoraId, myUserInfo.nickName).then((res) => {
            //     const { accessToken } = res
            //     WebIM.conn.renewToken(accessToken)
            //     console.log('reset token success')
            // })
        },
        onPresenceStatusChange: function(message){
            let { myUserInfo, presenceList } = store.getState()
            console.log('onPresenceStatusChange', message, myUserInfo.agoraId, myUserInfo.nickName)
            message.forEach(item => {
                if(myUserInfo.agoraId !== item.userId){
                    presenceList = JSON.parse(JSON.stringify(presenceList))
                    const tempArr = []
                    const obj = {}
                    let extFlag = false
                    item.statusDetails.forEach(val => {
                        if (val.status === 1) {
                            extFlag = true
                        }
                        obj[val.device] = val.status.toString()
                    })
                    if (!extFlag) {
                        item.ext = 'Offline'
                    }
                    tempArr.push({
                        expiry: item.expire,
                        ext: item.ext,
                        last_time: item.lastTime,
                        uid: item.userId,
                        status: obj
                    })
                    if (presenceList.findIndex(val => val.uid === item.userId) !== -1) {
                        presenceList.forEach(val => {
                            if (val.uid === item.userId) {
                                val.ext = item.ext
                            }
                        })
                    } else {
                        presenceList.contact(tempArr)
                    }
                    console.log(presenceList, 'onPresenceStatusChange=presenceList')
                    const newArr = presenceList
                    store.dispatch(setPresenceList(newArr))
                    EaseApp.changePresenceStatus({[item.userId]: {
                        ext: item.ext
                    }})
                }
                else{
                    store.dispatch(presenceStatusImg(item.ext))
                }
            })
        },
        onTextMessage: (message) => {
            console.log("onTextMessage==agora-chat", message);
            // handlerNewMessage(message)
            // publicNotify(message, 'text')
        },
        onFileMessage: (message) => {
            console.log("onFileMessage", message);
            // handlerNewMessage(message)
            // publicNotify(message, 'file')
        },
        onImageMessage: (message) => {
            console.log("onImageMessage", message);
            // handlerNewMessage(message)
            // publicNotify(message, 'img')
        },
    
        onAudioMessage: (message) => {
            console.log("onAudioMessage", message);
            // handlerNewMessage(message)
            // publicNotify(message, 'audio')
        },
        onVideoMessage: (message) => {
            console.log("onVideoMessage", message);
            // handlerNewMessage(message)
            // publicNotify(message, 'video')
        },
    })

    WebIM.conn.addEventHandler('REQUESTS', {
        onContactInvited: (msg) => {
            console.log('onContactInvited', msg)
            let { requests } = store.getState()
            let contactRequests = requests.contact
            let data = {
                name: msg.from,
                status: 'pedding',
                time: Date.now()
            }
            contactRequests.unshift(data)
            let newRequests = { ...requests, contact: contactRequests }
            store.dispatch(setRequests(newRequests))
            // if (getLocalStorageData().sound) {
            //     playSound()
            // }
            // notification({body: 'Have A New Friend Want To Be Your Friend', tag: randomNumber()}, {title: 'agora chat'})
        },
        onGroupChange: (msg) => {
            console.log('onGroupChange', msg)
            if (msg.type === 'joinGroupNotifications') {
                let { requests } = store.getState()
                let groupRequests = requests.group
                let data = {
                    name: msg.from,
                    groupId: msg.gid,
                    status: 'pedding',
                    time: Date.now()
                }
                let index = groupRequests.findIndex((value) => {
                    if (value.name === data.name && value.groupId === data.groupId){
                        return true
                    }
                })
                if (index > -1){
                    groupRequests[index] = data
                }else{
                    groupRequests.unshift(data)
                }
                // groupRequests.unshift(data)
                let newRequests = { ...requests, group: [...groupRequests] }
                store.dispatch(setRequests(newRequests))
            }else if (msg.type === "addMute") {
                getGroupMuted(msg.gid);
			}else if (msg.type ===  "removeMute") {
				getGroupMuted(msg.gid);
			}else if (msg.type === "addUserToGroupWhiteList") {
                getGroupWrite(msg.gid);
			}else if (msg.type === "rmUserFromGroupWhiteList") {
                getGroupWrite(msg.gid);
			}
            // checkBrowerNotifyStatus(false)
        }
    })

    WebIM.conn.addEventHandler('TOKENSTATUS', {
        onTokenWillExpire: (token) => {
            let { myUserInfo } = store.getState()
            getToken(myUserInfo.agoraId, myUserInfo.nickName).then((res) => {
                const { accessToken } = res
                WebIM.conn.renewToken(accessToken)
                const authData = sessionStorage.getItem('webim_auth')
                const webim_auth = authData && JSON.parse(authData)
                webim_auth.accessToken = accessToken
                sessionStorage.setItem('webim_auth', JSON.stringify(webim_auth))
            })
        },
        onTokenExpired: () => {
            console.error('onTokenExpired')
        },
        onConnected: () => {
            console.log('onConnected')
        },
        onDisconnected: () => {
            console.log('onDisconnected')
        }
    })
}

export default initListen;