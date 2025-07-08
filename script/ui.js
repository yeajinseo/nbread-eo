// ui.js
// UI 렌더링, 모달, 입력창 등

import { setPageState, setNicknamesData, setSelectedClassIndex, setPersons, setItems, renderPage, pageState, persons, items, nicknamesData, selectedClassIndex } from './app.js';
import { showPhotoChoiceModal, showPriceInputModal, getClassList, saveSettlement, loadSettlement, getSettlementResult } from './api.js';

// 전역에 저장
let settlementId = null;
function buildSettlementPayload() {
  const allMembers = persons.map(p => p.name);
  const members = {
    all: allMembers,
    food: persons.filter(p => p.selected?.[0]).map(p => p.name),
    alcohol: persons.filter(p => p.selected?.[1]).map(p => p.name),
    beverage: persons.filter(p => p.selected?.[2]).map(p => p.name),
  };
  const amount = {
    food: items[0]?.price || 0,
    alcohol: items[1]?.price || 0,
    beverage: items[2]?.price || 0,
  };
  const payload = { members, amount };
  if (!settlementId) {
    payload.gen = 134;
    payload.class = (nicknamesData && nicknamesData[selectedClassIndex]?.id) || 1;
  } else {
    payload.id = settlementId;
  }
  return payload;
}

export function renderFirstPage(container) {
  container.style.height = '100vh';
  const centerContainer = document.createElement('div');
  centerContainer.style.display = 'flex';
  centerContainer.style.flexDirection = 'column';
  centerContainer.style.justifyContent = 'center';
  centerContainer.style.alignItems = 'center';
  centerContainer.style.height = 'calc(100vh - 180px)';
  centerContainer.style.overflow = 'hidden';
  centerContainer.style.position = 'relative';
  centerContainer.style.top = '0';
  centerContainer.style.left = '0';
  centerContainer.style.right = '0';
  centerContainer.style.zIndex = '50';
  centerContainer.style.padding = '0 24px';
  const label = document.createElement('div');
  label.className = 'first-guide';
  label.textContent = '정산을 시작합니다!';
  centerContainer.appendChild(label);
  const btnNew = document.createElement('button');
  btnNew.className = 'next-btn';
  btnNew.style.width = '100%';
  btnNew.style.margin = '24px auto 12px auto';
  btnNew.textContent = '새로 만들기';
  btnNew.onclick = async () => {
    // 1. 클래스 목록 API 호출
    const data = await getClassList(134);
    // 2. nicknamesData 포맷으로 변환 및 저장
    const classList = data.classes.map(cls => ({ name: cls.name, nicknames: cls.members, id: cls.id }));
    setNicknamesData(classList);
    // 3. 첫 번째 클래스 선택 및 멤버 세팅
    if (classList.length > 0) {
      setSelectedClassIndex(0);
      setPersons(classList[0].nicknames.map(nick => ({ name: nick })));
    } else {
      setSelectedClassIndex(null);
      setPersons([]);
    }
    setPageState(1);
    renderPage();
  };
  centerContainer.appendChild(btnNew);
  const btnLoad = document.createElement('button');
  btnLoad.className = 'next-btn';
  btnLoad.style.width = '100%';
  btnLoad.style.margin = '0 auto';
  btnLoad.textContent = '기존 정보 불러오기';
  btnLoad.onclick = async () => {
    const id = prompt('불러올 정산 ID를 입력하세요');
    if (!id) return;
    const data = await loadSettlement(id);
    // data.members, data.amount 등으로 persons, items, 선택상태 복원
    // (여기서 setPersons, setItems 등 사용)
    // ... 복원 로직 추가 ...
    renderPage();
  };
  centerContainer.appendChild(btnLoad);
  container.appendChild(centerContainer);
  const prevBars = document.querySelectorAll('.bottom-bar');
  prevBars.forEach(bar => bar.remove());
}

export function renderSecondPage(container) {
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
      setSelectedClassIndex(0);
      classSelect.value = 0;
      // 지터벅 닉네임들을 자동으로 로딩
      if (nicknamesData[0] && nicknamesData[0].nicknames) {
        setPersons(nicknamesData[0].nicknames.map(nick => ({ name: nick })));
      }
    } else if (selectedClassIndex !== null) {
      setSelectedClassIndex(selectedClassIndex);
      classSelect.value = selectedClassIndex;
    }
  }
  classSelect.onchange = function() {
    setSelectedClassIndex(parseInt(classSelect.value));
    if (nicknamesData && nicknamesData[selectedClassIndex]) {
      setPersons(nicknamesData[selectedClassIndex].nicknames.map(nick => ({ name: nick })));
    } else {
      setPersons([]);
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
        setPersons(persons.filter((_, i) => i !== idx));
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
      setPersons([...persons, { name: input.value.trim() }]);
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
  nextBtn.onclick = () => { setPageState(2); renderPage(); };
  bottomBar.appendChild(nextBtn);
  document.body.appendChild(bottomBar);
  // 중복 bottom-bar 제거
  const prevBars = document.querySelectorAll('.bottom-bar');
  if (prevBars.length > 1) {
    for (let i = 0; i < prevBars.length - 1; i++) prevBars[i].remove();
  }
}

export function renderThirdPage(container) {
  // items 배열 초기화 (안주, 주류, 음료)
  if (items.length === 0) {
    setItems([
      { name: '안주', price: 0 },
      { name: '주류', price: 0 },
      { name: '음료', price: 0 }
    ]);
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
  saveBtn.onclick = async () => {
    const payload = buildSettlementPayload();
    const res = await saveSettlement(payload);
    console.log('saveSettlement 응답:', res);
    if (res && res.id) {
      settlementId = res.id;
      alert('저장되었습니다! ID: ' + res.id);
    } else {
      alert('저장 실패! 서버 응답: ' + JSON.stringify(res));
    }
  };
  btnRow.appendChild(saveBtn);
  const nextBtn = document.createElement('button');
  nextBtn.className = 'next-btn';
  nextBtn.textContent = '최종 정산';
  nextBtn.style.width = '50%';
  // 금액 입력 여부에 따라 버튼 활성화/비활성화
  const hasPriceInput = items.some(item => item.price && item.price > 0);
  nextBtn.disabled = !hasPriceInput;
  nextBtn.onclick = () => { setPageState(3); renderPage(); };
  btnRow.appendChild(nextBtn);
  container.appendChild(btnRow);

  // 하단 바 제거
  const prevBars = document.querySelectorAll('.bottom-bar');
  prevBars.forEach(bar => bar.remove());
}

export async function renderResultPage(container) {
  if (!settlementId) {
    alert('정산 ID가 없습니다. 먼저 저장을 해주세요.');
    return;
  }
  try {
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

    const resultArr = await getSettlementResult(settlementId);
    // TODO: resultArr를 표로 렌더링
    // ... 표 렌더링 코드 ...
  } catch (e) {
    alert('정산 결과를 불러올 수 없습니다.');
  }
}

export function showLoadingModal(message) {
  let modal = document.getElementById('loadingModal');
  if (modal) modal.remove();
  
  modal = document.createElement('div');
  modal.id = 'loadingModal';
  modal.style.position = 'fixed';
  modal.style.left = '0';
  modal.style.top = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.5)';
  modal.style.zIndex = '3000';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';

  const content = document.createElement('div');
  content.style.background = '#fff';
  content.style.borderRadius = '12px';
  content.style.padding = '30px';
  content.style.textAlign = 'center';
  content.style.maxWidth = '300px';
  content.style.width = '90%';

  const spinner = document.createElement('div');
  spinner.style.width = '40px';
  spinner.style.height = '40px';
  spinner.style.border = '4px solid #f3f3f3';
  spinner.style.borderTop = '4px solid #107dc2';
  spinner.style.borderRadius = '50%';
  spinner.style.animation = 'spin 1s linear infinite';
  spinner.style.margin = '0 auto 20px auto';
  content.appendChild(spinner);

  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.style.fontSize = '1rem';
  messageDiv.style.color = '#333';
  content.appendChild(messageDiv);

  modal.appendChild(content);
  document.body.appendChild(modal);

  // CSS 애니메이션 추가
  if (!document.getElementById('loadingSpinnerStyle')) {
    const style = document.createElement('style');
    style.id = 'loadingSpinnerStyle';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

export function hideLoadingModal() {
  const modal = document.getElementById('loadingModal');
  if (modal) {
    modal.remove();
  }
}

export function showManualPriceInput(content, modal) {
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