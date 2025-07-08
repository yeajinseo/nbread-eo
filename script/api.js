// api.js
// 서버 통신, 파일 업로드, 영수증 분석

import { showLoadingModal, hideLoadingModal, showManualPriceInput } from './ui.js';
import { renderPage, items, nicknamesData, setNicknamesData } from './app.js';

export function handleFileUpload(file) {
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

export function performReceiptAnalysis(requestData) {
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

export function processReceiptAnalysis(data) {
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

export function showPhotoChoiceModal() {
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

export function showPriceInputModal() {
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

export function loadNicknamesData() {
  fetch('data/nicknames.json')
    .then(response => response.json())
    .then(data => {
      setNicknamesData(data);
      renderPage();
    })
    .catch(error => {
      console.error('Error loading nicknames:', error);
      renderPage();
    });
}

export function generateSettlementId() {
  return 'n' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
} 