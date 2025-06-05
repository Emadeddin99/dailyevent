document.addEventListener('DOMContentLoaded', () => {
  console.log("Script is running!");

  const currentDate = new Date();
  const todayDate = currentDate.toDateString();

  const savedDate = localStorage.getItem('savedDate');
  if (savedDate !== todayDate) {
    localStorage.clear();
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
