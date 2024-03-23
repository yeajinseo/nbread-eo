var persons = [];
var items = [];


function generateTable() {
  // Create the table HTML
  var tableHTML = '<table>';
  // Header row
  tableHTML += '<tr><th></th>';
  for (var i = 0; i < items.length; i++) {
	tableHTML += '<th>' + items[i].name + '</th>';
  }
  tableHTML += '</tr>';

  // Data rows with checkboxes
  for (var i = 0; i < persons.length; i++) {
	tableHTML += '<tr><td>' + persons[i].name + '</td>';
	for (var j = 0; j < items.length; j++) {
	  tableHTML += '<td><input type="checkbox" ' + (persons[i].selectedItems.includes(j) ? 'checked' : '') + ' onclick="toggleSelection(' + i + ',' + j + ')"></td>';
	}
	tableHTML += '</tr>';
  }

  tableHTML += '</table>';

  // Display the table
  var tableContainer = document.getElementById('tableContainer');
  tableContainer.innerHTML = tableHTML;
}

function toggleSelection(personIndex, itemIndex) {
  var index = persons[personIndex].selectedItems.indexOf(itemIndex);
  if (index === -1) {
	persons[personIndex].selectedItems.push(itemIndex);
  } else {
	persons[personIndex].selectedItems.splice(index, 1);
  }
  updateTable();
}

function updateTable() {
  var tableContainer = document.getElementById('tableContainer');
  tableContainer.innerHTML = ''; // Clear previous table

  // Create the table HTML
  var tableHTML = '<table>';
  // Header row
  tableHTML += '<tr><th></th>';
  for (var i = 0; i < items.length; i++) {
	tableHTML += '<th>' + items[i].name + '</th>';
  }
  tableHTML += '</tr>';

  // Data rows with checkboxes
  for (var i = 0; i < persons.length; i++) {
	tableHTML += '<tr><td>' + persons[i].name + '</td>';
	for (var j = 0; j < items.length; j++) {
	  tableHTML += '<td><input type="checkbox" ' + (persons[i].selectedItems.includes(j) ? 'checked' : '') + ' onclick="toggleSelection(' + i + ',' + j + ')"></td>';
	}
	tableHTML += '</tr>';
  }

  tableHTML += '</table>';

  // Display the table
  tableContainer.innerHTML = tableHTML;
}

function distributeNumbers() {
  // Check if result container already has content
  var resultContainer = document.getElementById('resultContainer');
  if (resultContainer.innerHTML.trim() !== '') {
	// If there are previous results, reset before calculating new results
	resultContainer.innerHTML = '';
  }

  // Calculate the total number for each item
  var totalNumbers = new Array(items.length).fill(0);

  // Count the number of persons who selected each item
  for (var i = 0; i < persons.length; i++) {
	var selectedItems = persons[i].selectedItems;

	for (var j = 0; j < selectedItems.length; j++) {
	  var itemIndex = selectedItems[j];
	  items[itemIndex].selectedCount = (items[itemIndex].selectedCount || 0) + 1;
	}
  }

  // Distribute numbers to selected persons for each item
  for (var i = 0; i < persons.length; i++) {
	var selectedItems = persons[i].selectedItems;

	for (var j = 0; j < selectedItems.length; j++) {
	  var itemIndex = selectedItems[j];
	  var currentItem = items[itemIndex];

	  persons[i][currentItem.name] = currentItem.number / currentItem.selectedCount;
	  totalNumbers[itemIndex] += currentItem.number / currentItem.selectedCount;
	}
  }

  // Display the results
  var resultContainer = document.getElementById('resultContainer');
  resultContainer.innerHTML = '<h2>Result:</h2>';
  resultContainer.innerHTML += '<ul>';
  for (var i = 0; i < persons.length; i++) {
	resultContainer.innerHTML += '<li>' + persons[i].name + ': ';
	for (var j = 0; j < items.length; j++) {
	  resultContainer.innerHTML += items[j].name + '=' + (persons[i][items[j].name] || 0) + ' ';
	}
	resultContainer.innerHTML += '</li>';
  }
  resultContainer.innerHTML += '</ul>';
  resultContainer.innerHTML += '<p>Total Numbers per Item: ' + totalNumbers.join(', ') + '</p>';
  
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

function addPerson() {
  var personInput = document.getElementById('personInput');
  var personName = personInput.value.trim();

  if (personName !== '') {
	persons.push({ name: personName, selectedItems: [] });
	updateList('personList', persons);
	personInput.value = '';
  }
}

function addItem() {
  var itemInput = document.getElementById('itemInput');
  var itemNumberInput = document.getElementById('itemNumber');
  var itemName = itemInput.value.trim();
  var itemNumber = parseInt(itemNumberInput.value);

  if (itemName !== '' && !isNaN(itemNumber) && itemNumber >= 1) {
	items.push({ name: itemName, number: itemNumber });
	updateList('itemList', items);
	itemInput.value = '';
	itemNumberInput.value = '';
  }
}

function updateList(listId, items) {
  var list = document.getElementById(listId);
  list.innerHTML = '';
  items.forEach(function (item, index) {
	var li = document.createElement('li');
	li.textContent = item.name + (item.number ? ' (Number: ' + item.number + ')' : '');
	var editButtons = item.number ? createItemEditButtons(index, listId) : createPersonEditButtons(index, listId);
	li.appendChild(editButtons);
	list.appendChild(li);
  });
}

function createItemEditButtons(index, listId) {
  var editButtonsDiv = document.createElement('div');
  editButtonsDiv.classList.add('edit-buttons');

  var editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.onclick = function () {
	editItem(index);
  };

  var deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.onclick = function () {
	deleteItem(index);
  };

  editButtonsDiv.appendChild(editButton);
  editButtonsDiv.appendChild(deleteButton);

  return editButtonsDiv;
}

function createPersonEditButtons(index, listId) {
  var editButtonsDiv = document.createElement('div');
  editButtonsDiv.classList.add('edit-buttons');

  var editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.onclick = function () {
	editPerson(index);
  };

  var deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.onclick = function () {
	deletePerson(index);
  };

  editButtonsDiv.appendChild(editButton);
  editButtonsDiv.appendChild(deleteButton);

  return editButtonsDiv;
}

function editPerson(personIndex) {
  var editedName = prompt('Edit Person Name:', persons[personIndex].name);
  if (editedName !== null) {
    persons[personIndex].name = editedName.trim();
    updateList('personList', persons);
  }
}

function deletePerson(personIndex) {
  if (confirm('Are you sure you want to delete this person?')) {
    persons.splice(personIndex, 1);
    updateList('personList', persons);
  }
}

function editItem(itemIndex) {
  var editedName = prompt('Edit Item Name:', items[itemIndex].name);
  if (editedName !== null) {
    var editedNumber = parseInt(prompt('Edit Item Number:', items[itemIndex].number));
    if (!isNaN(editedNumber) && editedNumber >= 1) {
      items[itemIndex].name = editedName.trim();
      items[itemIndex].number = editedNumber;
      updateList('itemList', items);
    }
  }
}

function deleteItem(itemIndex) {
  if (confirm('Are you sure you want to delete this item?')) {
    items.splice(itemIndex, 1);
    updateList('itemList', items);
  }
}

function handleEnterKey(event, callback) {
  if (event.key === 'Enter') {
    event.preventDefault();
    callback();
  }
}

function handleEnterOrTabKey(event, nextElementId) {
  if (event.key === 'Enter' || event.key === 'Tab') {
    event.preventDefault();
    document.getElementById(nextElementId).focus();
  }
}
