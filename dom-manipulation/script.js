// Load quotes from localStorage, or default quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  "The best way to predict the future is to create it.",
  "Do one thing every day that scares you.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts."
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  document.getElementById("quoteDisplay").textContent = randomQuote;

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem("lastQuote", randomQuote);
}

// Add a new quote
function addQuote() {
  const newQuoteInput = document.getElementById("newQuoteText");
  const newQuote = newQuoteInput.value.trim();

  if (newQuote) {
    quotes.push(newQuote);
    saveQuotes();
    newQuoteInput.value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please enter a quote.");
  }
}

// Export quotes to JSON file
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

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
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

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuote").addEventListener("click", addQuote);
document.getElementById("exportJson").addEventListener("click", exportToJsonFile);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);

// Load last viewed quote from sessionStorage if available
window.onload = function() {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    document.getElementById("quoteDisplay").textContent = lastQuote;
  }
};
