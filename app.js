const todoForm = document.querySelector("form");
const todoInput = document.getElementById("todo-input");
const todoListUL = document.getElementById("todo-list");

// ===== LEVEL SYSTEM VARIABLES =====
const currentLevelEl = document.getElementById("current-level");
const questsCompletedEl = document.getElementById("quests-completed");
const questsNeededEl = document.getElementById("quests-needed");
const progressFillEl = document.getElementById("progress-fill");

const QUESTS_PER_LEVEL = 5; // Change this if you want more/fewer quests per level
let allTodos = getTodos();
let levelData = getLevelData(); // { level, questsCompleted }

updateTodoList();
updateLevelUI();
// =================================

todoForm.addEventListener("submit", function (e) {
  e.preventDefault();
  addTodo();
});

function addTodo() {
  const todoText = todoInput.value.trim();
  if (todoText.length > 0) {
    const todoObject = {
      text: todoText,
      completed: false,
    };

    allTodos.push(todoObject);
    updateTodoList();
    saveTodos();
    todoInput.value = "";
  }
}

function updateTodoList() {
  todoListUL.innerHTML = "";
  allTodos.forEach((todo, todoIndex) => {
    const todoItem = createTodoItem(todo, todoIndex);
    todoListUL.append(todoItem);
  });
}

function createTodoItem(todo, todoIndex) {
  const todoId = "todo-" + todoIndex;
  const todoLI = document.createElement("li");
  const todoText = todo.text;
  todoLI.className = "todo";
  todoLI.innerHTML = `
    <input type="checkbox" id="${todoId}" />
    <label class="custom-checkbox" for="${todoId}">
      <svg
        fill="transparent"
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#e3e3e3"
      >
        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
      </svg>
    </label>

    <label for="${todoId}" class="todo-text">${todoText}</label>
    <button class="delete-button">
      <svg
        fill="var(--secondary-color)"
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#e3e3e3"
      >
        <path
          d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
        />
      </svg>
    </button>
  `;

  const deleteButton = todoLI.querySelector(".delete-button");
  deleteButton.addEventListener("click", () => {
    deleteTodoItem(todoIndex);
  });

  const checkbox = todoLI.querySelector("input");
  checkbox.addEventListener("change", () => {
    allTodos[todoIndex].completed = checkbox.checked;
    saveTodos();

    if (checkbox.checked) {
      saveCompletedQuest(todo.text);
      playSound("quest-complete-sound");
      todoLI.classList.add("quest-complete");
      setTimeout(() => todoLI.classList.remove("quest-complete"), 1000);
    } else {
      removeCompletedQuest(todo.text);
    }

    updateLevelUI();
  });

  checkbox.checked = todo.completed;
  return todoLI;
}

function deleteTodoItem(todoIndex) {
  allTodos = allTodos.filter((_, i) => i !== todoIndex);
  saveTodos();
  updateTodoList();
}

function saveTodos() {
  const todosJson = JSON.stringify(allTodos);
  localStorage.setItem("todos", todosJson);
}

function getTodos() {
  const todos = localStorage.getItem("todos") || "[]";
  return JSON.parse(todos);
}

// ===== LEVEL SYSTEM FUNCTIONS =====
function getLevelData() {
  const savedData = localStorage.getItem("levelData");
  return savedData ? JSON.parse(savedData) : { level: 1, questsCompleted: 0 };
}

function saveLevelData() {
  localStorage.setItem("levelData", JSON.stringify(levelData));
}

function updateLevelUI() {
  const completedQuests = getCompletedQuests().length;
  const oldLevel = levelData.level;

  levelData.questsCompleted = completedQuests % QUESTS_PER_LEVEL;
  levelData.level = Math.floor(completedQuests / QUESTS_PER_LEVEL) + 1;

  // Update display
  currentLevelEl.textContent = levelData.level;
  questsCompletedEl.textContent = levelData.questsCompleted;
  questsNeededEl.textContent = QUESTS_PER_LEVEL;

  const progressPercent = (levelData.questsCompleted / QUESTS_PER_LEVEL) * 100;
  progressFillEl.style.width = `${progressPercent}%`;

  // Check if leveled up
  if (levelData.level > oldLevel) {
    handleLevelUp(oldLevel, levelData.level);
  }

  saveLevelData();
}

function handleLevelUp(oldLevel, newLevel) {
  showLevelUpModal(oldLevel, newLevel);
  playSound("level-up-sound");
}

function showLevelUpModal(oldLevel, newLevel) {
  const modal = document.getElementById("level-up-modal");
  const oldLevelEl = document.getElementById("old-level");
  const newLevelEl = document.getElementById("new-level");

  oldLevelEl.textContent = oldLevel;
  newLevelEl.textContent = newLevel;

  modal.style.display = "block";
  createSparkles();

  // Close handlers
  document.querySelector(".level-up-close").addEventListener("click", () => {
    modal.style.display = "none";
  });

  document.querySelector(".continue-button").addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

function createSparkles() {
  const container = document.getElementById("sparkle-container");
  container.innerHTML = "";

  const count = 30;

  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement("div");
    sparkle.classList.add("sparkle");

    const x = Math.random() * 100 - 50;
    const y = Math.random() * 100 - 50;
    const tx = Math.random() * 100 - 50;
    const ty = Math.random() * 100 - 50;

    sparkle.style.setProperty("--x", `${x}px`);
    sparkle.style.setProperty("--y", `${y}px`);
    sparkle.style.setProperty("--tx", `${tx}px`);
    sparkle.style.setProperty("--ty", `${ty}px`);
    sparkle.style.background = `hsl(${Math.random() * 60 + 270}, 100%, 70%)`;
    sparkle.style.animationDelay = `${Math.random() * 0.5}s`;

    container.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 1000);
  }
}

function playSound(id) {
  const sound = document.getElementById(id);
  sound.currentTime = 0;
  sound.play().catch((e) => console.log("Audio play failed:", e));
}

// ===== QUEST LOG SYSTEM =====
const questLogButton = document.getElementById("quest-log-button");
const questLogModal = document.getElementById("quest-log-modal");
const closeModal = document.querySelector(".close-modal");
const completedQuestsList = document.getElementById("completed-quests-list");

// Open modal
questLogButton.addEventListener("click", () => {
  updateCompletedQuestsList();
  questLogModal.style.display = "flex";
});

// Close modal
closeModal.addEventListener("click", () => {
  questLogModal.style.display = "none";
});

// Close if clicked outside modal
window.addEventListener("click", (e) => {
  if (e.target === questLogModal) {
    questLogModal.style.display = "none";
  }
});

// Track completed quests in localStorage
function getCompletedQuests() {
  const savedQuests = localStorage.getItem("completedQuests") || "[]";
  return JSON.parse(savedQuests);
}

function saveCompletedQuest(questText) {
  const completedQuests = getCompletedQuests();
  completedQuests.push({
    text: questText,
    completedAt: new Date().toLocaleString(),
  });
  localStorage.setItem("completedQuests", JSON.stringify(completedQuests));
}

function removeCompletedQuest(questText) {
  const completedQuests = getCompletedQuests();
  const index = completedQuests.map((q) => q.text).lastIndexOf(questText);
  if (index > -1) {
    completedQuests.splice(index, 1);
    localStorage.setItem("completedQuests", JSON.stringify(completedQuests));
  }
}

function updateCompletedQuestsList() {
  const completedQuests = getCompletedQuests();
  completedQuestsList.innerHTML = "";

  if (completedQuests.length === 0) {
    completedQuestsList.innerHTML = "<li>No quests completed yet!</li>";
    return;
  }

  // Group quests by level
  const questsByLevel = {};
  completedQuests.forEach((quest, index) => {
    const level = Math.floor(index / QUESTS_PER_LEVEL) + 1;
    if (!questsByLevel[level]) questsByLevel[level] = [];
    questsByLevel[level].push(quest);
  });

  // Create collapsible sections
  for (const level in questsByLevel) {
    const levelSection = document.createElement("div");
    levelSection.className = "level-section";

    // Level header (clickable)
    const levelHeader = document.createElement("h3");
    levelHeader.innerHTML = `
      <span class="toggle-icon">▶</span>
      Level ${level} (${questsByLevel[level].length}/${QUESTS_PER_LEVEL})
    `;
    levelHeader.classList.add("level-header");
    levelHeader.addEventListener("click", () => {
      levelHeader.classList.toggle("expanded");
      questList.style.display =
        questList.style.display === "none" ? "block" : "none";
      levelHeader.querySelector(".toggle-icon").textContent =
        questList.style.display === "none" ? "▶" : "▼";
    });

    // Quest list (hidden by default)
    const questList = document.createElement("ul");
    questList.style.display = "none";

    questsByLevel[level].forEach((quest, questIndex) => {
      const questItem = document.createElement("li");
      questItem.innerHTML = `
        <strong>${questIndex + 1}.</strong> ${quest.text}
        <small>(Completed: ${quest.completedAt})</small>
      `;
      questList.appendChild(questItem);
    });

    levelSection.appendChild(levelHeader);
    levelSection.appendChild(questList);
    completedQuestsList.appendChild(levelSection);
  }
  // Auto-expand the last level
  const lastLevel = Object.keys(questsByLevel).pop();
  if (lastLevel) {
    const lastHeader = completedQuestsList.querySelector(
      `.level-section:last-child .level-header`
    );
    lastHeader.click(); // Simulate click to expand
  }
}

// ===== BACKUP SYSTEM =====
const exportButton = document.getElementById("export-data");
const importButton = document.getElementById("import-data");
const importFileInput = document.getElementById("import-file");

// Export data (save as .json file)
exportButton.addEventListener("click", () => {
  const backupData = {
    todos: allTodos,
    levelData: levelData,
    completedQuests: getCompletedQuests(),
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `solo-leveling-backup-${new Date().toISOString()}.json`;
  a.click();

  URL.revokeObjectURL(url);
});

// Import data (load .json file)
importButton.addEventListener("click", () => {
  importFileInput.click();
});

importFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const backupData = JSON.parse(event.target.result);

      // Restore data
      allTodos = backupData.todos || [];
      levelData = backupData.levelData || { level: 1, questsCompleted: 0 };
      localStorage.setItem(
        "completedQuests",
        JSON.stringify(backupData.completedQuests || [])
      );

      saveTodos();
      saveLevelData();
      updateTodoList();
      updateLevelUI();

      alert("Data restored successfully! Reloading...");
      setTimeout(() => location.reload(), 1000);
    } catch (error) {
      alert("Invalid backup file! Please check the format.");
    }
  };
  reader.readAsText(file);
});
