// app.js
// 앱 진입점, 상태, 초기화, 페이지 전환

import { renderFirstPage, renderSecondPage, renderThirdPage, renderResultPage } from './ui.js';
import { loadNicknamesData } from './api.js';

export let pageState = 0; // 0: 첫페이지, 1: 닉네임, 2: 포함항목, 3: 정산결과
export let selectedClassIndex = null;
export function setSelectedClassIndex(val) {
  selectedClassIndex = val;
}
export var persons = [];
export function setPersons(arr) {
  persons = arr;
}
export var items = [];
export function setItems(arr) {
  items = arr;
}
export var nicknamesData = null;

export function setPageState(val) {
  pageState = val;
}

export function setNicknamesData(data) {
  nicknamesData = data;
}

// 페이지 렌더링 진입점
export function renderPage() {
  const container = document.getElementById('pageContainer');
  container.innerHTML = '';
  container.style.paddingBottom = '0px';
  container.style.minHeight = 'auto';
  container.style.boxSizing = 'border-box';
  container.style.position = 'relative';
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
          setPageState(0);
        } else if (pageState === 2) {
          setPageState(1);
        } else if (pageState === 3) {
          setPageState(2);
        }
        renderPage();
      };
    }
  }
}

// 앱 초기화
function initializeApp() {
  loadNicknamesData();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
window.addEventListener('load', function() {
  if (!nicknamesData) {
    console.log('Retrying initialization on window load...');
    initializeApp();
  }
});

// 진입점 export
export default {
  renderPage,
  pageState,
  persons,
  items,
  nicknamesData
}; 