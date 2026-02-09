const grid = document.getElementById("grid");

async function loadGifs() {
  const res = await fetch("/gifs");

  if (!res.ok) {
    throw new Error(`Failed to fetch GIFs (${res.status})`);
  }

  const json = await res.json();
  const gifs = json.data;

  if (!gifs || gifs.length === 0) {
    grid.innerHTML = "<p>No GIFs created yet</p>";
    return;
  }

  grid.innerHTML = gifs.map(gif => `
    <div class="gif-card">
      <img src="${gif.url}" alt="${gif.title}" loading="lazy" />
      <p>${gif.title}</p>
    </div>
  `).join("");
}

loadGifs().catch(err => {
  console.error(err);
  grid.innerHTML = "<p class='error'>Failed to load GIFs</p>";
});
