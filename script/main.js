let pageState = 0; // 0: 첫페이지, 1: 닉네임, 2: 포함항목, 3: 정산결과

var persons = [];
var items = [];
var nicknamesData = null;

var personIcon = "💸   ";
var itemIcon = "👼🏻   ";

var firstGenTable = true;

// 데이터 상태
let selectedClassIndex = null;

// 페이지 렌더링 진입점
function renderPage() {
  const container = document.getElementById('pageContainer');
  container.innerHTML = '';
  container.style.paddingBottom = '0px';
  container.style.minHeight = 'auto';
  container.style.boxSizing = 'border-box';
  container.style.position = 'relative';
  
  // 헤더 버튼 텍스트 업데이트
  updateHeaderButton();
  
  if (pageState === 0) renderFirstPage(container);
  else if (pageState === 1) renderSecondPage(container);
  else if (pageState === 2) renderThirdPage(container);
  else if (pageState === 3) renderResultPage(container);
}

// 헤더 버튼 업데이트 함수
function updateHeaderButton() {
  const navBackBtn = document.getElementById('navBackBtn');
  if (navBackBtn) {
    if (pageState === 0) {
      navBackBtn.textContent = '네오스윙 챗봇';
      navBackBtn.onclick = () => {
        window.open('https://pf.kakao.com/_btRan', '_blank');
      };
    } else {
      navBackBtn.textContent = '뒤로';
      navBackBtn.onclick = () => {
        if (pageState === 1) {
          pageState = 0;
        } else if (pageState === 2) {
          pageState = 1;
        } else if (pageState === 3) {
          pageState = 2;
        }
        renderPage();
      };
    }
  }
}

// 1. 첫 번째 페이지: 정산 시작
function renderFirstPage(container) {
  container.style.height = '100vh';

  // 화면 중앙 정렬을 위한 컨테이너 (오버레이 헤더 고려)
  const centerContainer = document.createElement('div');
  centerContainer.style.display = 'flex';
  centerContainer.style.flexDirection = 'column';
  centerContainer.style.justifyContent = 'center';
  centerContainer.style.alignItems = 'center';
  centerContainer.style.height = 'calc(100vh - 180px)'; /* 전체 화면 높이 사용 */
  centerContainer.style.overflow = 'hidden';
  centerContainer.style.position = 'relative';
  centerContainer.style.top = '0';
  centerContainer.style.left = '0';
  centerContainer.style.right = '0';
  centerContainer.style.zIndex = '50';
  centerContainer.style.padding = '0 24px'; /* 좌우 패딩 추가 */
  
  const label = document.createElement('div');
  label.className = 'first-guide';
  label.textContent = '정산을 시작합니다!';
  centerContainer.appendChild(label);
  
  // 두 버튼을 .next-btn 스타일, 100% width, 가운데 정렬
  const btnNew = document.createElement('button');
  btnNew.className = 'next-btn';
  btnNew.style.width = '100%';
  btnNew.style.margin = '24px auto 12px auto';
  btnNew.textContent = '새로 만들기';
  btnNew.onclick = () => { pageState = 1; renderPage(); };
  centerContainer.appendChild(btnNew);
  
  const btnLoad = document.createElement('button');
  btnLoad.className = 'next-btn';
  btnLoad.style.width = '100%';
  btnLoad.style.margin = '0 auto';
  btnLoad.textContent = '기존 정보 불러오기';
  btnLoad.onclick = () => { alert('아직 지원하지 않습니다.'); };
  centerContainer.appendChild(btnLoad);
  
  container.appendChild(centerContainer);
  
  // 하단 바 제거
  const prevBars = document.querySelectorAll('.bottom-bar');
  prevBars.forEach(bar => bar.remove());
}

// 2. 두 번째 페이지: 닉네임 추가
function renderSecondPage(container) {
  // 상단 안내문구 (여백 줄임)
  const label = document.createElement('div');
  label.className = 'first-guide';
  label.textContent = '함께한 사람들을 추가해주세요.';
  label.style.marginTop = '8px';
  container.appendChild(label);

  const subLabel = document.createElement('div');
  subLabel.className = 'first-sub-guide';
  subLabel.textContent = '강습 클래스를 선택하여 닉네임을 추가할 수 있습니다.';
  container.appendChild(subLabel);

  // 클래스 선택 드롭다운
  const classRow = document.createElement('div');
  classRow.className = 'class-selector-row';
  const classLabel = document.createElement('label');
  classLabel.className = 'class-label';
  classLabel.textContent = '클래스 선택';
  classLabel.setAttribute('for', 'classSelect');
  classRow.appendChild(classLabel);
  const classSelect = document.createElement('select');
  classSelect.id = 'classSelect';
  if (nicknamesData && Array.isArray(nicknamesData)) {
    nicknamesData.forEach((classData, idx) => {
      const option = document.createElement('option');
      option.value = idx;
      option.textContent = classData.name;
      classSelect.appendChild(option);
    });
    // 초기 로딩 시 첫 번째 클래스(지터벅)를 기본으로 선택하고 닉네임 로딩
    if (selectedClassIndex === null && nicknamesData.length > 0) {
      selectedClassIndex = 0;
      classSelect.value = 0;
      // 지터벅 닉네임들을 자동으로 로딩
      if (nicknamesData[0] && nicknamesData[0].nicknames) {
        persons = [];
        nicknamesData[0].nicknames.forEach(nick => {
          persons.push({ name: nick });
        });
      }
    } else if (selectedClassIndex !== null) {
      classSelect.value = selectedClassIndex;
    }
  }
  classSelect.onchange = function() {
    selectedClassIndex = parseInt(classSelect.value);
    persons = [];
    if (nicknamesData && nicknamesData[selectedClassIndex]) {
      nicknamesData[selectedClassIndex].nicknames.forEach(nick => {
        persons.push({ name: nick });
      });
    }
    renderPage();
  };
  classRow.appendChild(classSelect);
  container.appendChild(classRow);

  // 닉네임 리스트 (드롭다운과 여백 추가)
  const list = document.createElement('ul');
  list.className = 'nickname-list';
  list.style.marginTop = '16px';
  persons.forEach((p, idx) => {
    const li = document.createElement('li');
    li.className = 'nickname-li';
    // 👼🏻 이모지 추가
    const angel = document.createElement('span');
    angel.textContent = '👼🏻     ';
    li.appendChild(angel);
    const nameSpan = document.createElement('span');
    nameSpan.textContent = p.name;
    li.appendChild(nameSpan);
    // 삭제 버튼 (이미지 링크 수정)
    const delBtn = document.createElement('img');
    delBtn.src = 'https://cdn.glitch.global/332d8fa1-f99a-45b3-8787-25ed7ef4d642/icon_delete.png?v=1750428694694';
    delBtn.alt = '삭제';
    delBtn.className = 'delete-img';
    delBtn.style.height = '0.8em';
    delBtn.style.width = 'auto';
    delBtn.style.marginLeft = '0.5em';
    delBtn.style.verticalAlign = 'middle';
    delBtn.style.opacity = '0.7';
    delBtn.style.cursor = 'pointer';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm('닉네임을 삭제할까요?')) {
        persons.splice(idx, 1);
        renderPage();
      }
    };
    li.appendChild(delBtn);
    list.appendChild(li);
  });
  container.appendChild(list);

  // 하단 입력/버튼 바
  const bottomBar = document.createElement('div');
  bottomBar.className = 'bottom-bar';
  // 닉네임 입력/추가
  const inputRow = document.createElement('div');
  inputRow.className = 'nickname-input-row';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = '닉네임';
  inputRow.appendChild(input);
  const addBtn = document.createElement('button');
  addBtn.className = 'add-buttons';
  addBtn.textContent = '추가';
  addBtn.onclick = () => {
    if (input.value.trim()) {
      persons.push({ name: input.value.trim() });
      input.value = '';
      renderPage();
    }
  };
  inputRow.appendChild(addBtn);
  bottomBar.appendChild(inputRow);
  // 다음 버튼
  const nextBtn = document.createElement('button');
  nextBtn.className = 'next-btn';
  nextBtn.textContent = '다음';
  nextBtn.style.marginTop = '4px';
  nextBtn.style.width = '100%';
  nextBtn.disabled = persons.length === 0;
  nextBtn.onclick = () => { pageState = 2; renderPage(); };
  bottomBar.appendChild(nextBtn);
  document.body.appendChild(bottomBar);
  // 중복 bottom-bar 제거
  const prevBars = document.querySelectorAll('.bottom-bar');
  if (prevBars.length > 1) {
    for (let i = 0; i < prevBars.length - 1; i++) prevBars[i].remove();
  }
}

// 3. 세 번째 페이지: 포함항목 선택
function renderThirdPage(container) {
  // items 배열 초기화 (안주, 주류, 음료)
  if (items.length === 0) {
    items = [
      { name: '안주', price: 0 },
      { name: '주류', price: 0 },
      { name: '음료', price: 0 }
    ];
  }
  
  // 상단 안내문구 (여백 줄임)
  const label = document.createElement('div');
  label.className = 'first-guide';
  label.textContent = '포함할 항목을 추가해 주세요.';
  label.style.marginTop = '8px';
  container.appendChild(label);
  
  const subLabel = document.createElement('div');
  subLabel.className = 'first-sub-guide';
  subLabel.style.color = '#888';
  subLabel.style.fontSize = '0.7rem';
  subLabel.textContent = '✅ 포함합니다 | ❌ 포함하지 않습니다';
  container.appendChild(subLabel);

  // 금액 입력하기 버튼 (라벨과 표 사이)
  const btnInput = document.createElement('button');
  btnInput.className = 'next-btn';
  btnInput.textContent = '금액 입력하기';
  btnInput.style.width = '100%';
  btnInput.style.margin = '16px 0';
  btnInput.onclick = () => showPriceInputModal();
  container.appendChild(btnInput);

  // 표 스크롤 영역
  const scrollArea = document.createElement('div');
  scrollArea.className = 'table-scroll-area';
  scrollArea.style.background = '#fff';
  // 표: 닉네임 x 항목(안주, 주류, 음료)
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  const thName = document.createElement('th');
  thName.textContent = '닉네임';
  trHead.appendChild(thName);
  ['안주', '주류', '음료'].forEach(name => {
    const th = document.createElement('th');
    th.textContent = name;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  persons.forEach((p, pi) => {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.textContent = p.name;
    tdName.style.cursor = 'pointer'; // 닉네임 클릭 가능 표시
    tr.appendChild(tdName);
    if (!p.selected) p.selected = [true, true, true];
    
    // 이모지 배열 저장용
    const emojis = [];
    
    [0,1,2].forEach(ii => {
      const td = document.createElement('td');
      // ✅/❌ 이모지 토글
      const emoji = document.createElement('span');
      emoji.style.cursor = 'pointer';
      emoji.style.fontSize = '1.5em';
      emoji.textContent = p.selected[ii] ? '✅' : '❌';
      emoji.onclick = () => {
        p.selected[ii] = !p.selected[ii];
        emoji.textContent = p.selected[ii] ? '✅' : '❌';
      };
      td.appendChild(emoji);
      tr.appendChild(td);
      emojis.push(emoji);
    });
    
    // 닉네임 클릭 시 해당 행의 모든 이모지 토글 (로직 수정)
    tdName.onclick = () => {
      const allChecked = p.selected.every(selected => selected);
      if (allChecked) {
        // 모두 ✅면 모두 ❌로
        p.selected = [false, false, false];
        emojis.forEach(emoji => emoji.textContent = '❌');
      } else {
        // 하나라도 ❌면 모두 ✅로
        p.selected = [true, true, true];
        emojis.forEach(emoji => emoji.textContent = '✅');
      }
    };
    
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  scrollArea.appendChild(table);
  container.appendChild(scrollArea);

  // 하단 버튼 (표 밑으로 이동)
  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '12px';
  btnRow.style.margin = '24px 0 0 0';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'next-btn';
  saveBtn.textContent = '진행 상황 저장';
  saveBtn.style.width = '50%';
  saveBtn.onclick = () => { alert('아직 지원하지 않습니다.'); };
  btnRow.appendChild(saveBtn);
  const nextBtn = document.createElement('button');
  nextBtn.className = 'next-btn';
  nextBtn.textContent = '최종 정산';
  nextBtn.style.width = '50%';
  // 금액 입력 여부에 따라 버튼 활성화/비활성화
  const hasPriceInput = items.some(item => item.price && item.price > 0);
  nextBtn.disabled = !hasPriceInput;
  nextBtn.onclick = () => { pageState = 3; renderPage(); };
  btnRow.appendChild(nextBtn);
  container.appendChild(btnRow);

  // 하단 바 제거
  const prevBars = document.querySelectorAll('.bottom-bar');
  prevBars.forEach(bar => bar.remove());
}

// 금액 입력 모달
function showPriceInputModal() {
  let modal = document.getElementById('priceInputModal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'priceInputModal';
  modal.style.position = 'fixed';
  modal.style.left = '0';
  modal.style.top = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.35)';
  modal.style.zIndex = '2000';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';

  const content = document.createElement('div');
  content.style.background = '#fff';
  content.style.borderRadius = '12px';
  content.style.width = '90vw';
  content.style.maxWidth = '400px';
  content.style.padding = '50px 16px 24px 16px';
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.alignItems = 'center';
  content.style.position = 'relative';

  // 모달 버튼들
  const btnPhoto = document.createElement('button');
  btnPhoto.className = 'next-btn';
  btnPhoto.textContent = '영수증 사진 업로드';
  btnPhoto.style.width = '100%';
  btnPhoto.onclick = () => { alert('준비중입니다.'); };
  content.appendChild(btnPhoto);

  const btnManual = document.createElement('button');
  btnManual.className = 'next-btn';
  btnManual.textContent = '수동으로 금액 입력';
  btnManual.style.width = '100%';
  btnManual.style.marginTop = '12px';
  btnManual.onclick = () => showManualPriceInput(content, modal);
  content.appendChild(btnManual);

  // 닫기 버튼
  const closeBtn = document.createElement('span');
  closeBtn.textContent = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '0px';
  closeBtn.style.right = '12px';
  closeBtn.style.fontSize = '2.2rem';
  closeBtn.style.color = '#888';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = () => { modal.remove(); };
  content.appendChild(closeBtn);

  modal.appendChild(content);
  document.body.appendChild(modal);
}

function showManualPriceInput(content, modal) {
  content.innerHTML = '';
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  ['항목', '가격'].forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  ['안주', '주류', '음료'].forEach((name, idx) => {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.textContent = name;
    tr.appendChild(tdName);
    const tdInput = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'text';
    input.min = '0';
    input.value = items[idx]?.price ? items[idx].price.toLocaleString() : '';
    input.style.width = '80px';
    input.addEventListener('input', function(e) {
      let val = input.value.replace(/[^\d]/g, '');
      if (val) val = parseInt(val, 10).toLocaleString();
      input.value = val;
    });
    input.addEventListener('focus', function(e) {
      input.value = input.value.replace(/[^\d]/g, '');
    });
    input.addEventListener('blur', function(e) {
      let val = input.value.replace(/[^\d]/g, '');
      if (val) val = parseInt(val, 10).toLocaleString();
      input.value = val;
    });
    tdInput.appendChild(input);
    tr.appendChild(tdInput);
    tbody.appendChild(tr);
    tr.dataset.idx = idx;
    tr.input = input;
  });
  table.appendChild(tbody);
  content.appendChild(table);
  // 입력 버튼
  const btnEnter = document.createElement('button');
  btnEnter.className = 'next-btn';
  btnEnter.textContent = '입력';
  btnEnter.style.width = '100%';
  btnEnter.style.marginTop = '16px';
  btnEnter.onclick = () => {
    // 입력값 저장
    Array.from(tbody.children).forEach((tr, idx) => {
      let val = tr.input.value.replace(/[^\d]/g, '');
      val = parseInt(val, 10);
      if (!isNaN(val)) items[idx].price = val;
    });
    modal.remove();
    renderPage();
  };
  content.appendChild(btnEnter);
  // 닫기 버튼
  const closeBtn = document.createElement('span');
  closeBtn.textContent = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '0px';
  closeBtn.style.right = '12px';
  closeBtn.style.fontSize = '2.2rem';
  closeBtn.style.color = '#888';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = () => { modal.remove(); };
  content.appendChild(closeBtn);
  content.style.position = 'relative';
}

// 4. 네 번째 페이지: 정산 결과
function renderResultPage(container) {
  const label = document.createElement('div');
  label.className = 'first-guide';
  label.textContent = '정산 결과를 확인해주세요.';
  container.appendChild(label);

  // 공유 버튼 영역 추가
  const shareRow = document.createElement('div');
  shareRow.style.display = 'flex';
  shareRow.style.flexDirection = 'row';
  shareRow.style.justifyContent = 'center';
  shareRow.style.gap = '12px';
  shareRow.style.margin = '18px 0';

  const btnShareImg = document.createElement('button');
  btnShareImg.className = 'share-btn';
  btnShareImg.textContent = '이미지로 공유하기';
  // TODO: 기능 연결
  shareRow.appendChild(btnShareImg);

  const btnShareUrl = document.createElement('button');
  btnShareUrl.className = 'share-btn';
  btnShareUrl.textContent = 'URL로 공유하기';
  // TODO: 기능 연결
  shareRow.appendChild(btnShareUrl);

  container.appendChild(shareRow);
  
  // 결과 표
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  const thName = document.createElement('th');
  thName.textContent = '닉네임';
  trHead.appendChild(thName);
  const thTotal = document.createElement('th');
  thTotal.textContent = '합계';
  trHead.appendChild(thTotal);
  ['안주', '주류', '음료'].forEach(name => {
    const th = document.createElement('th');
    th.textContent = name;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  
  // 닉네임별 행
  persons.forEach((p, pi) => {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.textContent = p.name;
    tr.appendChild(tdName);
    let total = 0;
    let itemVals = [0,0,0];
    [0,1,2].forEach(ii => {
      let val = 0;
      if (p.selected && p.selected[ii]) {
        const count = persons.filter(pp => pp.selected && pp.selected[ii]).length;
        val = count > 0 ? Math.round((items[ii].price || 0) / count) : 0;
      }
      itemVals[ii] = val;
      total += val;
    });
    // 정산금
    const tdTotal = document.createElement('td');
    tdTotal.textContent = total.toLocaleString();
    tr.appendChild(tdTotal);
    // 각 항목별 금액
    itemVals.forEach(val => {
      const td = document.createElement('td');
      td.textContent = val.toLocaleString();
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  
  // 합계 행
  const trSum = document.createElement('tr');
  const tdSumName = document.createElement('td');
  tdSumName.textContent = '합계';
  trSum.appendChild(tdSumName);
  // 합계 정산금
  let sumTotal = 0;
  let sumItems = [0,0,0];
  [0,1,2].forEach(ii => {
    sumItems[ii] = items[ii].price || 0;
    sumTotal += sumItems[ii];
  });
  const tdSumTotal = document.createElement('td');
  tdSumTotal.textContent = sumTotal.toLocaleString();
  trSum.appendChild(tdSumTotal);
  sumItems.forEach(val => {
    const td = document.createElement('td');
    td.textContent = val.toLocaleString();
    trSum.appendChild(td);
  });
  tbody.appendChild(trSum);
  table.appendChild(tbody);
  container.appendChild(table);
  
  // 처음으로 버튼 .next-btn 스타일, 100% width, 가운데 정렬
  const resetBtn = document.createElement('button');
  resetBtn.className = 'next-btn';
  resetBtn.textContent = '처음으로';
  resetBtn.style.margin = '24px auto 0 auto';
  resetBtn.style.width = '100%';
  resetBtn.onclick = () => { location.reload(); };
  container.appendChild(resetBtn);
  
  // 하단 바 제거
  const prevBars = document.querySelectorAll('.bottom-bar');
  prevBars.forEach(bar => bar.remove());
}

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
      renderPage();
    })
    .catch(error => {
      console.error('Error loading nicknames:', error);
      renderPage();
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
    resetBtn.onclick = function() { location.reload(); };
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
      tableHTML += "<th>합계</th></tr>";
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