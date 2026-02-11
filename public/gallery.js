const grid = document.getElementById("grid");

async function loadGifs() {
  try {
    const res = await fetch("/gifs");

    if (!res.ok) {
      throw new Error(`Failed to fetch GIFs (Status: ${res.status})`);
    }

    const json = await res.json();
    const gifs = json.data;

    if (!gifs || gifs.length === 0) {
      grid.innerHTML = "<p>No GIFs created yet</p>";
      return;
    }

    grid.innerHTML = gifs
      .map(
        (gif) => `
      <div class="gif-card">
        <a href="/${gif.slug}" target="_blank">
          <img src="${gif.url}" alt="${gif.title}" loading="lazy" />
          <p>${gif.title}</p>
        </a>
      </div>
    `,
      )
      .join("");
  } catch (err) {
    console.error("Error loading GIFs:", err);
    grid.innerHTML = `<p>Failed to load GIFs: ${err.message}</p>`;
  }
}

loadGifs();
