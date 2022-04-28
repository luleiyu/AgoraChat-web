
import WebIM from '../../utils/WebIM'
import store from '../../redux/store'
import { groupListAciton, searchLoadAction } from '../../redux/actions'
import { getSilentModeForConversations } from '../notificationPush/index'
const getGroups = () => {
    WebIM.conn.getGroup().then((res) => {
        console.log('getGroups>>>',res);
        const conversationList = []
        res.data.forEach(item => {
            conversationList.push({
                id: item.groupid,
                type: 'groupChat'
            })
        })
        getSilentModeForConversations({conversationList})
        store.dispatch(groupListAciton(res.data))
        store.dispatch(searchLoadAction(false))
    })
    WebIM.conn.getJoinedGroups({pageNum: 1, pageSize: 500}).then(res => {
        console.log('getJoinedGroups>>>',res);
    })
}

export default getGroups;
