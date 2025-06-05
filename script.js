document.addEventListener('DOMContentLoaded', () => {
  console.log("Script is running!");

  const currentDate = new Date();
  const todayDate = currentDate.toDateString();

  const savedDate = localStorage.getItem('savedDate');
  if (savedDate !== todayDate) {
    // Clear only saved events (hour keys)
    Object.keys(localStorage).forEach(key => {
      if (key.includes(':')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem('savedDate', todayDate);
  }

  document.getElementById('currentDay').innerText = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timeBlocks = document.querySelectorAll('.time-block');
  const currentHour = currentDate.getHours();

  // 🔔 Ask for permission to send browser notifications
  const notificationAsked = localStorage.getItem('notificationAsked');
  if ('Notification' in window) {
    if (notificationAsked !== 'true' && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        console.log(`Notification permission: ${permission}`);
        localStorage.setItem('notificationAsked', 'true');
      });
    } else {
      console.log(`Notification permission previously handled: ${Notification.permission}`);
    }
  } else {
    console.log('Browser does not support Notifications API');
  }

  timeBlocks.forEach(block => {
    const hourText = block.querySelector('.hour').innerText.trim();
    const hour = parseHour(hourText);
    const input = block.querySelector('.event-input');
    const saveButton = block.querySelector('.save-btn');

    block.classList.remove('past', 'present', 'future');

    const savedData = localStorage.getItem(hourText);
    if (savedData) {
      input.value = savedData;
    } else {
      input.value = '';
    }

    if (hour < currentHour) {
      block.classList.add('past');
      input.disabled = true;
      saveButton.hidden = true;
    } else {
      if (hour === currentHour) {
        block.classList.add('present');
      } else {
        block.classList.add('future');
      }

      saveButton.hidden = false;
      input.disabled = false;

      if (savedData) {
        input.disabled = true;
        saveButton.innerText = 'Edit';
        saveButton.disabled = false;
      } else {
        input.disabled = false;
        saveButton.innerText = 'Save';
        saveButton.disabled = true;
      }

      input.addEventListener('input', () => {
        saveButton.disabled = input.value.trim() === '';
      });

      saveButton.addEventListener('click', () => {
        if (saveButton.innerText === 'Save') {
          const eventText = input.value.trim();
          if (eventText) {
            localStorage.setItem(hourText, eventText);
            input.disabled = true;
            saveButton.innerText = 'Edit';
            saveButton.disabled = false;
            showNotification(`Event saved for ${hourText}`);
          }
        } else if (saveButton.innerText === 'Edit') {
          input.disabled = false;
          input.focus();
          saveButton.innerText = 'Save';
          saveButton.disabled = input.value.trim() === '';

          input.addEventListener('input', function autoClearHandler() {
            if (input.value.trim() === '') {
              localStorage.removeItem(hourText);
              saveButton.disabled = true;
              showNotification(`Event cleared for ${hourText}`);
            } else {
              saveButton.disabled = false;
            }
          }, { once: true });
        }
      });
    }

    block.classList.add('show');
  });

  // 🔔 Periodic reminder check (every minute)
  setInterval(() => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    console.log(`Checking reminders at ${currentHour}:${currentMinute}`);

    timeBlocks.forEach(block => {
      const hourText = block.querySelector('.hour').innerText.trim();
      const hour = parseHour(hourText);
      const savedData = localStorage.getItem(hourText);

      if (savedData) {
        if (
          (currentHour === hour - 1 && currentMinute === 55) ||
          (currentHour === hour && currentMinute === 55)
        ) {
          console.log(`Sending notification for event at ${hourText}`);
          sendBrowserNotification(`Upcoming event at ${hourText}: "${savedData}"`);
        }
      }
    });
  }, 60000);
});

// Function to parse hour
function parseHour(hourText) {
  const [time, modifier] = hourText.split(' ');
  let [hour, minute] = time.split(':').map(Number);

  if (modifier === 'PM' && hour !== 12) {
    hour += 12;
  } else if (modifier === 'AM' && hour === 12) {
    hour = 0;
  }

  return hour;
}

function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.innerText = message;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

function sendBrowserNotification(message) {
  console.log('Trying to send browser notification...');
  if ('Notification' in window && Notification.permission === 'granted') {
    console.log('Permission granted! Sending notification...');
    new Notification('Reminder', {
      body: message,
      icon: 'icon.png' // optional icon, make sure it exists
    });
  } else {
    console.log('Notification permission not granted or not supported.');
  }
}
