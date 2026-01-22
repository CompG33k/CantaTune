import YouTube from "react-youtube";

function extractVideoId(urlOrId) {
  // Accepts full URL or just the ID
  try {
    const url = new URL(urlOrId);
    if (url.hostname.includes("youtu.be")) return url.pathname.replace("/", "");
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    // Shorts: /shorts/{id}
    const parts = url.pathname.split("/").filter(Boolean);
    const shortsIdx = parts.indexOf("shorts");
    if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
  } catch {
    // not a URL, assume it's an ID
  }
  return urlOrId.trim();
}

export default function YouTubePlayer({ video, onReady, onStateChange }) {
  const videoId = extractVideoId(video);

  return (
    <YouTube
      videoId={videoId}
      opts={{
        width: "100%",
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1
        }
      }}
      onReady={onReady}
      onStateChange={onStateChange}
    />
  );
}