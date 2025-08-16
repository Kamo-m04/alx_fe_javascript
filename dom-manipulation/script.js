// Load quotes from localStorage, or default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Do one thing every day that scares you.", category: "Inspiration" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Perseverance" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display a random quote (with filter applied)
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

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// Add a new quote
function addQuote() {
  const newQuoteInput = document.getElementById("newQuoteText");
  const newCategoryInput = document.getElementById("newCategory");

  const newQuote = newQuoteInput.value.trim();
  const newCategory = newCategoryInput.value.trim() || "General";

  if (newQuote) {
    quotes.push({ text: newQuote, category: newCategory });
    saveQuotes();
    populateCategories(); // update categories dynamically
    newQuoteInput.value = "";
    newCategoryInput.value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please enter a quote.");
  }
}

// Populate categories dynamically
function populateCategories() {
  const categorySelect = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];

  // Reset options
  categorySelect.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter && [...categorySelect.options].some(opt => opt.value === savedFilter)) {
    categorySelect.value = savedFilter;
  }
}

// Filter quotes based on category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
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

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuote").addEventListener("click", addQuote);
document.getElementById("exportJson").addEventListener("click", exportToJsonFile);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);

// On page load
window.onload = function() {
  populateCategories();

  // Restore last viewed quote if available
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const parsedQuote = JSON.parse(lastQuote);
    document.getElementById("quoteDisplay").textContent = `"${parsedQuote.text}" — ${parsedQuote.category}`;
  } else {
    showRandomQuote();
  }
};
