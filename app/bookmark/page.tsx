"use client";

import SearchBar from "@/components/SearchBar";
import RegularCard from "../../components/RegularCard";
import { useContext, useEffect, useMemo, useState } from "react";
import { VideoContext, VideoContextInterface } from "@/context/VideoContext";
import { ModalContext, ModalContextInterface } from "@/context/ModalContext";
import { videoProps } from "@/utils/videoData";

export default function Home() {
  const { videos }: VideoContextInterface = useContext(VideoContext);
  const { setVideo }: ModalContextInterface = useContext(ModalContext);

  const [filter, setFilter] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(false);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/bookmark?type=all");
        if (!response.ok) {
          setError("Failed to fetch bookmarks");
          return;
        }
        const data = await response.json();
        setBookmarkedIds(data.map((bookmark: { videoId: string }) => bookmark.videoId));
      } catch (err) {
        setError("An error occurred while fetching bookmarks.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [refreshFlag]);

  // Refresh bookmarks when videos change (e.g., after unbookmarking from Trending)
  useEffect(() => {
    setRefreshFlag((prev) => !prev);
  }, [videos]);

  const bkMovies = useMemo(() => {
    return videos.filter(
      (video: videoProps) =>
        bookmarkedIds.includes(video.id) && video.category === "Movie"
    );
  }, [videos, bookmarkedIds]);

  const bkTvSeries = useMemo(() => {
    return videos.filter(
      (video: videoProps) =>
        bookmarkedIds.includes(video.id) && video.category === "TV Series"
    );
  }, [videos, bookmarkedIds]);

  const numberM = useMemo(() => bkMovies.length, [bkMovies]);
  const numberT = useMemo(() => bkTvSeries.length, [bkTvSeries]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <main className="pt-[72px] sm:pt-28 lg:pt-0 flex justify-center items-start w-full bg-[#E0E3EB] dark:bg-[#10141E]">
      <div className="w-[123px] h-[100vh] hidden lg:block"></div>
      <div className="lg:w-[87%] xl:w-[91%] w-[100%] flex flex-col justify-center items-center lg:mt-14">
        <SearchBar
          placeholder={"Search for bookmarked shows"}
          setFilter={setFilter}
        />
        {loading ? (
          <div className="text-center w-full py-10 text-gray-500">
            Loading bookmarks...
          </div>
        ) : error ? (
          <div className="text-center w-full py-10 text-red-500">{error}</div>
        ) : (
          <div className="flex flex-col items-start justify-center w-full gap-[16px] sm:gap-[25px] mt-[24px] mb-[12px] sm:mb-[24px] lg:mb-[20px] sm:mt-[34px] px-5">
            <h1 className="dark:text-white text-[#10141E] text-[20px] sm:text-[32px] font-light">
              {filter.toLowerCase() === ""
                ? "Bookmarked Movies"
                : `Found ${numberM} ${
                    numberM === 1 ? "result" : "results"
                  } for '${filter}' in Bookmarked Movies`}
            </h1>
            {!bkMovies.length ? (
              <p className="font-light text-[16px] sm:text-[24px] text-[#10141E]/70 dark:text-[#9CA3AF]">
                There are no bookmarked Movies.
              </p>
            ) : (
              <div className="grid w-[100%] grid-cols-2 grid-rows-1 place-content-center place-items-center gap-x-4 gap-y-4 sm:gap-x-[30px] sm:gap-y-6 lg:gap-x-10 lg:gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {bkMovies.map((video, index) => {
                  return (
                    <RegularCard
                      key={index}
                      id={video.id}
                      title={video.title}
                      thumbnail={video.thumbnail}
                      video={video.video}
                      year={video.year}
                      category={video.category}
                      rating={video.rating}
                      isBookmarked={video.isBookmarked}
                      isTrending={video.isTrending}
                      onClick={() => setVideo(video)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-start justify-center w-full gap-[16px] sm:gap-[25px] mt-[12px] mb-[61px] sm:mt-[24px] lg:mt-[20px] px-5">
          <h1 className="dark:text-white text-[#10141E] text-[20px] sm:text-[32px] font-light">
            {filter.toLowerCase() === ""
              ? "Bookmarked TV series"
              : `Found ${numberT} ${
                  numberT === 1 ? "result" : "results"
                } for '${filter}' in Bookmarked TV series`}
          </h1>
          {!bkTvSeries.length ? (
            <p className="font-light text-[16px] sm:text-[24px] text-[#10141E]/70 dark:text-[#9CA3AF]">
              There are no bookmarked TV Series.
            </p>
          ) : (
            <div className="grid w-[100%] grid-cols-2 grid-rows-1 place-content-center place-items-center gap-x-4 gap-y-4 sm:gap-x-[30px] sm:gap-y-6 lg:gap-x-10 lg:gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {bkTvSeries.map((video, index) => {
                return (
                  <RegularCard
                    key={index}
                    id={video.id}
                    title={video.title}
                    thumbnail={video.thumbnail}
                    video={video.video}
                    year={video.year}
                    category={video.category}
                    rating={video.rating}
                    isBookmarked={video.isBookmarked}
                    isTrending={video.isTrending}
                    onClick={() => setVideo(video)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
