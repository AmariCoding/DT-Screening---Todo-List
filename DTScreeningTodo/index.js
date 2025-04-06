/**
 * Todo List Application
 * This script handles the core functionality of the todo list:
 * - Adding new tasks
 * - Marking tasks as completed
 * - Removing tasks
 * - Managing the empty state display
 * - Toggling between light and dark mode
 * - Drag and drop reordering of tasks
 */

// DOM Element References
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const body = document.body;

// Drag state tracking variables
let draggedItem = null;

// Create dark mode toggle button dynamically
const darkModeToggle = document.createElement("button");
darkModeToggle.id = "dark-mode-toggle";
darkModeToggle.className = "mode-toggle";
darkModeToggle.innerHTML = "🌙"; // Moon emoji for dark mode
document.querySelector(".header").appendChild(darkModeToggle);

/**
 * Checks if the todo list is empty and shows/hides the empty state message accordingly
 * If the list has children (tasks), hide the empty state, otherwise show it
 */
function checkEmptyState() {
  emptyState.classList.toggle("hidden", list.children.length > 0);
}

/**
 * Toggles the application between light and dark mode
 * Updates UI elements and stores user preference
 */
function toggleDarkMode() {
  // Toggle dark mode class on body
  body.classList.toggle("dark-mode");

  // Update button icon based on current mode
  const isDarkMode = body.classList.contains("dark-mode");
  darkModeToggle.innerHTML = isDarkMode ? "☀️" : "🌙";

  // Save user preference to localStorage
  localStorage.setItem("darkMode", isDarkMode);
}

/**
 * Event handler for dark mode toggle button
 */
darkModeToggle.addEventListener("click", toggleDarkMode);

/**
 * Creates a new task element with all necessary event listeners
 * @param {string} taskText - The text for the new task
 * @returns {HTMLElement} - The fully constructed task element
 */
function createTaskElement(taskText) {
  // Create task container element with animation
  const taskEl = document.createElement("div");
  taskEl.className = "todo-item";

  // Add draggable attribute and drag event handlers
  taskEl.draggable = true;

  taskEl.addEventListener("dragstart", function (e) {
    draggedItem = taskEl;
    // Add a slight delay to allow the dragover effect to show properly
    setTimeout(() => {
      taskEl.classList.add("dragging");
    }, 0);
  });

  taskEl.addEventListener("dragend", function () {
    draggedItem = null;
    taskEl.classList.remove("dragging");
  });

  // Create task text element
  const span = document.createElement("span");
  span.textContent = taskText;

  // Add drag handle icon
  const dragHandle = document.createElement("span");
  dragHandle.className = "drag-handle";
  dragHandle.innerHTML = "⋮⋮"; // Vertical dots for drag handle
  dragHandle.title = "Drag to reorder";

  /**
   * Event handler for clicking on a task
   * Toggles the completed state (strike-through effect) with animation
   */
  span.addEventListener("click", () => {
    span.classList.toggle("completed");
  });

  // Create remove button
  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "×"; // Using × symbol for a cleaner look

  /**
   * Event handler for clicking the remove button
   * Removes the task from the list with fade-out animation
   */
  removeBtn.addEventListener("click", () => {
    // Add the 'removing' class to trigger the fade-out animation
    taskEl.classList.add("removing");

    // Wait for animation to complete before actually removing the element
    setTimeout(() => {
      taskEl.remove();
      checkEmptyState();
    }, 300); // Duration matches the CSS animation
  });

  // Build the task element
  taskEl.appendChild(dragHandle);
  taskEl.appendChild(span);
  taskEl.appendChild(removeBtn);

  return taskEl;
}

/**
 * Event handler for form submission
 * Creates and adds a new task to the todo list with animation
 */
form.addEventListener("submit", function (e) {
  // Prevent the default form submission behavior
  e.preventDefault();

  // Get and validate the input text
  const taskText = input.value.trim();
  if (taskText === "") return; // Don't add empty tasks

  // Create and add the new task element
  const taskEl = createTaskElement(taskText);
  list.appendChild(taskEl);

  // Clear the input field after adding task
  input.value = "";

  // Update the empty state view
  checkEmptyState();
});

/**
 * Event handlers for drag and drop functionality on the todo list
 */
list.addEventListener("dragover", function (e) {
  e.preventDefault(); // Allow dropping

  // Find the task element we're currently dragging over
  const afterElement = getDragAfterElement(list, e.clientY);
  const draggedElement = document.querySelector(".dragging");

  if (afterElement == null) {
    list.appendChild(draggedElement);
  } else {
    list.insertBefore(draggedElement, afterElement);
  }
});

/**
 * Finds the task element to insert the dragged element after
 * based on the cursor position
 *
 * @param {HTMLElement} container - The container element (todo list)
 * @param {number} y - The current vertical position of the cursor
 * @returns {HTMLElement|null} - The element to insert after, or null to append at the end
 */
function getDragAfterElement(container, y) {
  // Get all task elements that aren't currently being dragged
  const draggableElements = [
    ...container.querySelectorAll(".todo-item:not(.dragging)"),
  ];

  // Find the closest element below the cursor position
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      // If the offset is negative (above the midpoint) but greater than the current closest,
      // this is the new closest element
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

/**
 * Initialize the application when the DOM content is loaded
 */
window.addEventListener("DOMContentLoaded", () => {
  // Check and apply saved dark mode preference
  if (localStorage.getItem("darkMode") === "true") {
    body.classList.add("dark-mode");
    darkModeToggle.innerHTML = "☀️";
  }

  // Initialize empty state check
  checkEmptyState();
});
