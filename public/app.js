const input = document.getElementById("videoUrl");
const iframe = document.getElementById("player");
const result = document.getElementById("result");
const startTimeInput = document.getElementById("startTime");
//sanitize and validate inputs
function sanitizeString(str) {
  return str.replace(/[<>$`"'{};]/g, "").trim();
}

function isValidYoutubeUrl(url) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);
}

function isValidDuration(duration) {
  return !isNaN(duration) && duration >= 0 && duration <= 3600;
}

document.getElementById("loadVideo").onclick = () => {
  const url = sanitizeString(input.value);
  if (!isValidYoutubeUrl(url)) {
    alert("Invalid YouTube URL");
    return;
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    alert("Invalid YouTube URL");
    return;
  }
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
};

document.getElementById("convertGif").onclick = async () => {
  result.classList.remove("hidden");

  try {
    const videoUrl = sanitizeString(input.value);
    if (!videoUrl || !isValidYoutubeUrl(videoUrl)) {
      result.innerHTML = "<p>Please enter a valid YouTube video URL.</p>";
      return;
    }

    let gifTitle = document.getElementById("gifTitle").value || "my-gif";
    gifTitle = sanitizeString(gifTitle).slice(0, 50);

    let startTime = parseFloat(startTimeInput.value) || 0;
    if (!isValidDuration(startTime)) startTime = 0;

    const useSubtitles = sanitizeString(document.getElementById("subtitleOption")?.value || "none");
    let customText = sanitizeString(document.getElementById("customText")?.value || "").slice(0, 200);

    result.innerHTML = `
      <div class="loader-with-text">
        <div class="loader"></div>
        <div class="loader-text">Creating your GIF...</div>
      </div>
    `;

    const formData = new FormData();
    formData.append("videoUrl", videoUrl);
    formData.append("title", gifTitle);
    formData.append("startTime", startTime.toString());
    formData.append("useSubtitles", useSubtitles);

    if (useSubtitles === "custom" && customText) {
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

    // Check rate limit headers
    const remaining = res.headers.get("X-RateLimit-Remaining");
    const limit = res.headers.get("X-RateLimit-Limit");
    const reset = res.headers.get("X-RateLimit-Reset");

    console.log(`Rate limit: ${remaining}/${limit}, resets at ${new Date(parseInt(reset) * 1000)}`);

    // Handle rate limit error
    if (res.status === 429) {
      const errorData = await res.json().catch(() => ({ error: "Too many requests" }));

      let minutesLeft = "a few";
      if (reset) {
        const resetDate = new Date(parseInt(reset) * 1000);
        minutesLeft = Math.ceil((resetDate - Date.now()) / 60000);
      }

      result.innerHTML = `<p>${errorData.error}. Please try again in ${minutesLeft} minute(s).</p>`;
      return;
    }

    // Handle other HTTP errors
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Something went wrong. Please try again." }));
      result.innerHTML = `<p>${errorData.error}</p>`;
      return;
    }

    // Parse successful response
    const data = await res.json();

    if (data.error) {
      result.innerHTML = `<p>${data.error}</p>`;
      return;
    }

    result.innerHTML = `
      <p>GIF created${data.hasSubtitles ? " with subtitles" : ""}!</p>
      <img src="${data.gifUrl}"/>
      <p><a href="${data.shareUrl}" target="_blank">Open GIF in new tab</a></p>`;
      
  } catch (error) {
    console.error("Error creating GIF:", error);
    result.innerHTML = `<p>Failed to create GIF. Please try again.</p>`;
  }
};

function extractVideoId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^\s&]+)/);
  return match ? match[1] : null;
}