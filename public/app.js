const input = document.getElementById("videoUrl");
const iframe = document.getElementById("player");
const result = document.getElementById("result");

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
  const videoUrl = input.value.trim();
  if (!videoUrl) return;

  result.innerHTML = "Creating GIF...";

  const res = await fetch("/convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoUrl }),
  });

  const data = await res.json();

  if (data.error) {
    result.innerHTML = " nonono " + data.error;
    return;
  }

  result.innerHTML = `
    <p>GIF created</p>
    <img src="${data.gifUrl}" />
  `;
};

function extractVideoId(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^\s&]+)/,
  );
  return match ? match[1] : null;
}
