// JavaScript for handling the Chat and Info sections

// Chat Section
const chatButton = document.getElementById('chatButton');
const chatSection = document.querySelector('.chat-section');
const closeChatButton = document.getElementById('closeChatButton');
const copyButton = document.getElementById('copy-button');
const closeInfoButton = document.getElementById('close-info-button');
const infoSectionFrontend = document.getElementById('info-section');
const infoButton = document.getElementById('info-button');
const noticeFrontend = document.getElementById('notice');
const messageBoxScroll = document.getElementById('chat-messages');
const messageInputFocus = document.getElementById('messageInput');

// Toggle chat section visibility
chatButton.addEventListener('click', () => {
  messageBoxScroll.scrollTop =
  messageBoxScroll.scrollHeight - messageBoxScroll.clientHeight;
  if (!chatVisible && !noticeFrontend.classList.contains('no_show')) {
    noticeFrontend.classList.add('no_show');
  } else {
    messageInputFocus.focus();
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
  infoSectionFrontend.classList.remove('show');
  infoSectionFrontend.classList.add('hide');
});

infoButton.addEventListener('click', () => {
  if (infoSectionFrontend.classList.contains('show')) {
    infoSectionFrontend.classList.remove('show');
    infoSectionFrontend.classList.add('hide');
  } else {
    infoSectionFrontend.classList.remove('hide');
    infoSectionFrontend.classList.add('show');
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

  navigator.clipboard.writeText(
    `https://syncvision.martinsndifon.com/call/${textArea.value}`
  );
  document.body.removeChild(textArea);
  flashMessage('Copied to clipboard');
};

copyButton.addEventListener('click', copy);
