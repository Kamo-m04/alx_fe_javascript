// Quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do not let what you cannot do interfere with what you can do.", category: "Inspiration" }
];

// Show a random quote
function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  display.innerHTML = "";

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  const p = document.createElement("p");
  p.textContent = `"${quote.text}"`;

  const span = document.createElement("span");
  span.textContent = ` — ${quote.category}`;
  span.style.fontStyle = "italic";

  display.appendChild(p);
  display.appendChild(span);
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });

    // Clear inputs
    textInput.value = "";
    categoryInput.value = "";

    // Show newly added quote
    const display = document.getElementById("quoteDisplay");
    display.innerHTML = "";

    const p = document.createElement("p");
    p.textContent = `"${text}"`;

    const span = document.createElement("span");
    span.textContent = ` — ${category}`;
    span.style.fontStyle = "italic";

    display.appendChild(p);
    display.appendChild(span);
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

// Show initial quote
showRandomQuote();
