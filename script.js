document.addEventListener('DOMContentLoaded', () => {
  const currentDate = new Date();
  const todayDate = currentDate.toDateString();

  const savedDate = localStorage.getItem('savedDate');
  if (savedDate !== todayDate) {
    localStorage.clear(); // Clear all saved events
    localStorage.setItem('savedDate', todayDate); // Save today's date
  }

  document.getElementById('currentDay').innerText = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timeBlocks = document.querySelectorAll('.time-block');
  const currentHour = new Date().getHours();

  timeBlocks.forEach(block => {
    const hourText = block.querySelector('.hour').innerText.trim();
    const blockHour = parseHour(hourText);
    const input = block.querySelector('.event-input');
    const saveButton = block.querySelector('.save-btn');

    // Remove any previous classes
    block.classList.remove('past', 'present', 'future');

    if (blockHour < currentHour) {
      // Past
      block.classList.add('past');
      input.disabled = true;
      saveButton.disabled = true;
    } else {
      // Present or Future
      if (blockHour === currentHour) {
        block.classList.add('present');
      } else {
        block.classList.add('future');
      }

      const savedData = localStorage.getItem(hourText);
      if (savedData) {
        // If there's saved data, show Edit button, disable input
        input.value = savedData;
        input.disabled = true;
        saveButton.innerText = "Edit";
        saveButton.disabled = false;
      } else {
        // No saved data — input should be editable with Save button
        input.value = "";
        input.disabled = false;
        saveButton.innerText = "Save";
        saveButton.disabled = true; // Initially disable Save button until text is entered

        // Enable Save button only when there's text
        input.addEventListener('input', function () {
          saveButton.disabled = input.value.trim() === "";
        });
      }
    }

    block.classList.add('show'); // Reveal after loading

    // Save/Edit button logic
    saveButton.addEventListener('click', function() {
      if (saveButton.innerText === "Save") {
        if (input.value.trim() !== "") {
          localStorage.setItem(hourText, input.value);
          console.log(`Data saved for ${hourText}: ${input.value}`);
          input.disabled = true;
          saveButton.innerText = "Edit";
          saveButton.disabled = false;
        }
      } else if (saveButton.innerText === "Edit") {
        input.disabled = false;
        input.focus();
        saveButton.innerText = "Save";
        saveButton.disabled = input.value.trim() === ""; // Disable Save if input is empty

        // Handle auto-remove and disable Save if input is emptied
        input.addEventListener('input', function autoClearHandler() {
          if (input.value.trim() === "") {
            localStorage.removeItem(hourText);
            console.log(`Data cleared for ${hourText}`);
            saveButton.disabled = true; // Disable Save button
          } else {
            saveButton.disabled = false; // Enable Save button
          }
        }, { once: true });
      }
    });
  });
});

// Function to parse hour from "9:00 AM"/"3:00 PM" to 24-hour format
function parseHour(hourText) {
  const [time, modifier] = hourText.split(' '); // e.g. ["9:00", "AM"]
  let [hour, minute] = time.split(':').map(Number);

  if (modifier === 'PM' && hour !== 12) {
    hour += 12;
  } else if (modifier === 'AM' && hour === 12) {
    hour = 0;
  }

  return hour;
}
