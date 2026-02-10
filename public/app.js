const input = document.getElementById("videoUrl");
const iframe = document.getElementById("player");
const result = document.getElementById("result");
const startTimeInput = document.getElementById("startTime");

document.getElementById("loadVideo").onclick = () => {
  const url = input.value.trim();
  const videoId = extractVideoId(url);
  if (!videoId) {
    alert("Invalid YouTube URL");
    return;
  }
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
};

document.getElementById("convertGif").onclick = async () => {
  try {
    const videoUrl = input.value.trim();
    if (!videoUrl) return;

    const startTime = parseFloat(startTimeInput.value) || 0;
    const useSubtitles = document.getElementById("subtitleOption")?.value;
    const customText = document.getElementById("customText")?.value || "";

    result.innerHTML = "Creating GIF...";

    const formData = new FormData();
    formData.append("videoUrl", videoUrl);
    formData.append("startTime", startTime.toString());
    formData.append("useSubtitles", useSubtitles);

    if (useSubtitles === "custom") {
      formData.append("customSubtitleText", customText);
    }

    if (useSubtitles === "upload") {
      const fileInput = document.getElementById("subtitleFile");
      if (fileInput.files[0]) {
        formData.append("subtitleFile", fileInput.files[0]);
      }
    }

    const res = await fetch("/convert", {
      method: "POST",
      body: formData,
    });

    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      console.error("Failed to parse server response:", parseError);
      result.innerHTML = `<p>Server returned invalid response (Status: ${res.status})</p>`;
      return;
    }

    if (data.error) {
      console.error("Server error:", data.error);
      result.innerHTML = `<p>Error: ${data.error}</p>`;
      return;
    }

    result.innerHTML = `
  <p>GIF created${data.hasSubtitles ? " with subtitles" : ""}!</p>
  <img src="${data.gifUrl}" style="max-width: 100%;" />
  <p><a href="${data.gifUrl}" target="_blank">Open in new tab</a></p>
`;
  } catch (error) {
    console.error("Error creating GIF:", error);
    result.innerHTML = `<p>Failed to create GIF: ${error.message}</p>`;
  }
};

function extractVideoId(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^\s&]+)/,
  );
  return match ? match[1] : null;
}
