// Rasa server endpoint
const rasaServerUrl = "http://localhost:5005/webhooks/rest/webhook"; // Replace with your Rasa server URL

// Regex to detect URLs
const urlRegex = /https?:\/\/[^\s]+/g;

// Function to replace URLs with clickable links
function replaceUrlsWithLinks(text) {
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}

// Function to style the name part (bold and green)
function styleNamePart(text) {
  // Replace "Mame (Mohammednur Hashim)" with styled HTML
  return text.replace(/Mame \(Mohammednur Hashim\)/g, (name) => {
    return `<strong style="color: green;">${name}</strong>`;
  });
}

// Function to send a message to Rasa
async function sendMessageToRasa(message) {
  try {
    const response = await fetch('http://localhost:5005/webhooks/rest/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: 'user', // Unique sender ID
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error communicating with Rasa:', error);
    throw error;
  }
}

// Function to append bot message gradually (word by word)
function appendBotMessageGradually(message) {
  const chatWindow = document.getElementById("chat-window");

  // Create bot message container
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", "bot-message");

  // Add bot icon
  const robotIcon = document.createElement("div");
  robotIcon.classList.add("robot-icon");
  robotIcon.innerHTML = `<img src="Asset/image/logo.jpg" alt="Bot" class="robot-image">`;
  messageElement.appendChild(robotIcon);

  // Create the text container
  const messageContent = document.createElement("span");
  messageElement.appendChild(messageContent);

  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll

  // Split message into words
  const words = message.split(" ");
  let index = 0;

  // Display words one by one with a delay
  const interval = setInterval(() => {
    if (index < words.length) {
      // Replace URLs with clickable links and style the name part
      const word = words[index];
      let formattedWord = word;

      if (urlRegex.test(word)) {
        formattedWord = replaceUrlsWithLinks(word); // Replace URLs with links
      }

      // Style the name part
      formattedWord = styleNamePart(formattedWord);

      // Append the formatted word
      messageContent.innerHTML += (index === 0 ? "" : " ") + formattedWord;
      chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll
      index++;
    } else {
      clearInterval(interval); // Stop when all words are displayed
    }
  }, 50); // Adjust the speed (50ms per word)
}

// Function to add user message to the chat window
function addUserMessage(message) {
  const chatWindow = document.getElementById("chat-window");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", "user-message");
  messageElement.textContent = message;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll
}

// Function to handle sending a message
async function handleSendMessage() {
  const userInput = document.getElementById("chat-input").value.trim();
  const cardContainer = document.getElementById("card-container");

  if (userInput === "") return; // Prevent sending empty messages

  addUserMessage(userInput); // Display user message
  document.getElementById("chat-input").value = ""; // Clear input box

  // Hide the card section after first message
  if (cardContainer) {
    cardContainer.style.display = "none";
  }

  try {
    const botResponses = await sendMessageToRasa(userInput);
    // Display all bot responses
    botResponses.forEach((response) => {
      appendBotMessageGradually(response.text); // Display bot response word by word
    });
  } catch (error) {
    console.error("Error communicating with Rasa:", error);
    appendBotMessageGradually("Sorry, something went wrong. Please try again.");
  }
}

// Handle send button click
document.getElementById("send-button").addEventListener("click", handleSendMessage);

// Handle Enter key press
document.getElementById("chat-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSendMessage();
  }
});

// Function to display the feedback popup
function provideFeedback() {
  const popup = document.getElementById("feedback-popup");
  popup.style.display = "flex"; // Show the popup when the button is clicked

  // Close the popup when the close button is clicked
  const closePopup = document.querySelector("#feedback-popup .close-popup");
  closePopup.addEventListener("click", () => {
    popup.style.display = "none"; // Hide the popup
  });

  // Close the popup when clicking outside the content
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none"; // Hide the popup
    }
  });

  // Handle star rating selection
  const stars = document.querySelectorAll("#feedback-popup .star");
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const value = star.getAttribute("data-value");
      stars.forEach((s) => s.classList.remove("active")); // Reset all stars
      for (let i = 0; i < value; i++) {
        stars[i].classList.add("active"); // Highlight selected stars
      }
    });
  });

  // Handle form submission
  const feedbackForm = document.getElementById("feedback-form");
  feedbackForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent form submission

    // Get feedback data
    const rating = document.querySelector("#feedback-popup .star.active")?.getAttribute("data-value") || 0;
    const comment = document.getElementById("feedback-comment").value;

    // Log feedback (you can send this to your backend)
    console.log("Feedback Received:", { rating, comment });

    // Show a thank you message
    alert("Thank you for your feedback!");

    // Close the popup
    popup.style.display = "none";
  });
}