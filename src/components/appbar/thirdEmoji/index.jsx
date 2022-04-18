/* eslint-disable react-hooks/rules-of-hooks */
import { useSelector } from 'react-redux'
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { GiphyFetch } from "@giphy/js-fetch-api";
import {
  Carousel,
  Gif,
  Grid,
  Video,
  VideoOverlay
} from "@giphy/react-components";
import { useAsync } from "react-async-hook";
import ResizeObserver from "react-resize-observer";
import { EaseApp } from 'luleiyu-agora-chat';

import emojiImg from '../../../assets/Online.png'

const giphyFetch = new GiphyFetch("7pD7KJWg5N7H65Mh9Xziijuf9f4NyRG2");
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
      width: '500px',
      height: '500px',
      position: 'absolute',
      bottom: '40px',
      left: '-450px',
      overflow: 'auto',
      background: '#ccc'
    }
  }
})

function GifDemo() {
  const [gif, setGif] = useState(null);
  const handlerSendEmoji = (e) => {
    console.log(e, 'handlerSendEmoji')
    e.preventDefault()
    EaseApp.handleThirdEmoji(e)
  }
  useAsync(async () => {
    const { data } = await giphyFetch.gif("fpXxIjftmkk9y");
    setGif(data);
  }, []);
  return gif && <div onClick={handlerSendEmoji}><Gif gif={gif} width={200} /></div>;
}

function VideoOverlayDemo() {
  const [gif, setGif] = useState(null);
  useAsync(async () => {
    // we know this is a video clip
    const { data } = await giphyFetch.gif("D068R9Ziv1iCjezKzG");
    setGif(data);
  }, []);
  return gif && <div><Gif gif={gif} width={200} overlay={VideoOverlay} /></div>;
}

function VideoDemo() {
  const [gif, setGif] = useState(null);
  useAsync(async () => {
    // we know this is a video clip
    const { data } = await giphyFetch.gif("D068R9Ziv1iCjezKzG");
    setGif(data);
  }, []);
  return gif && <Video gif={gif} width={200} muted />;
}

function CarouselDemo() {
  const fetchGifs = (offset) =>
    giphyFetch.search("dogs", { offset, limit: 10 });
  return <Carousel fetchGifs={fetchGifs} gifHeight={200} gutter={6} />;
}

function GridDemo({ onGifClick }) {
  const fetchGifs = (offset) =>
    giphyFetch.trending({ offset, limit: 10 });
  const [width, setWidth] = useState(window.innerWidth);
  return (
    <>
      <Grid
        onGifClick={onGifClick}
        fetchGifs={fetchGifs}
        width={width}
        columns={3}
        gutter={6}
      />
      <ResizeObserver
        onResize={({ width }) => {
          setWidth(width);
        }}
      />
    </>
  );
}

export default function thirdEmoji () {
  const classes = useStyles()
  const [useModalGif, setModalGif] = useState()
  const [showEmoji, setshowEmoji] = useState(false)
  const handlerEmoji = () => {
    setshowEmoji(!showEmoji)
  }
  return (
    <div className={classes.emojiBox}>
      <img src={emojiImg} className={classes.emojiImg} alt="Powered by GIPHY" onClick={handlerEmoji} />
      {
        showEmoji ?
        <div className={classes.emojiList}>
          <h4>Gif</h4>
          <GifDemo />
          <h4>Gif with Video Overlay</h4>
          <VideoOverlayDemo />
          <h4>Video (muted)</h4>
          <VideoDemo />
          <h4>Carousel</h4>
          <CarouselDemo />
          <h4>Grid</h4>
          <GridDemo
            onGifClick={(gif, e) => {
              console.log("gif", gif);
              e.preventDefault();
              setModalGif(gif);
            }}
          />
          {useModalGif && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "rgba(0, 0, 0, .8)"
              }}
              onClick={(e) => {
                e.preventDefault();
                setModalGif(undefined);
              }}
            >
              <Gif gif={useModalGif} width={200} />
            </div>
          )}
        </div>
        : null
      }
    </div>
  );
}