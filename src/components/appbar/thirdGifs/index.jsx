/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { giphyAppKey } from '../../../utils/config'
import { GiphyFetch } from "@giphy/js-fetch-api";
import {
  Grid
} from "@giphy/react-components";
import { EaseApp } from 'luleiyu-agora-chat'

import search from '../../../assets/magnifying@2x.png'
import deleteImg from '../../../assets/delete@2x.png'
import giphyGif from '../../../assets/giphy.gif'

const giphyFetch = new GiphyFetch(giphyAppKey)
const useStyles = makeStyles((theme) => {
  return {
    emojiBox: {
      position: 'relative',
      height: '35px',
      cursor: 'pointer',
    },
    emojiImg: {
      width: '20px'
    },
    emojiList: {
      height: '332px',
      overflow: 'auto',
      padding: '10px',
      boxSizing: 'border-box',
    },
    operateBox: {

    },
    searchBox: {
      height: '36px',
      borderRadius: '18px',
      background: '#F5F5F5',
      color: '#A6A6A6',
      lineHeight: '36px',
      fontSize: '16px',
      textAlign: 'left',
      paddingLeft: '10px',
      marginBottom: '10px',
      cursor: 'pointer',
    },
    searchImg: {
      verticalAlign: 'middle',
      width: '16px',
      marginRight: '5px',
    },
    searchGifsBox: {
      height: '85vh',
      position: 'fixed',
      bottom: '80px',
      background: '#fff',
      zIndex: '999',
      borderRadius: '16px',
      boxShadow: '0px 4px 16px rgb(0 0 0 / 12%), 0px 4px 24px rgb(0 0 0 / 8%)',
    },
    searchInputBox: {
      height: '60px',
      width: '391px',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      background: '#F6F7F8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      borderBottom: '1px, solid #ccc',
    },
    inputItemBox: {
      position: 'relative',
    },
    imgStyle: {
      position: 'absolute',
      top: '12px',
      width: '16px',
    },
    leftImgBox: {
      left: '10px',
    },
    inputBox: {
      padding: '0 30px',
      width: '290px',
      border: '0 none',
      height: '36px',
      background: '#fff',
      borderRadius: '18px',
      outlineStyle: 'none',
      boxSizing: 'border-box',
      fontSize: '16px',
    },
    rightImgBox: {
      right: '10px',
      cursor: 'pointer',
    },
    cancelBtn: {
      color: '#005FFF',
      fontSize: '16px',
      width: '60px',
      height: '50px',
      lineHeight: '50px',
      cursor: 'pointer',
    },
    gifsBox: {
      height: 'calc(100% - 80px)',
      overflow: 'auto',
      color: '#979797',
      paddingLeft: '10px',
      textAlign: 'left',
    },
    titleStyle: {
      margin: '10px 0',
    },
    loadingBox: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      top: 50,
      background:'#fff',
      textAlign: 'center',
      borderRadius: '16px',
    },
    loadingImg: {
      width: '40px',
      paddingTop: '100px',
      margin: '0 auto',
    },
  }
})

function imgUrlToFile(e) {
  console.log(e)
  // return coverFile
	// var self = this;
	var imgLink = e.currentSrc;
  console.log(imgLink)
	var tempImage = new Image();
  console.log(tempImage)
	//如果图片url是网络url，要加下一句代码
  //跨域不可用
  tempImage.setAttribute('crossorigin', 'anonymous')
  tempImage.src = imgLink;
  console.log(tempImage)
	return new Promise((resolve,reject) => {
    tempImage.onload = function() {
      console.log(tempImage, 'onload')
      var base64 = getBase64Image(tempImage);
      // console.log(base64);
      var imgblob = base64toBlob(base64);
          //获取原文件名称
      var filename = getFileName(e.currentSrc);
      var coverFile = blobToFile(imgblob, filename);
      console.log(coverFile)
      const param = {
        target: {
          files: {
            ...coverFile,
            length: 1,
            item: () => coverFile
          }
        }
      }
      resolve(param)
    };
  })
}
function getBase64Image(img) {
    //通过canvas绘制图片转base64
	var canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0, img.width, img.height);
	// var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
  // console.log(ext, 'ext')
	var dataURL = canvas.toDataURL("image/gif");
  // console.log(dataURL, 'dataURL')
	return dataURL;
}
function base64toBlob(base64) {
    //base64转Blob
	let arr = base64.split(","),
	mime = arr[0].match(/:(.*?);/)[1],
	bstr = atob(arr[1]),
	n = bstr.length,
	u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
}
function blobToFile(blob, filename) {
  // var file = new File(blob, filename)
  // console.log(file)
  // const file = new window.File(
  //   [blob],
  //   filename,
  //   { type: 'image/gif' }
  // )

    //Blob转file对象
	// edge浏览器不支持new File对象，所以用以下方法兼容
	blob.lastModifiedDate = new Date();
	blob.name = filename;
  const url = window.URL.createObjectURL(blob);
  console.log(url)
	return blob;
}
function getFileName(url) {
	// 获取到文件名
	let pos = url.lastIndexOf("/"); // 查找最后一个/的位置
	return url.substring(pos + 1); // 截取最后一个/位置到字符长度，也就是截取文件名
}

function GridDemo({ searchValue, width, closeLoading }) {
  let fetchGifs = ''
  if (searchValue) {
    fetchGifs = (offset) => giphyFetch.search(searchValue, { offset, limit: 10 })
  } else {
    fetchGifs = (offset) => giphyFetch.trending({ offset, limit: 10 })
  }
  const onGifClick = (gif, e) => {
    e.preventDefault()
    console.log(gif, e, 'gif, e')
    const { images: { fixed_width_small: { url }}, type } = gif
    EaseApp.handleThirdEmoji({emoji_url: url, emoji_type: type})
    EaseApp.closeThirdEmoji()
  }
  const onGifSeen = () => {
    closeLoading()
  }
  return (
    <>
      <Grid
        fetchGifs={fetchGifs}
        width={width}
        columns={3}
        gutter={6}
        key={searchValue}
        onGifClick={onGifClick}
        onGifSeen={onGifSeen}
      />
      
    </>
  );
}

export default function thirdEmoji () {
  const classes = useStyles()
  const [searchInput, setSearchInput] = useState(false)
  const [values, setValues] = useState('')
  const inputRef = useRef(null)
  const [loading, setLoading] = useState(true)

  const handleChange = (e) => {
    const { value } = e.target
    setValues(value)
  }
  const clearInput = () => {
    inputRef.current.value = ''
    setValues('')
  }
  const closeLoading = () => {
    setLoading(false)
  }
  if (searchInput) {
    return (
      <div className={classes.searchGifsBox}>
        <div className={classes.searchInputBox}>
          <div className={classes.inputItemBox}>
            <img className={classes.leftImgBox + ' ' + classes.imgStyle} src={search} alt="" />
            <input ref={inputRef} className={classes.inputBox} placeholder='Search GIFs' onChange={handleChange} />
            <img className={classes.rightImgBox + ' ' + classes.imgStyle} src={deleteImg} alt="" onClick={clearInput} />
          </div>
          <div className={classes.cancelBtn} onClick={() => setSearchInput(false)}>Cancel</div>
        </div>
        <div className={classes.gifsBox}>
          <div className={classes.titleStyle}>Trending GIFs</div>
          {
            <GridDemo searchValue={values} width={370} closeLoading={closeLoading} />
          }
        </div>
        {
          loading ?
          <div className={classes.loadingBox}>
            <img className={classes.loadingImg} src={giphyGif} alt="loading" />
          </div>
          : null
        }
      </div>
    )
  } else {
    return (
      <div className={classes.emojiList}>
        <div className={classes.operateBox}>
          <div className={classes.searchBox} onClick={() => setSearchInput(true)}>
            <img className={classes.searchImg} src={search} alt="" />
            <span>Search GIFs</span>
          </div>
        </div>
        <GridDemo width={370} closeLoading={closeLoading} />
        {
          loading ?
          <div className={classes.loadingBox}>
            <img className={classes.loadingImg} src={giphyGif} alt="loading" />
          </div>
          : null
        }
      </div>
    )
  }
}