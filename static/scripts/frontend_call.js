// JavaScript for handling the Chat and Info sections

// Chat Section
const chatButton = document.getElementById('chatButton');
const chatSection = document.querySelector('.chat-section');
const closeChatButton = document.getElementById('closeChatButton');

let chatVisible = false;

// Toggle chat section visibility
chatButton.addEventListener('click', () => {
  chatVisible = !chatVisible;
  chatSection.style.transform = chatVisible
    ? 'translateX(0)'
    : 'translateX(100%)';
  chatButton.style.backgroundColor = chatVisible ? '#007bff' : '#8a8991e6';
});

// Close chat section
closeChatButton.addEventListener('click', () => {
  chatVisible = false;
  chatSection.style.transform = 'translateX(100%)';
  chatButton.style.backgroundColor = '#8a8991e6';
});
