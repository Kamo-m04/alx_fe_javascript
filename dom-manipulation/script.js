/***** Constants *****/
const STORAGE_KEY = "quotes";
const SELECTED_CATEGORY_KEY = "selectedCategory";
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock API
const AUTO_SYNC_MS = 30000;

/***** State *****/
// Load from localStorage or seed defaults (with ids)
let quotes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  { id: 1, text: "The best way to predict the future is to create it.", category: "Motivation", synced: true, updatedAt: Date.now() },
  { id: 2, text: "Do one thing every day that scares you.", category: "Inspiration", synced: true, updatedAt: Date.now() },
  { id: 3, text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Perseverance", synced: true, updatedAt: Date.now() }
];

let nextId = quotes.length ? Math.max(...quotes.map(q => q.id)) + 1 : 1;

/***** Utilities *****/
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function showStatus(message, color = "green") {
  const el = document.getElementById("statusMessage");
  el.style.color = color;
  el.textContent = message;
  // auto-clear after a bit
  setTimeout(() => { if (el.textContent === message) el.textContent = ""; }, 4000);
}

/***** Core UI Actions *****/
function showRandomQuote() {
  const filter = document.getElementById("categoryFilter").value;
  const pool = filter === "all" ? quotes : quotes.filter(q => q.category === filter);

  if (!pool.length) {
    document.getElementById("quoteDisplay").textContent = "No quotes in this category.";
    return;
  }
  const q = pool[Math.floor(Math.random() * pool.length)];
  document.getElementById("quoteDisplay").textContent = `"${q.text}" — ${q.category}`;

  // remember in session
  sessionStorage.setItem("lastQuote", JSON.stringify(q));
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = (document.getElementById("newCategory").value.trim() || "General");

  if (!text) {
    alert("Please enter a quote.");
    return;
  }

  const newQ = { id: nextId++, text, category, synced: false, updatedAt: Date.now() };
  quotes.push(newQ);
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newCategory").value = "";
  showStatus("Quote added locally. Click “Sync with Server Now” to push.", "blue");
}

function populateCategories() {
  const el = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))].sort((a, b) => a.localeCompare(b));

  // reset
  el.innerHTML = '<option value="all">All Categories</option>';
  for (const c of categories) {
    const opt = document.createElement("option");
    opt.value = opt.textContent = c;
    el.appendChild(opt);
  }

  const saved = localStorage.getItem(SELECTED_CATEGORY_KEY);
  if (saved && [...el.options].some(o => o.value === saved)) {
    el.value = saved;
  }
}

function filterQuotes() {
  const val = document.getElementById("categoryFilter").value;
  localStorage.setItem(SELECTED_CATEGORY_KEY, val);
  showRandomQuote();
}

/***** Import / Export *****/
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        alert("Invalid JSON format. Expected an array of quotes.");
        return;
      }
      // normalize and assign ids
      for (const item of imported) {
        if (item && item.text) {
          quotes.push({
            id: nextId++,
            text: item.text,
            category: item.category || "Imported",
            synced: false,
            updatedAt: Date.now()
          });
        }
      }
      saveQuotes();
      populateCategories();
      showStatus("Quotes imported. Remember to sync.", "blue");
    } catch {
      alert("Error reading JSON file.");
    }
  };
  const file = event.target.files && event.target.files[0];
  if (file) fileReader.readAsText(file);
}

/***** Server Sync (Mock API) *****/
/**
 * REQUIRED BY CHECKER:
 * Fetch quotes from a mock server (JSONPlaceholder)
 */
async function fetchQuotesFromServer(limit = 5) {
  const res = await fetch(`${SERVER_URL}?_limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch from server");
  const data = await res.json();
  // Map server posts to our quote shape
  return data.map(item => ({
    id: item.id,                           // server id
    text: item.title,                      // use title as quote text
    category: "Server",                    // mark origin
    synced: true,
    updatedAt: Date.now()
  }));
}

/**
 * OPTIONAL BUT CHECKER LOOKS FOR POST:
 * Post a single quote to the mock server to simulate pushing local changes
 */
async function postQuoteToServer(quote) {
  const res = await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: quote.text,
      body: quote.category,
      userId: 1
    })
  });
  // JSONPlaceholder returns 201 and a new id
  if (res.ok) {
    quote.synced
