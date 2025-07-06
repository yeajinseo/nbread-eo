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
  btnPhoto.onclick = () => {
    if (!/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) {
      // alert('모바일에서만 지원되는 기능입니다.');
      // return;
    }
    showPhotoChoiceModal();
  };
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

function showPhotoChoiceModal() {
  // 기존 모달 내용 비우기
  const modal = document.getElementById('priceInputModal');
  if (!modal) return;
  const content = modal.querySelector('div');
  if (!content) return;
  content.innerHTML = '';
  content.style.position = 'relative';
  content.style.padding = '44px 16px 24px 16px';

  // X 버튼
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

  // 제목 추가
  const title = document.createElement('div');
  title.style.fontSize = '1.1rem';
  title.style.fontWeight = '600';
  title.style.marginBottom = '20px';
  title.style.textAlign = 'center';
  title.textContent = '영수증 이미지 추가';
  content.appendChild(title);

  // 사진 촬영 버튼
  const btnCamera = document.createElement('button');
  btnCamera.className = 'next-btn';
  btnCamera.textContent = '📷 사진 촬영';
  btnCamera.style.width = '100%';
  btnCamera.onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.onchange = (e) => {
      if (input.files && input.files[0]) {
        handleFileUpload(input.files[0]);
      }
      document.body.removeChild(input);
    };
    
    input.onerror = (e) => {
      alert('카메라 접근에 실패했습니다. 갤러리에서 선택해주세요.');
      document.body.removeChild(input);
    };
    
    try {
    input.click();
    } catch (error) {
      alert('카메라 접근에 실패했습니다. 갤러리에서 선택해주세요.');
      document.body.removeChild(input);
    }
  };
  content.appendChild(btnCamera);

  // 사진 업로드 버튼
  const btnUpload = document.createElement('button');
  btnUpload.className = 'next-btn';
  btnUpload.textContent = '📁 갤러리에서 선택';
  btnUpload.style.width = '100%';
  btnUpload.style.marginTop = '12px';
  btnUpload.onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.onchange = (e) => {
      if (input.files && input.files[0]) {
        handleFileUpload(input.files[0]);
      }
      document.body.removeChild(input);
    };
    
    try {
    input.click();
    } catch (error) {
      alert('파일 선택에 실패했습니다.');
      document.body.removeChild(input);
    }
  };
  content.appendChild(btnUpload);
}

function handleFileUpload(file) {
  // 파일 크기 체크 (50MB 이하)
  if (file.size > 50 * 1024 * 1024) {
    alert('파일 크기가 50MB를 초과합니다. 더 작은 이미지를 선택해주세요.');
    return;
  }

  // 로딩 표시
  showLoadingModal('영수증을 분석하고 있습니다...');

  // 파일을 base64로 변환
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64String = e.target.result; // data:image/jpeg;base64, 포함된 전체 문자열
    
    // API 요청 데이터 준비 (올바른 형식)
    const requestData = {
      imageBase64: base64String,
      originalName: file.name,
      mimeType: file.type,
      settlementId: generateSettlementId(), // 고유 ID 생성
      generation: 1,
      classNumber: 1
    };

    // API 호출 전 네트워크 상태 확인
    if (!navigator.onLine) {
      hideLoadingModal();
      alert('인터넷 연결이 없습니다.\n네트워크 연결을 확인해주세요.');
      return;
    }

    // 바로 실제 API 호출 진행 (서버 상태 확인 제거)
    performReceiptAnalysis(requestData);
  };
  
  reader.onerror = function(error) {
    hideLoadingModal();
    alert('파일 읽기에 실패했습니다: ' + error.message);
  };
  
  reader.readAsDataURL(file);
}

// 실제 영수증 분석 API 호출 함수
function performReceiptAnalysis(requestData) {
  // 타임아웃 설정
  const timeout = 30000; // 30초
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // 헤더 설정
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // 모바일 환경에서 추가 헤더
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (isMobile) {
    headers['Cache-Control'] = 'no-cache';
    headers['Pragma'] = 'no-cache';
  }

  // HTTPS 고정 API 엔드포인트
  const apiUrl = 'https://3.139.6.169:3000/api/analyze-receipt';

  // 모바일 디버깅 정보 출력
  if (isMobile) {
    console.log('=== 모바일 API 호출 디버깅 정보 ===');
    console.log('User Agent:', navigator.userAgent);
    console.log('온라인 상태:', navigator.onLine);
    console.log('API URL:', apiUrl);
    console.log('요청 헤더:', headers);
    console.log('요청 데이터 크기:', JSON.stringify(requestData).length, 'bytes');
    console.log('이미지 크기:', requestData.imageBase64 ? requestData.imageBase64.length : 0, 'bytes');
    
    // 네트워크 정보 (가능한 경우)
    if (navigator.connection) {
      console.log('네트워크 타입:', navigator.connection.effectiveType);
      console.log('다운링크:', navigator.connection.downlink, 'Mbps');
      console.log('RTT:', navigator.connection.rtt, 'ms');
    }
    
    // 디버깅용 alert (개발 중에만 사용)
    // alert(`모바일 API 호출 시작\nURL: ${apiUrl}\n온라인: ${navigator.onLine}\n이미지크기: ${requestData.imageBase64 ? Math.round(requestData.imageBase64.length/1024) : 0}KB`);
  }

  // 모바일에서 SSL 인증서 오류 우회를 위한 XMLHttpRequest 사용
  if (isMobile) {
    console.log('모바일 환경에서 XMLHttpRequest 사용');
    
    const xhr = new XMLHttpRequest();
    xhr.timeout = timeout;
    
    xhr.onload = function() {
      clearTimeout(timeoutId);
      hideLoadingModal();
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          console.log('=== XMLHttpRequest 응답 데이터 ===');
          console.log('응답 데이터:', data);
          
          if (data.success) {
            processReceiptAnalysis(data.data);
          } else {
            alert('영수증 분석에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
          }
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          alert('서버 응답을 처리할 수 없습니다.');
        }
      } else {
        alert(`HTTP 오류: ${xhr.status} - ${xhr.statusText}`);
      }
    };
    
    xhr.onerror = function() {
      clearTimeout(timeoutId);
      hideLoadingModal();
      console.log('=== XMLHttpRequest 오류 정보 ===');
      console.log('오류 상태:', xhr.status);
      console.log('오류 텍스트:', xhr.statusText);
      console.log('응답 텍스트:', xhr.responseText);
      
      alert('서버 연결에 실패했습니다.\n\n가능한 해결방법:\n1. 인터넷 연결 확인\n2. 브라우저 새로고침\n3. 잠시 후 다시 시도\n4. 다른 네트워크에서 시도');
    };
    
    xhr.ontimeout = function() {
      clearTimeout(timeoutId);
      hideLoadingModal();
      alert('요청 시간이 초과되었습니다.\n\n서버 응답이 30초 이상 걸렸습니다.\n잠시 후 다시 시도해주세요.');
    };
    
    xhr.open('POST', apiUrl, true);
    
    // 헤더 설정
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });
    
    // 모바일에서 SSL 인증서 검증 완화 시도
    try {
      xhr.send(JSON.stringify(requestData));
    } catch (error) {
      console.error('XMLHttpRequest 전송 오류:', error);
      // XMLHttpRequest 실패 시 fetch로 폴백
      console.log('XMLHttpRequest 실패, fetch로 폴백');
      performFetchRequest();
    }
    
    return; // XMLHttpRequest 사용 시 여기서 종료
  }

  // PC 환경에서는 기존 fetch 사용
  performFetchRequest();

  // fetch 요청 함수
  function performFetchRequest() {
    fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestData),
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
      // SSL 인증서 오류 우회 시도
      cache: 'no-cache',
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    })
    .then(response => {
      clearTimeout(timeoutId);
      
      // 모바일 디버깅 정보
      if (isMobile) {
        console.log('=== API 응답 정보 ===');
        console.log('응답 상태:', response.status, response.statusText);
        console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));
        console.log('응답 URL:', response.url);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      hideLoadingModal();
      
      // 모바일 디버깅 정보
      if (isMobile) {
        console.log('=== API 응답 데이터 ===');
        console.log('응답 데이터:', data);
        console.log('성공 여부:', data.success);
        if (data.data) {
          console.log('분석된 항목 수:', Object.keys(data.data.categories || {}).length);
          console.log('총 금액:', data.data.totalAmount);
        }
      }
      
      if (data.success) {
        processReceiptAnalysis(data.data);
      } else {
        alert('영수증 분석에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
      }
    })
    .catch(error => {
      clearTimeout(timeoutId);
      hideLoadingModal();
      
      // 모바일 디버깅 정보
      if (isMobile) {
        console.log('=== API 오류 정보 ===');
        console.log('오류 이름:', error.name);
        console.log('오류 메시지:', error.message);
        console.log('오류 스택:', error.stack);
        console.log('오류 타입:', error.constructor.name);
        
        // 추가 오류 정보
        if (error.cause) {
          console.log('오류 원인:', error.cause);
        }
        
        // 네트워크 상태 재확인
        console.log('오류 발생 시 온라인 상태:', navigator.onLine);
        
        // 디버깅용 alert (개발 중에만 사용)
        // alert(`모바일 API 오류\n이름: ${error.name}\n메시지: ${error.message}\n온라인: ${navigator.onLine}`);
      }
      
      // 강화된 에러 처리
      if (error.name === 'AbortError') {
        alert('요청 시간이 초과되었습니다.\n\n서버 응답이 30초 이상 걸렸습니다.\n잠시 후 다시 시도해주세요.');
      } else if (error.message.includes('load failed')) {
        alert('서버 연결에 실패했습니다.\n\n가능한 해결방법:\n1. 인터넷 연결 확인\n2. 브라우저 새로고침\n3. 잠시 후 다시 시도\n4. 다른 네트워크에서 시도');
      } else if (error.message.includes('Failed to fetch')) {
        alert('네트워크 연결에 실패했습니다.\n\n가능한 해결방법:\n1. 인터넷 연결 확인\n2. 브라우저 새로고침\n3. 잠시 후 다시 시도');
      } else if (error.message.includes('CORS')) {
        alert('CORS 정책 오류가 발생했습니다.\n\n서버 설정을 확인해주세요.');
      } else {
        const errorMessage = `API 호출 오류:\n${error.message}`;
        alert(errorMessage);
      }
    });
  }
}

// 고유 정산 ID 생성
function generateSettlementId() {
  return 'nbread_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 영수증 분석 결과 처리
function processReceiptAnalysis(data) {
  const modal = document.getElementById('priceInputModal');
  if (!modal) return;
  
  const content = modal.querySelector('div');
  if (!content) return;
  
  content.innerHTML = '';
  content.style.position = 'relative';
  content.style.padding = '44px 16px 24px 16px';

  // X 버튼
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

  // 성공 메시지
  const successMsg = document.createElement('div');
  successMsg.style.fontSize = '1.1rem';
  successMsg.style.fontWeight = '600';
  successMsg.style.marginBottom = '20px';
  successMsg.style.textAlign = 'center';
  successMsg.style.color = '#28a745';
  successMsg.textContent = '✅ 영수증 분석 완료!';
  content.appendChild(successMsg);

  // 총 금액 표시
  if (data.totalAmount) {
    const totalAmountDiv = document.createElement('div');
    totalAmountDiv.style.fontSize = '1rem';
    totalAmountDiv.style.fontWeight = '500';
    totalAmountDiv.style.marginBottom = '16px';
    totalAmountDiv.style.textAlign = 'center';
    totalAmountDiv.style.color = '#333';
    totalAmountDiv.textContent = `총 금액: ${data.totalAmount.toLocaleString()}원`;
    content.appendChild(totalAmountDiv);
  }

  // 분석된 카테고리 표시
  if (data.categories && Object.keys(data.categories).length > 0) {
    const categoriesTitle = document.createElement('div');
    categoriesTitle.style.fontSize = '1rem';
    categoriesTitle.style.fontWeight = '500';
    categoriesTitle.style.marginBottom = '12px';
    categoriesTitle.textContent = '분석된 항목:';
    content.appendChild(categoriesTitle);

    const categoriesList = document.createElement('div');
    categoriesList.style.marginBottom = '20px';
    categoriesList.style.maxHeight = '200px';
    categoriesList.style.overflowY = 'auto';
    categoriesList.style.border = '1px solid #ddd';
    categoriesList.style.borderRadius = '8px';
    categoriesList.style.padding = '12px';

    Object.entries(data.categories).forEach(([categoryName, categoryData]) => {
      if (categoryData.items && categoryData.items.length > 0) {
        categoryData.items.forEach(item => {
          const categoryItem = document.createElement('div');
          categoryItem.style.display = 'flex';
          categoryItem.style.justifyContent = 'space-between';
          categoryItem.style.marginBottom = '8px';
          categoryItem.style.fontSize = '0.9rem';
          
          const nameSpan = document.createElement('span');
          nameSpan.textContent = `[${categoryName}] ${item.name}`;
          
          const priceSpan = document.createElement('span');
          priceSpan.style.fontWeight = '600';
          priceSpan.textContent = (item.price || 0).toLocaleString() + '원';
          
          categoryItem.appendChild(nameSpan);
          categoryItem.appendChild(priceSpan);
          categoriesList.appendChild(categoryItem);
        });
      }
    });

    content.appendChild(categoriesList);
  }

  // 분류 결과 표시
  const classificationTitle = document.createElement('div');
  classificationTitle.style.fontSize = '1rem';
  classificationTitle.style.fontWeight = '500';
  classificationTitle.style.marginBottom = '12px';
  classificationTitle.textContent = '분류 결과:';
  content.appendChild(classificationTitle);

  // 분류 결과 테이블
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.marginBottom = '20px';
  
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  ['분류', '항목', '금액'].forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    th.style.padding = '8px';
    th.style.fontSize = '0.9rem';
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  
  // 서버에서 받은 분류 결과를 그대로 사용
  Object.entries(data.categories || {}).forEach(([categoryName, categoryData]) => {
    if (categoryData.items && categoryData.items.length > 0) {
      const tr = document.createElement('tr');
      
      const tdCategory = document.createElement('td');
      tdCategory.textContent = categoryName;
      tdCategory.style.padding = '8px';
      tdCategory.style.fontSize = '0.9rem';
      tr.appendChild(tdCategory);
      
      const tdItems = document.createElement('td');
      tdItems.textContent = categoryData.items.map(item => item.name).join(', ');
      tdItems.style.padding = '8px';
      tdItems.style.fontSize = '0.9rem';
      tr.appendChild(tdItems);
      
      const tdAmount = document.createElement('td');
      tdAmount.textContent = (categoryData.total || 0).toLocaleString() + '원';
      tdAmount.style.padding = '8px';
      tdAmount.style.fontSize = '0.9rem';
      tdAmount.style.fontWeight = '600';
      tr.appendChild(tdAmount);
      
      tbody.appendChild(tr);
    }
  });
  
  table.appendChild(tbody);
  content.appendChild(table);

  // 적용 버튼
  const applyBtn = document.createElement('button');
  applyBtn.className = 'next-btn';
  applyBtn.textContent = '분석 결과 적용하기';
  applyBtn.style.width = '100%';
  applyBtn.onclick = () => {
    applyReceiptAnalysis(data.categories);
    modal.remove();
    renderPage(); // 페이지 다시 렌더링
  };
  content.appendChild(applyBtn);

  // 다시 분석 버튼
  const retryBtn = document.createElement('button');
  retryBtn.className = 'next-btn';
  retryBtn.textContent = '다른 영수증 분석하기';
  retryBtn.style.width = '100%';
  retryBtn.style.marginTop = '12px';
  retryBtn.style.backgroundColor = '#6c757d';
  retryBtn.onclick = () => {
    showPhotoChoiceModal();
  };
  content.appendChild(retryBtn);
}

// 분석 결과를 items 배열에 적용
function applyReceiptAnalysis(categories) {
  // 서버에서 받은 분류 결과를 그대로 사용
  Object.entries(categories || {}).forEach(([categoryName, categoryData]) => {
    const totalAmount = categoryData.total || 0;
    
    // 해당 카테고리의 기존 항목 찾기
    const existingItemIndex = window.items.findIndex(item => item.name === categoryName);
    if (existingItemIndex !== -1) {
      window.items[existingItemIndex].price = totalAmount;
    } else {
      // 새로운 항목 추가
      window.items.push({ name: categoryName, price: totalAmount });
    }
  });
}

// 로딩 모달 표시
function showLoadingModal(message) {
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

// 로딩 모달 숨기기
function hideLoadingModal() {
  const modal = document.getElementById('loadingModal');
  if (modal) {
    modal.remove();
  }
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
      if (e.target === delImg) return;
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
      helpIframe.src = 'https://cdn.glitch.global/332d8fa1-f99a-45b3-8787-25ed7ef4d642/howto.pdf?v=1751382555483';
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