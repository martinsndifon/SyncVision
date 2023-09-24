// JavaScript for handling the Chat and Info sections

// Chat Section
const chatButton = document.getElementById('chatButton');
const chatSection = document.querySelector('.chat-section');
const closeChatButton = document.getElementById('closeChatButton');
const copyButton = document.getElementById('copy-button');
const closeInfoButton = document.getElementById('close-info-button');
const infoSection = document.getElementById('info-section');
const infoButton = document.getElementById('info-button');
const notice = document.getElementById('notice');
const messageBox = document.getElementById('chat-messages');
const messageInput = document.getElementById('messageInput');

// Toggle chat section visibility
chatButton.addEventListener('click', () => {
  messageInput.focus();
  messageBox.scrollTop = messageBox.scrollHeight - messageBox.clientHeight;
  if (!chatVisible && !notice.classList.contains('no_show')) {
    notice.classList.add('no_show');
  }
  chatVisible = !chatVisible;
  chatSection.style.transform = chatVisible
    ? 'translateX(0)'
    : 'translateX(100%)';
  chatButton.style.backgroundColor = chatVisible ? '#a35bcf' : '#960aee';
});

// Close chat section
closeChatButton.addEventListener('click', () => {
  chatVisible = false;
  chatSection.style.transform = 'translateX(100%)';
  chatButton.style.backgroundColor = '#960aee';
});

//close info section
closeInfoButton.addEventListener('click', () => {
  infoSection.classList.remove('show');
  infoSection.classList.add('hide');
});

infoButton.addEventListener('click', () => {
  if (infoSection.classList.contains('show')) {
    infoSection.classList.remove('show');
    infoSection.classList.add('hide');
  } else {
    infoSection.classList.remove('hide');
    infoSection.classList.add('show');
  }
});

function flashMessage(message) {
  const flashMessage = document.getElementById('flash-message');
  flashMessage.textContent = message;
  flashMessage.classList.add('show');

  setTimeout(() => {
    flashMessage.classList.remove('show');
  }, 1000);
}

const copy = () => {
  const copyText = document.getElementById('copy-text');
  const textArea = document.createElement('textarea');

  textArea.value = copyText.textContent;
  document.body.appendChild(textArea);
  textArea.select();

  navigator.clipboard.writeText(`syncvision.live/call/${textArea.value}`);
  document.body.removeChild(textArea);
  flashMessage('Copied to clipboard');
};

copyButton.addEventListener('click', copy);
