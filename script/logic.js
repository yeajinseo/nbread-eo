// logic.js
// 데이터 처리, 테이블 생성, 정산 계산

import { persons, items } from './app.js';

export function generateTable() {
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

export function distributeNumbers() {
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
  tableHTML += "<th>합계</th></tr>";

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

export function addPerson() {
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

export function addItem() {
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

export function updateList(listId, items) {
  var list = document.getElementById(listId);
  list.innerHTML = "";
  items.forEach(function (item, index) {
    var li = document.createElement("li");
    li.className = "nickname-li";
    var angel = document.createElement('span');
    angel.textContent = '👼🏻     ';
    li.appendChild(angel);
    var nameSpan = document.createElement('span');
    nameSpan.textContent = item.name;
    li.appendChild(nameSpan);
    var space = document.createTextNode('  ');
    li.appendChild(space);
    var delImg = document.createElement('img');
    delImg.src = 'https://cdn.glitch.global/332d8fa1-f99a-45b3-8787-25ed7ef4d642/icon_delete.png?v=1750428694694';
    delImg.alt = '삭제';
    delImg.className = 'delete-img';
    delImg.title = '삭제';
    delImg.onclick = function(e) {
      e.stopPropagation();
      if (confirm('닉네임을 삭제할까요?')) {
        deletePerson(index);
      }
    };
    li.appendChild(delImg);
    li.appendChild(space);
    // 닉네임 클릭 시 삭제 확인
    li.onclick = function(e) {
      if (e.target === delImg) return;
      if (confirm('닉네임을 삭제할까요?')) {
        deletePerson(index);
      }
    };
    list.appendChild(li);
  });
}

export function deletePerson(personIndex) {
  if (confirm("삭제할까요?")) {
    persons.splice(personIndex, 1);
    updateList("personList", persons);
  }
}

export function deleteItem(itemIndex) {
  if (confirm("삭제할까요?")) {
    items.splice(itemIndex, 1);
    updateList("itemList", items);
  }
} 