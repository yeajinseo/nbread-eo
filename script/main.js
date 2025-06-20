let pageState = 0;

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
  updateNextBtnState();
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
      if (e.target === delImg) return; // 아이콘 클릭은 위에서 처리
      if (confirm('닉네임을 삭제할까요?')) {
        deletePerson(index);
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

// 상단 도움말/챗봇 버튼 및 모달 동작
window.addEventListener('DOMContentLoaded', function() {
  const helpBtn = document.getElementById('helpBtn');
  const navBackBtn = document.getElementById('navBackBtn');
  const helpModal = document.getElementById('helpModal');
  const helpIframe = document.getElementById('helpIframe');
  const closeHelpModal = document.getElementById('closeHelpModal');
  const nextBtn = document.getElementById('nextBtn');
  const itemNextBtn = document.getElementById('itemNextBtn');
  const secondNextBtn = document.getElementById('secondNextBtn');
  const firstPage = document.getElementById('firstPage');
  const itemPage = document.getElementById('itemPage');
  const secondPage = document.getElementById('secondPage');
  const firstInputRow = document.getElementById('firstInputRow');
  const itemInputRow = document.getElementById('itemInputRow');
  const selectTableContainer = document.getElementById('selectTableContainer');
  const itemList = document.getElementById('itemList');
  const resultPage = document.getElementById('resultPage');
  const shareImageBtn = document.getElementById('shareImageBtn');
  const shareUrlBtn = document.getElementById('shareUrlBtn');
  const resultTableContainer = document.getElementById('resultTableContainer');
  const resetBtn = document.getElementById('resetBtn');
  const addPersonBtn = document.getElementById('addPersonBtn');
  const addItemBtn = document.getElementById('addItemBtn');

  if (helpBtn && helpModal && helpIframe && closeHelpModal) {
    helpBtn.addEventListener('click', function() {
      helpIframe.src = 'https://observant-education-368.notion.site/2180954879668032a6b0c2d8501bf840?source=copy_link';
      helpModal.style.display = 'flex';
    });
    closeHelpModal.addEventListener('click', function() {
      helpModal.style.display = 'none';
      helpIframe.src = '';
    });
    helpModal.addEventListener('click', function(e) {
      if (e.target === helpModal) {
        helpModal.style.display = 'none';
        helpIframe.src = '';
      }
    });
  }
  if (
    navBackBtn && nextBtn && itemNextBtn && secondNextBtn &&
    firstPage && itemPage && secondPage && resultPage &&
    firstInputRow && itemInputRow && selectTableContainer && itemList &&
    shareImageBtn && shareUrlBtn && resultTableContainer && resetBtn &&
    addPersonBtn && addItemBtn
  ) {
    // 페이지 상태: 0=닉네임, 1=항목, 2=포함항목, 3=정산결과
    function showPage(state) {
      pageState = state;
      firstPage.style.display = state === 0 ? 'block' : 'none';
      itemPage.style.display = state === 1 ? 'block' : 'none';
      secondPage.style.display = state === 2 ? 'block' : 'none';
      resultPage.style.display = state === 3 ? 'block' : 'none';
      firstInputRow.style.display = state === 0 ? '' : 'none';
      itemInputRow.style.display = state === 1 ? '' : 'none';
      nextBtn.style.display = state === 0 ? '' : 'none';
      itemNextBtn.style.display = state === 1 ? '' : 'none';
      secondNextBtn.style.display = state === 2 ? '' : 'none';
      navBackBtn.textContent = state === 0 ? '네오스윙 챗봇' : '뒤로';
      if (state === 1) renderItemList();
      if (state === 2) renderSelectTable();
      if (state === 3) renderResultTable();
      updateNextBtnState();
    }
    navBackBtn.onclick = function() {
      if (pageState === 0) {
        window.open('https://pf.kakao.com/_btRan', '_blank');
      } else if (pageState === 1) {
        showPage(0);
      } else if (pageState === 2) {
        showPage(1);
      } else if (pageState === 3) {
        showPage(2);
      }
    };
    nextBtn.onclick = function() {
      if (nextBtn.disabled) return;
      showPage(1);
    };
    itemNextBtn.onclick = function() {
      if (itemNextBtn.disabled) return;
      showPage(2);
    };
    secondNextBtn.onclick = function() { showPage(3); };
    // 공유 버튼 얼럿
    shareImageBtn.onclick = function() { alert('준비중입니다.'); };
    shareUrlBtn.onclick = function() { alert('준비중입니다.'); };
    // 처음으로 버튼
    resetBtn.onclick = function() { window.location.reload(); };
    // 항목 리스트 렌더링
    function renderItemList() {
      itemList.innerHTML = '';
      var total = 0;
      items.forEach(function(item, idx) {
        const li = document.createElement('li');
        li.className = 'item-row';
        // 💸 이모지 + 2칸 공백 + 항목명(가격)
        var money = document.createElement('span');
        money.textContent = '💸   ';
        li.appendChild(money);
        var priceVal = (typeof item.price === 'number' ? item.price : parseInt(item.price)||0);
        var nameSpan = document.createElement('span');
        nameSpan.textContent = item.name + ' (' + priceVal.toLocaleString() + '원)';
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
          if (confirm('항목을 삭제할까요?')) {
            deleteItem(idx);
          }
        };
        li.appendChild(delImg);
        li.appendChild(space);
        li.onclick = function(e) {
          if (e.target === delImg) return;
          if (confirm('항목을 삭제할까요?')) {
            deleteItem(idx);
          }
        };
        itemList.appendChild(li);
        total += priceVal;
      });
      var totalLabel = document.getElementById('totalPriceLabel');
      if (totalLabel) {
        totalLabel.textContent = '전체 금액: ' + total.toLocaleString() + '원';
      }
      updateNextBtnState();
    }
    // 정산 결과 표 렌더링
    function renderResultTable() {
      if (!resultTableContainer) return;
      // --- distributeNumbers 계산/표 렌더링 로직 복원 ---
      var totalNumbers = new Array(items.length).fill(0);
      items.forEach(item => { item.selectedCount = 0; });
      persons.forEach(person => {
        (person.selectedItems||[]).forEach(itemIndex => {
          items[itemIndex].selectedCount = (items[itemIndex].selectedCount || 0) + 1;
        });
      });
      persons.forEach(person => {
        (person.selectedItems||[]).forEach(itemIndex => {
          var currentItem = items[itemIndex];
          var price = currentItem.price !== undefined ? currentItem.price : currentItem.number;
          var count = currentItem.selectedCount || 1;
          var val = Math.round(price / count);
          person[currentItem.name] = val;
          totalNumbers[itemIndex] += val;
        });
      });
      var tableHTML = "<table>";
      tableHTML += "<tr><th>닉네임</th>";
      for (var i = 0; i < items.length; i++) {
        tableHTML += "<th>" + items[i].name + "</th>";
      }
      tableHTML += "<th>정산금</th></tr>";
      var grandTotal = 0;
      for (var i = 0; i < persons.length; i++) {
        tableHTML += "<tr><td>" + persons[i].name + "</td>";
        var personsTotal = 0;
        for (var j = 0; j < items.length; j++) {
          var val = persons[i][items[j].name] || 0;
          tableHTML += "<td>" + val.toLocaleString() + "</td>";
          personsTotal += val;
        }
        tableHTML += "<td>" + personsTotal.toLocaleString() + "</td>";
        grandTotal += personsTotal;
        tableHTML += "</tr>";
      }
      tableHTML += "<tr><td></td>";
      for (var j = 0; j < items.length; j++) {
        tableHTML += "<td>" + totalNumbers[j].toLocaleString() + "</td>";
      }
      tableHTML += "<td>" + grandTotal.toLocaleString() + "</td></tr></table>";
      resultTableContainer.innerHTML = tableHTML;
      persons.forEach(person => {
        (person.selectedItems||[]).forEach(itemIndex => {
          items[itemIndex].selectedCount = 0;
          person[items[itemIndex].name] = 0;
        });
      });
    }
    // 닉네임/항목 추가/삭제 후 버튼 상태 갱신
    window.addPerson = function() {
      if (addPersonBtn && addPersonBtn.disabled) return;
      var input = document.getElementById('personInput');
      var value = input.value.trim();
      if (value) {
        persons.push({ name: value, selectedItems: [] });
        input.value = '';
        updateList('personList', persons);
        updateNextBtnState();
      }
    };
    window.deletePerson = function(personIndex) {
      persons.splice(personIndex, 1);
      updateList('personList', persons);
      updateNextBtnState();
    };
    window.addItem = function() {
      if (addItemBtn && addItemBtn.disabled) return;
      var nameInput = document.getElementById('itemInput');
      var priceInput = document.getElementById('itemNumber');
      var name = nameInput.value.trim();
      var price = parseInt(priceInput.value, 10);
      if (!name || isNaN(price) || price <= 0) return;
      var found = items.find(function(item) { return item.name === name; });
      if (found) {
        found.price = (typeof found.price === 'number' ? found.price : parseInt(found.price)||0) + price;
      } else {
        items.push({ name: name, price: price });
      }
      nameInput.value = '';
      priceInput.value = '';
      renderItemList();
      updateNextBtnState();
    };
    window.deleteItem = function(itemIndex) {
      items.splice(itemIndex, 1);
      renderItemList();
      updateNextBtnState();
    };
    // 항목/닉네임 입력 시 버튼 상태 갱신
    document.getElementById('personInput').addEventListener('input', updateNextBtnState);
    document.getElementById('itemInput').addEventListener('input', updateNextBtnState);
    document.getElementById('itemNumber').addEventListener('input', updateNextBtnState);
    // 페이지 진입 시 상태 갱신 (초기값 비활성화)
    nextBtn.disabled = true;
    itemNextBtn.disabled = true;
    // 페이지 진입 시 상태 갱신
    updateNextBtnState();
  }

  if (addPersonBtn) {
    addPersonBtn.addEventListener('click', function() {
      if (addPersonBtn.disabled) return;
      window.addPerson();
    });
  }
  if (addItemBtn) {
    addItemBtn.addEventListener('click', function() {
      if (addItemBtn.disabled) return;
      window.addItem();
    });
  }
});

// 두 번째 페이지 표 생성 함수
function renderSelectTable() {
  var selectTableContainer = document.getElementById('selectTableContainer');
  if (!selectTableContainer) return;
  // 기존 generateTable 함수 활용, 단 tableContainer가 아니라 selectTableContainer에 출력
  var tableHTML = "<table>";
  tableHTML += "<tr><th>닉네임</th>";
  for (var i = 0; i < items.length; i++) {
    tableHTML += "<th>" + items[i].name + "</th>";
  }
  tableHTML += "</tr>";
  for (var i = 0; i < persons.length; i++) {
    tableHTML += "<tr><td>" + persons[i].name + "</td>";
    for (var j = 0; j < items.length; j++) {
      tableHTML +=
        '<td><input type="checkbox" id="userItemCheck-' +
        i +
        "-" +
        j +
        '" ' +
        (persons[i].selectedItems && persons[i].selectedItems.includes(j) ? "checked" : "") +
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
  selectTableContainer.innerHTML = tableHTML;
}

function updateNextBtnState() {
  // 1페이지: 닉네임 1개 이상
  if (pageState === 0) {
    nextBtn.disabled = !(persons && persons.length > 0);
  }
  // 2페이지: 항목 1개 이상
  if (pageState === 1) {
    itemNextBtn.disabled = !(items && items.length > 0);
  }
}