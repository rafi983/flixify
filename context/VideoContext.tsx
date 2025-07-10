"use client";

import {
  createContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";
import { videoProps, videoData } from "@/utils/videoData";

export interface VideoContextInterface {
  videos: videoProps[]; // Update to an array of videoProps
  setVideos: Dispatch<SetStateAction<videoProps[]>>; // Update to work with the array
}

const defaultState: VideoContextInterface = {
  videos: videoData, // Make sure videoData is an array of videoProps
  setVideos: () => {},
};

export const VideoContext = createContext(defaultState);

type VideoProviderProps = {
  children: ReactNode;
};

// const getInitialState = () => {
//   const videos = sessionStorage.getItem("videos");
//   return videos ? JSON.parse(videos) : videoData; // Use videoData as the initial state
// };

export default function VideoProvider({ children }: VideoProviderProps) {
  const [videos, setVideos] = useState<videoProps[]>(videoData); // Update the type to an array of videoProps

  useEffect(() => {
    // On mount, fetch bookmarks from backend and sync videos state
    const syncBookmarks = async () => {
      try {
        const res = await fetch("/api/bookmark?type=all", { cache: "no-store" });
        if (!res.ok) return setVideos(videoData);
        const bookmarks = await res.json();
        const bookmarkedIds = bookmarks.map((b: { videoId: string }) => String(b.videoId));
        // Debug logs
        console.log('Fetched bookmarks from backend:', bookmarks);
        console.log('Bookmarked IDs:', bookmarkedIds);
        console.log('VideoData IDs:', videoData.map(v => v.id));
        setVideos(
          videoData.map((video) => ({
            ...video,
            isBookmarked: bookmarkedIds.includes(String(video.id)),
          }))
        );
      } catch (err) {
        setVideos(videoData);
      }
    };
    syncBookmarks();
  }, []);

  return (
    <VideoContext.Provider value={{ videos, setVideos }}>
      {children}
    </VideoContext.Provider>
  );
}
