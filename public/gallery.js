const grid = document.getElementById("grid");

let gifToDelete = null;

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
      <div class="gif-card" data-id="${gif._id}">
        <a href="/${gif.slug}" target="_blank">
          <img src="${gif.url}" alt="${gif.title}" loading="lazy" />
          <p>${gif.title}</p>
        </a>
        <div class="gif-actions">
          <button class="btn btn-delete" onclick="showDeleteModal('${gif._id}', '${gif.title.replace(/'/g, "\\'")}')">
            Delete
          </button>
        </div>
      </div>
    `,
      )
      .join("");
  } catch (err) {
    console.error("Error loading GIFs:", err);
    grid.innerHTML = `<p>Failed to load GIFs: ${err.message}</p>`;
  }
}

function showDeleteModal(gifId, gifTitle) {
  gifToDelete = gifId;
  document.getElementById("deleteModalText").textContent = 
    `Are you sure you want to delete "${gifTitle}"? This action cannot be undone.`;
  document.getElementById("deleteModal").classList.add("active");
}

function closeDeleteModal() {
  gifToDelete = null;
  document.getElementById("deleteModal").classList.remove("active");
}

async function confirmDelete() {
  if (!gifToDelete) return;

  try {
    const res = await fetch(`/gifs/${gifToDelete}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (data.success) {
      // Remove the card from DOM with fade-out effect
      const card = document.querySelector(`[data-id="${gifToDelete}"]`);
      if (card) {
        card.style.transition = "opacity 0.5s";
        card.style.opacity = "0";
        setTimeout(() => card.remove(), 300);
      }

      closeDeleteModal();

      console.log(`Deleted GIF: ${data.deletedGif.title} (ID: ${data.deletedGif.id})`);
    } else {
      alert(`Failed to delete GIF: ${data.error}`);
    }

  } catch (err) {
    console.error("Error deleting GIF:", err);
    alert("An error occurred while deleting the GIF. Please try again.");
  }
}

// Close modal when clicking outside of it
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("deleteModal");

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.id === "deleteModal") {
        closeDeleteModal();
      }
    });
  }
});

loadGifs();
