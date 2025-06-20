var persons = [];
var items = [];
var nicknamesData = null;

var personIcon = "💸";
var itemIcon = "👼🏻";

var firstGenTable = true;

// Load nicknames data when page loads
function initializeApp() {
  loadNicknamesData();
}

// Try multiple ways to ensure DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already loaded
  initializeApp();
}

// Fallback: also try when window loads
window.addEventListener('load', function() {
  if (!nicknamesData) {
    console.log('Retrying initialization on window load...');
    initializeApp();
  }
});

function loadNicknamesData() {
  fetch('data/nicknames.json')
    .then(response => response.json())
    .then(data => {
      nicknamesData = data;
      populateClassDropdown();
    })
    .catch(error => {
      console.error('Error loading nicknames:', error);
    });
}

function populateClassDropdown() {
  const classSelect = document.getElementById('classSelect');
  if (!classSelect) {
    console.error('classSelect element not found');
    return;
  }
  
  // 기존 옵션들을 모두 제거
  classSelect.innerHTML = '';
  
  if (nicknamesData && Array.isArray(nicknamesData)) {
    nicknamesData.forEach((classData, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = classData.name;
      classSelect.appendChild(option);
    });
    
    // 첫 번째 클래스를 기본으로 선택
    if (nicknamesData.length > 0) {
      classSelect.value = 0;
      loadClassNicknames();
    }
  }
}

function loadClassNicknames() {
  const classSelect = document.getElementById('classSelect');
  if (!classSelect) {
    console.error('classSelect element not found');
    return;
  }
  
  const selectedClassIndex = parseInt(classSelect.value);
  
  if (selectedClassIndex >= 0 && nicknamesData && Array.isArray(nicknamesData) && nicknamesData[selectedClassIndex]) {
    const classNicknames = nicknamesData[selectedClassIndex].nicknames;
    
    // Clear existing persons
    persons = [];
    
    // Add nicknames from selected class
    classNicknames.forEach(nickname => {
      persons.push({ name: nickname, selectedItems: [] });
    });
    
    updateList("personList", persons);
    const tableButton = document.getElementById("tableButton");
    if (tableButton) {
      tableButton.disabled = false;
    }
  } else {
    // 클래스가 선택되지 않은 경우 참여자 목록 비우기
    persons = [];
    updateList("personList", persons);
    const tableButton = document.getElementById("tableButton");
    if (tableButton) {
      tableButton.disabled = true;
    }
  }
}

/**************************************/

function generateTable() {
  // hide table
  document.getElementById("resultContainer").style.display = "none";

  // Create the table HTML
  var tableHTML = "<table>";
  // Header row
  tableHTML += "<tr><th>닉네임</th>";
  for (var i = 0; i < items.length; i++) {
    tableHTML += "<th>" + items[i].name + "</th>";
  }
  tableHTML += "</tr>";

  // Set selection
  if (firstGenTable) {
    for (var i = 0; i < persons.length; i++) {
      for (var j = 0; j < items.length; j++) {
        toggleSelection(i, j, true);
      }
    }
    firstGenTable = false;
  }

  // Data rows with checkboxes
  for (var i = 0; i < persons.length; i++) {
    tableHTML += "<tr><td>" + persons[i].name + "</td>";
    for (var j = 0; j < items.length; j++) {
      tableHTML +=
        '<td><input type="checkbox" id="userItemCheck-' +
        i +
        "-" +
        j +
        '" ' +
        (persons[i].selectedItems.includes(j) ? "checked" : "") +
        ' onclick="toggleSelection(' +
        i +
        "," +
        j +
        ',false)"/><label for="userItemCheck-' +
        i +
        "-" +
        j +
        '"></label></td>';
    }
    tableHTML += "</tr>";
  }

  tableHTML += "</table>";

  // Display the table
  var tableContainer = document.getElementById("tableContainer");
  tableContainer.style.display = "block";
  tableContainer.innerHTML = tableHTML;

  document.getElementById("resultButton").disabled = false;
}

function toggleSelection(personIndex, itemIndex, tableUpdate) {
  var index = persons[personIndex].selectedItems.indexOf(itemIndex);
  if (index === -1) {
    persons[personIndex].selectedItems.push(itemIndex);
  } else {
    persons[personIndex].selectedItems.splice(index, 1);
  }
  if (tableUpdate) {
    updateTable();
  }
}

function updateTable() {
  var tableContainer = document.getElementById("tableContainer");
  tableContainer.innerHTML = ""; // Clear previous table

  // Create the table HTML
  var tableHTML = "<table>";
  // Header row
  tableHTML += "<tr><th>닉네임</th>";
  for (var i = 0; i < items.length; i++) {
    tableHTML += "<th>" + items[i].name + "</th>";
  }
  tableHTML += "</tr>";

  // Data rows with checkboxes
  for (var i = 0; i < persons.length; i++) {
    tableHTML += "<tr><td>" + persons[i].name + "</td>";
    for (var j = 0; j < items.length; j++) {
      tableHTML +=
        '<td><input type="checkbox" id="userItemCheck-' +
        i +
        "-" +
        j +
        '" ' +
        (persons[i].selectedItems.includes(j) ? "checked" : "") +
        ' onclick="toggleSelection(' +
        i +
        "," +
        j +
        ',false)"/><label for="userItemCheck-' +
        i +
        "-" +
        j +
        '"></label></td>';
    }
    tableHTML += "</tr>";
  }

  tableHTML += "</table>";

  // Display the table
  tableContainer.innerHTML = tableHTML;
}

/**************************************/

function distributeNumbers() {
  console.log("items", items);
  console.log("person", persons);
  // hide table
  document.getElementById("tableContainer").style.display = "none";

  // Calculate the total number for each item
  var totalNumbers = new Array(items.length).fill(0);

  // Count the number of persons who selected each item
  for (var i = 0; i < persons.length; i++) {
    var selectedItems = persons[i].selectedItems;

    for (var j = 0; j < selectedItems.length; j++) {
      var itemIndex = selectedItems[j];
      items[itemIndex].selectedCount =
        (items[itemIndex].selectedCount || 0) + 1;
    }
  }

  // Distribute numbers to selected persons for each item
  for (var i = 0; i < persons.length; i++) {
    var selectedItems = persons[i].selectedItems;

    for (var j = 0; j < selectedItems.length; j++) {
      var itemIndex = selectedItems[j];
      var currentItem = items[itemIndex];

      persons[i][currentItem.name] = Math.round(
        currentItem.number / currentItem.selectedCount
      );
      totalNumbers[itemIndex] += Math.round(
        currentItem.number / currentItem.selectedCount
      );
    }
  }

  // Display the results
  var resultContainer = document.getElementById("resultContainer");
  var personsTotal = 0;
  var grandTotal = 0;
  // Create the table HTML
  var tableHTML = "<table>";
  // Header row
  tableHTML += "<tr><th>닉네임</th>";
  for (var i = 0; i < items.length; i++) {
    tableHTML += "<th>" + items[i].name + "</th>";
  }
  tableHTML += "<th>정산금</th></tr>";

  // Data rows with checkboxes
  for (var i = 0; i < persons.length; i++) {
    tableHTML += "<tr><td>" + persons[i].name + "</td>";
    personsTotal = 0;
    for (var j = 0; j < items.length; j++) {
      tableHTML += "<td>" + (persons[i][items[j].name] || 0) + "</td>";
      personsTotal += persons[i][items[j].name] || 0;
    }
    tableHTML += "<td>" + personsTotal + "</td>";
    grandTotal += personsTotal;
    tableHTML += "</tr>";
  }

  tableHTML += "<tr><td></td>";
  for (var j = 0; j < items.length; j++) {
    tableHTML += "<td>" + totalNumbers[j] + "</td>";
  }
  tableHTML += "<td>" + grandTotal + "</td></tr></table>";
  resultContainer.style.display = "block";
  resultContainer.innerHTML = tableHTML;

  // Reset persons and selectedCount for each item
  for (var i = 0; i < persons.length; i++) {
    var selectedItems = persons[i].selectedItems;
    for (var j = 0; j < selectedItems.length; j++) {
      var itemIndex = selectedItems[j];
      items[itemIndex].selectedCount = 0;
      persons[i][items[itemIndex].name] = 0;
    }
  }
}

// Reset persons and selectedCount for each item
for (var i = 0; i < persons.length; i++) {
  var selectedItems = persons[i].selectedItems;
  for (var j = 0; j < selectedItems.length; j++) {
    var itemIndex = selectedItems[j];
    items[itemIndex].selectedCount = 0;
    persons[i][items[itemIndex].name] = 0;
  }
}
/**************************************/

function addPerson() {
  var personInput = document.getElementById("personInput");
  var personName = personInput.value.trim();

  if (personName !== "") {
    // Check if person already exists
    var personExists = persons.some(function(person) {
      return person.name === personName;
    });
    
    if (personExists) {
      alert("이미 존재하는 닉네임입니다: " + personName);
      return;
    }
    
    persons.push({ name: personName, selectedItems: [] });
    updateList("personList", persons);
    personInput.value = "";
    document.getElementById("tableButton").disabled = false;
  }
}

function addItem() {
  var itemInput = document.getElementById("itemInput");
  var itemNumberInput = document.getElementById("itemNumber");
  var itemName = itemInput.value.trim();
  var itemNumber = parseInt(itemNumberInput.value);

  if (itemName !== "" && !isNaN(itemNumber) && itemNumber >= 1) {
    items.push({ name: itemName, number: itemNumber });
    updateList("itemList", items);
    itemInput.value = "";
    itemNumberInput.value = "";
    document.getElementById("tableButton").disabled = false;
  }
}

function updateList(listId, items) {
  var list = document.getElementById(listId);
  list.innerHTML = "";
  items.forEach(function (item, index) {
    var li = document.createElement("li");
    if (item.number) {
      li.textContent =
        personIcon + " " + item.name + " (" + item.number + "원)";
    } else {
      li.textContent = itemIcon + " " + item.name;
    }
    li.onclick = function () {
      if (listId === "personList") {
        deletePerson(index);
      } else if (listId === "itemList") {
        deleteItem(index);
      }
    };
    list.appendChild(li);
  });
}

function deletePerson(personIndex) {
  if (confirm("삭제할까요?")) {
    persons.splice(personIndex, 1);
    updateList("personList", persons);
  }
}

function deleteItem(itemIndex) {
  if (confirm("삭제할까요?")) {
    items.splice(itemIndex, 1);
    updateList("itemList", items);
  }
}

/**************************************/

function handleEnterKey(event, callback, elementId) {
  if (event.key === "Enter") {
    event.preventDefault();
    callback();
    document.getElementById(elementId).focus();
  }
}

function handleEnterOrTabKey(event, nextElementId) {
  if (event.key === "Enter" || event.key === "Tab") {
    event.preventDefault();
    document.getElementById(nextElementId).focus();
  }
}

// Immediate execution check
setTimeout(function() {
  if (!nicknamesData) {
    console.log('Delayed initialization...');
    initializeApp();
  }
}, 100);