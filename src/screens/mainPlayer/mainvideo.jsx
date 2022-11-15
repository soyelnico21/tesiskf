import React, { useCallback, useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video } from "remotion";
import CreditsVideo from "./creditsVideo";

function Mainvideo({ currentVideo, isLastVideoFinished }) {
  const video = useRef(null);
  const canvas = useRef(null);
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  // Process a frame
  const onVideoFrame = useCallback(() => {
    if (!canvas.current || !video.current) {
      return;
    }
    const context = canvas.current.getContext("2d");

    if (!context) {
      return;
    }

    context.drawImage(video.current, 0, 0, width, height);
    const imageFrame = context.getImageData(0, 0, width, height);
    const { length } = imageFrame.data;

    // If the pixel is very green, reduce the alpha channel
    for (let i = 0; i < length; i += 4) {
      const red = imageFrame.data[i + 0];
      const green = imageFrame.data[i + 1];
      const blue = imageFrame.data[i + 2];
      if (green < 5 && red < 5 && blue < 5) {
        imageFrame.data[i + 0] = 200;
        imageFrame.data[i + 1] = 100;
        imageFrame.data[i + 2] = 50;
      }
    }
    context.putImageData(imageFrame, 0, 0);
  }, [height, width]);

  useEffect(() => {
    if (currentVideo.greenScreen) {
      const { current } = video;
      if (!current || !current.requestVideoFrameCallback) {
        return;
      }
      let handle = 0;
      const callback = () => {
        onVideoFrame();
        handle = current.requestVideoFrameCallback(callback);
      };

      callback();

      return () => {
        current.cancelVideoFrameCallback(handle);
      };
    }
  }, [onVideoFrame, currentVideo]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isLastVideoFinished ? (
        <CreditsVideo />
      ) : (
        <>
          <AbsoluteFill
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Video
              src={currentVideo.url}
              ref={video}
              crossOrigin="anonymous"
              style={{
                boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
                flex: 1,
                opacity: currentVideo.greenScreen ? 0 : 1,
              }}
            />
          </AbsoluteFill>
          {currentVideo.greenScreen && (
            <AbsoluteFill
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <canvas ref={canvas} width={width} height={height} />
            </AbsoluteFill>
          )}
        </>
      )}
    </AbsoluteFill>
  );
}
export default Mainvideo;
