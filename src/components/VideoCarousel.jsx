import React, { useEffect, useRef, useState } from "react";
import { hightlightsSlides } from "../constants";
import gsap from "gsap";
import { pauseImg, playImg, replayImg } from "../utils";
import { useGSAP } from "@gsap/react";

function VideoCarousel() {
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);

  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });

  const [loadedData, setLoadedData] = useState([]);

  /* easy to use of this information
      ex : 
        copy = video.isEnd
        copy = isEnd
  */
  const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;

  useGSAP(() => {
    //animation for video change
    gsap.to("#slider", {
      transform: `translateX(${-100 * videoId}%)`,
      duration: 1.5,
      ease: "power2.inOut",
    });

    gsap.to("#video", {
      // when the component are arrive in screen then animation will play
      scrollTrigger: {
        trigger: "#video",
        toggleAttribute: "restart none none none",
      },

      //on complete of animation it will play the video for first time
      onComplete: () => {
        setVideo((pre) => ({
          ...pre,
          startPlay: true,
          isPlaying: true,
        }));
      },
    });
  }, [isEnd, videoId]);

  // this useEffect play the video line by line
  useEffect(() => {
    // if all video was loaded then video will be play and pause
    if (loadedData.length > 3) {
      if (!isPlaying) {
        videoRef.current[videoId].pause();
      } else {
        startPlay && videoRef.current[videoId].play();
      }
    }
  }, [startPlay, videoId, isPlaying, loadedData]);

  // progress bar animation
  useEffect(() => {
    let currentProgress = 0;
    let span = videoSpanRef.current;

    if (span[videoId]) {
      // animate the progress of the video
      let anim = gsap.to(span[video], {
        onUpdate: () => {
          const progress = Math.ceil(anim.progress() * 100);

          if (progress != currentProgress) {
            currentProgress = progress;

            //expand the div of the video-span that are play
            gsap.to(videoDivRef.current[videoId], {
              width:
                window.innerWidth < 760
                  ? "10vW"
                  : window.innerWidth < 1200
                  ? "10vw"
                  : "4vW",
            });

            //animate the video progress bar
            gsap.to(span[videoId], {
              width: `${currentProgress}%`,
              backgroundColor: "white",
            });
          }
        },

        onComplete: () => {
          if (isPlaying) {
            gsap.to(videoDivRef.current[videoId], {
              width: "12px",
            });
            gsap.to(span[videoId], {
              backgroundColor: "#afafaf",
            });
          }
        },
      });
      if (videoId === 0) {
        anim.restart();
      }

      //update the video progress how much part was completed
      const animUpdate = () => {
        anim.progress(
          videoRef.current[videoId].currentTime /
            hightlightsSlides[videoId].videoDuration
        );
      };
      //add the animUpdate in gsap ticker for track the videoProgress with realtime
      if (isPlaying) {
        gsap.ticker.add(animUpdate);
      } else {
        gsap.ticker.remove(animUpdate);
      }
    }
  }, [videoId, startPlay]);

  const handleLoadedData = (index, e) => {
    setLoadedData((prev) => [...prev, e]);
  };

  /*
    handle the video state information base on click event on button 
      like:- start the video 
              next video
              repeat video
              play video 
              pause video
    */
  const handleProcess = (type, i) => {
    switch (type) {
      case "video-end":
        setVideo((pre) => ({
          ...pre,
          isEnd: true,
          videoId: i + 1,
        }));
        break;

      case "video-last":
        setVideo((pre) => ({
          ...pre,
          isLastVideo: true,
        }));
        break;

      case "video-reset":
        setVideo((pre) => ({
          ...pre,
          isLastVideo: false,
          videoId: 0,
        }));
        break;

      case "play":
        setVideo((pre) => ({
          ...pre,
          isPlaying: !pre.isPlaying,
        }));
        break;

      case "pause":
        setVideo((pre) => ({
          ...pre,
          isPlaying: !pre.isPlaying,
        }));
        break;

      default:
        return video;
    }
  };

  return (
    <>
      {/* videos container  */}
      <div className="flex items-center">
        {
          // videos render in a horizontal line
          hightlightsSlides.map((list, i) => (
            // video container
            <div key={list.id} id="slider" className="sm:pr-20 pr-10">
              {/* video outer layer */}
              <div className="video-carousel_container">
                <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                  {/* 
                  video property description
                    
                    1)playsInline  
                      -> By default, iOS Safari forces videos to play in full-screen mode when played on a mobile device. Using playsInline allows the video to play inline (within the webpage) instead of switching to full-screen.

                    2)preload
                     -> The preload attribute in the <video> tag is used to specify how (or if) the browser should load the video data before the user plays it.

                   */}
                  <video
                    id="video"
                    playsInline={true}
                    preload="auto"
                    muted
                    className={`${
                      list.id === 2 && "translate-x-44"
                    } pointer-events-none`}
                    //add the ref of the particular video in videoRef array
                    ref={(el) => (videoRef.current[i] = el)}
                    //define the which video are loaded in the browser
                    onLoadedMetadata={(e) => handleLoadedData(i, e)}
                    //update the video information when it start to play
                    onPlay={() => {
                      setVideo((pre) => ({
                        ...pre,
                        isPlaying: true,
                      }));
                    }}
                    onEnded={() => {
                      i != 3
                        ? handleProcess("video-end", i)
                        : handleProcess("video-last");
                    }}
                  >
                    <source src={list.video} type="video/mp4" />
                  </video>
                </div>

                {/* video description on the top of video */}
                <div className="absolute top-12 left-[5%] z-10">
                  {list.textLists.map((text) => (
                    <p key={text} className="md:text-2xl text-xl font-medium">
                      {text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* ui of the Progress bar */}
      <div className="relative flex-center mt-10">
        {/* container of video dots bar */}
        <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
          {videoRef.current.map((list, i) => (
            <span
              key={i}
              ref={(el) => (videoDivRef.current[i] = el)}
              className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
            >
              <span
                className="absolute h-full w-full rounded-full"
                ref={(el) => (videoSpanRef.current[i] = el)}
              />
            </span>
          ))}
        </div>
        {/* container of the play/pause and repeat */}
        <button className="control-btn">
          <img
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
            onClick={
              isLastVideo
                ? () => handleProcess("video-reset")
                : !isPlaying
                ? () => handleProcess("play")
                : () => handleProcess("pause")
            }
          />
        </button>
      </div>
    </>
  );
}

export default VideoCarousel;
