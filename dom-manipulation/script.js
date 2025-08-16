// Load local quotes or defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: 1, text: "The best way to predict the future is to create it.", category: "Motivation" },
  { id: 2, text: "Do one thing every day that scares you.", category: "Inspiration" },
  { id: 3, text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Perseverance" }
];

let nextId = quotes.length ? Math.max(...quotes.map(q => q.id)) + 1 : 1;

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show status messages
function showStatus(message, color = "green") {
  const status = document.getElementById("statusMessage");
  status.style.color = color;
  status.textContent = message;
  setTimeout(() => { status.textContent = ""; }, 4000);
}

// Show random quote
function showRandomQuote() {
  const category = document.getElementById("categoryFilter").value;
  let filteredQuotes = category === "all" ? quotes : quotes.filter(q => q.category === category);

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  document.getElementById("quoteDisplay").textContent = `"${randomQuote.text}" — ${randomQuote.category}`;

  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// Add new quote
function addQuote() {
  const newQuoteInput = document.getElementById("newQuoteText");
  const newCategoryInput = document.getElementById("newCategory");

  const newQuote = newQuoteInput.value.trim();
  const newCategory = newCategoryInput.value.trim() || "General";

  if (newQuote) {
    quotes.push({ id: nextId++, text: newQuote, category: newCategory });
    saveQuotes();
    populateCategories();
    newQuoteInput.value = "";
    newCategoryInput.value = "";
    showStatus("Quote added locally. Sync to update server.");
  } else {
    alert("Please enter a quote.");
  }
}

// Populate categories
function populateCategories() {
  const categorySelect = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter && [...categorySelect.options].some(opt => opt.value === savedFilter)) {
    categorySelect.value = savedFilter;
  }
}

// Filter quotes
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// --- Server Sync Simulation ---

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Fake API

// Sync with server
async function syncWithServer() {
  try {
    // Fetch server quotes (simulate)
    let serverResponse = await fetch(SERVER_URL + "?_limit=5"); // limit to avoid overload
    let serverQuotes = await serverResponse.json();

    // Convert to our format
    serverQuotes = serverQuotes.map(item => ({
      id: item.id,
      text: item.title,
      category: "Server"
    }));

    // Conflict resolution: server wins
    let mergedQuotes = [...quotes];
    serverQuotes.forEach(sq => {
      const localIndex = mergedQuotes.findIndex(lq => lq.id === sq.id);
      if (localIndex > -1) {
        // Conflict -> server overwrites local
        mergedQuotes[localIndex] = sq;
        showStatus("Conflict resolved using server data.", "orange");
      } else {
        mergedQuotes.push(sq);
      }
    });

    quotes = mergedQuotes;
    saveQuotes();
    populateCategories();
    showStatus("Quotes synced successfully with server.");

    // Push new local quotes to server (simulate POST)
    for (let q of quotes) {
      if (q.id > 10000) continue; // avoid spamming fake server
      await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q)
      });
    }

  } catch (error) {
    showStatus("Error syncing with server.", "red");
    console.error(error);
  }
}

// Export JSON
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();

  URL.revokeObjectURL(url);
}

// Import JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes.map(q => ({ id: nextId++, ...q })));
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Expected an array of quotes.");
      }
    } catch (err) {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Event Listeners ---
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuote").addEventListener("click", addQuote);
document.getElementById("exportJson").addEventListener("click", exportToJsonFile);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);
document.getElementById("syncQuotes").addEventListener("click", syncWithServer);

// On page load
window.onload = function() {
  populateCategories();
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const parsedQuote = JSON.parse(lastQuote);
    document.getElementById("quoteDisplay").textContent = `"${parsedQuote.text}" — ${parsedQuote.category}`;
  } else {
    showRandomQuote();
  }

  // Auto-sync every 30s
  setInterval(syncWithServer, 30000);
};
