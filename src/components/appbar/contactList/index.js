import React, { useEffect, useState, memo } from 'react'
import CommonDialog from '../../common/dialog'
import { Box, ListItemAvatar, Avatar, ListItem, List } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
// import { EaseApp } from "agora-chat-uikit";
import { EaseApp } from "luleiyu-agora-chat";
import { useSelector } from 'react-redux'

import avatarIcon1 from '../../../assets/avatar1.png'
import avatarIcon2 from '../../../assets/avatar2.png'
import avatarIcon3 from '../../../assets/avatar3.png'

import offlineImg from '../../../assets/Offline.png'
import onlineIcon from '../../../assets/Online.png'
import busyIcon from '../../../assets/Busy.png'
import donotdisturbIcon from '../../../assets/Do_not_Disturb.png'
import customIcon from '../../../assets/custom.png'
import leaveIcon from '../../../assets/leave.png'

const useStyles = makeStyles((theme) => {
    return ({
        root: {
            width: theme.spacing(50),
            maxHeight: '70vh',
            minHeight: '35vh',
            margin: 0,
            padding: '15px 0',
            overflowX: 'hidden'
        },
        listItemContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            color: '#B3B3B3'
        },
        listLine: {
            borderTop: '1px solid #CCCCCC',
            width: '100%'
        },
        listItem: {
            height: theme.spacing(7.5),
            width: theme.spacing(50),
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
            padding: 0,
            color: '#0D0D0D'
        },
        itemBox: {
            height: '100%',
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            boxSizing: 'border-box',
            position: 'relative'
        },
        statusImg: {
            position: 'absolute',
            bottom: '10px',
            left: theme.spacing(3.2),
            zIndex: 1,
            width: '18px',
            height: '18px'
        },
        avatar: {
            height: theme.spacing(4.5),
            width: theme.spacing(4.5)
        },
        MuiListItemTextSecondary: {
            color: 'red'
        },
        textBox: {
            display: 'flex',
            justifyContent: 'space-between',
            flex: '1'
        },
        itemName: {
            fontSize: '16px',
            overflow: 'hidden',
        },
        serchContainer: {
            padding: '0 10px'
        },
        baseInput: {
            color: '#000000',
            width: theme.spacing(40),
            border: 'none',
            padding: '2px 10px',
            outline: 'none',
            fontSize: '18px'
        },
        baseInputLabel: {
            fontSize: '18px'
        }
    })
});

function AddressBookDialog(props) {
    const { open, onClose } = props
    const classes = useStyles();
    const constacts = useSelector((state) => state?.constacts) || []
    const presenceList = useSelector((state) => state?.presenceList) || []
    console.log(presenceList, 'presenceList=presenceList')
    const [userInfoObj, setUserInfoObj] = useState({})
    let userAvatars = {
        1: avatarIcon1,
        2: avatarIcon2,
        3: avatarIcon3
    }
    let getcontactsInfo = () => {
        let usersInfoData = JSON.parse(localStorage.getItem("usersInfo_1.0")) || []
        usersInfoData.length > 0 && usersInfoData.map((item) => {
            return setUserInfoObj(Object.assign(userInfoObj, { [item.username]: item.userAvatar }))
        })
    }   
    let contactsData = constacts.map((user) => {
        return {
            name: user,
            jid: user,
            avatar: userInfoObj[user] ? userInfoObj[user] : Math.ceil(Math.random() * 3)
        }
    })

    const [contactList, setContactList] = useState([])
    const handleClick = (itemData) => {
        // uikit
        console.log(itemData, 'itemData')
        let conversationItem = {
			conversationType: "singleChat",
			conversationId: itemData.name,
            ext: itemData?.presence?.ext,
		};
        EaseApp.addConversationItem(conversationItem);
        onClose()
    }

    const handleChange = (e) => {
        let serchValue = e.target.value

        let serchContact = contactsData.filter((user) => {
            if (user.name.includes(serchValue)) {
                return true
            }
            return false
        })
        let serchList = getBrands(serchContact)
        setContactList(serchList)
    }
    const statusImgObj = {
        'Offline': offlineImg,
        'Online': onlineIcon,
        'Busy': busyIcon,
        'Do not Disturb': donotdisturbIcon,
        'Leave': leaveIcon,
        '': onlineIcon
    }
    function renderContent() {
        return (
            <div className={classes.root}>
                <div className={classes.serchContainer}>
                    <label className={classes.baseInputLabel}>To:</label>
                    <input className={classes.baseInput} onChange={handleChange} />
                </div>
                <List dense >
                    {contactList.map((userGroup, index) => {
                        return (
                            < ListItem key={userGroup.id} className={classes.listItemContainer}>
                                <Typography>
                                    {userGroup.region}
                                </Typography>
                                <hr className={classes.listLine} />
                                {
                                    userGroup.brands.map((user) => {
                                        return (
                                            <ListItem key={user.name}
                                                onClick={() => handleClick(user)}
                                                data={user.name}
                                                value={user.name}
                                                button className={classes.listItem}>
                                                <Box className={classes.itemBox}>
                                                    <ListItemAvatar>
                                                        <Avatar
                                                            className={classes.avatar}
                                                            src={userAvatars[userInfoObj[user.name]]}
                                                            alt={`${user.name}`}
                                                        >
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    {/* <img className={classes.statusImg} alt="" src={statusImgObj[user?.presence?.ext] || customIcon} /> */}
                                                    <Box>
                                                        <Typography className={classes.itemName}>
                                                            {user.name}
                                                            {/* Next issue use nickname {byName[userId]?.info?.nickname || userId} */}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </ListItem>
                                        )
                                    })
                                }
                            </ListItem>

                        );
                    })
                    }

                </List >
            </div>
        )
    }

    function getBrands(members) {
        const reg = /[a-z]/i;
        members.forEach((item) => {
            if (reg.test(item.name.substring(0, 1))) {
                item.initial = item.name.substring(0, 1).toUpperCase();
            } else {
                item.initial = '#'
            }
        })

        members.sort((a, b) => a.initial.charCodeAt(0) - b.initial.charCodeAt(0))

        let someTtitle = null;
        let someArr = [];
        let lastObj
        for (var i = 0; i < members.length; i++) {
            var newBrands = { brandId: members[i].jid, name: members[i].name };

            if (members[i].initial === '#') {
                if (!lastObj) {
                    lastObj = {
                        id: i,
                        region: '#',
                        brands: []
                    };
                }
                lastObj.brands.push(newBrands);
            } else {
                if (members[i].initial !== someTtitle) {
                    someTtitle = members[i].initial
                    var newObj = {
                        id: i,
                        region: someTtitle,
                        brands: []
                    };
                    someArr.push(newObj)
                }
                newObj.brands.push(newBrands);
            }
        };
        someArr.sort((a, b) => a.region.charCodeAt(0) - b.region.charCodeAt(0))
        if (lastObj) { someArr.push(lastObj) }
        console.log(presenceList, 'presenceList=presenceList')
        someArr.forEach(item => {
            item.brands.forEach(val => {
                presenceList.length && presenceList.forEach(innerItem => {
                    if (val.name === innerItem.uid) {
                        val.presence = innerItem
                    }
                })
            })
        })
        return someArr
    }

    useEffect(() => {
        let list = getBrands(contactsData)
        setContactList(list)
        let infoData = []
        contactsData.length > 0 && contactsData.map((item) => {
            infoData.push({
                username: item.name,
                userAvatar: item.avatar
            })
        })
        if (infoData.length > 0) {
            localStorage.setItem("usersInfo_1.0", JSON.stringify(infoData))
        }
        getcontactsInfo()
        // // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [constacts.length, presenceList.length])

    return (
        <CommonDialog
            open={open}
            onClose={onClose}
            // title={i18next.t('Address Book')}
            content={renderContent()}
        ></CommonDialog>
    )
}

export default memo(AddressBookDialog)