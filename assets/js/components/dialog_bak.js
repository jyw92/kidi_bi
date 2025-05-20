
export default class Dialog {
  constructor() {
    this.$dialog = document.querySelector('dialog');
    this.$container = this.$dialog.querySelector('.dialog--container');
    this.$contentMainInfo = document.querySelector('.content--main .content--main--info');
  }

  // 구분코드가져오는 api
  async dialogSelectAPI(chartType) {
    try {
      const response = await axios.get(`http://localhost:3000/chart`);
      return response.data;
    } catch (error) {
      console.error(`[Dialog] ${chartType} 데이터 API 호출 중 오류 발생:`, error);
      alert(`[Dialog] ${chartType} 데이터 로딩 중 오류가 발생했습니다.`);
      return [];
    }
  }

  // 보험리스트 api
  async dialogListAPI(params = {}) {
    try {
      // 아래 url은 테스트용 api 주소
      const response = await axios.get(`http://localhost:3000/50s_indicators`, { params });  
      return response.data;
    } catch (error) {
      console.error(error);
      alert('데이터 목록을 가져오는 중 오류가 발생했습니다.');
      return [];
    }
  }

  async open({ chartType, chartName }) {
    this.$contentMainInfo.classList.add('open');

    try {
      const [optionsData, initialCardsData] = await Promise.all([
        this.dialogSelectAPI(chartType),
        this.dialogListAPI() // 초기 전체 리스트 로딩
      ]);
      
      let optionsHTML = '';
      let cardHTML = '';
      console.log("optionsData", optionsData[chartType]);
      if (optionsData[chartType] && Array.isArray(optionsData[chartType]) && optionsData[chartType].length > 0) {
        optionsHTML = optionsData[chartType].map((option, index) => `<option value="0${index}">${option}</option>`).join('');
      } else {
        optionsHTML = '<option disabled>선택 가능한 옵션이 없습니다.</option>';
      }

      if (initialCardsData && Array.isArray(initialCardsData) && initialCardsData.length > 0) {
        cardHTML = initialCardsData.map(card => `<div>${card.name}</div>`).join('');
      } else {
        cardHTML = '<p>없음</p>';
      }

      const template = `
        <form method="dialog" id="searchForm">
          <div class="dialog--title">
            <h2>${chartName}</h2>
            <button type="button" onclick="chartSettingDialog.close()" id="closeBtn" class="dialog--close">닫기</button>
          </div>
          <div class="dialog--search--wrapper">
            <select id="searchOption">${optionsHTML}</select>
            <input type="search" id="searchInput"/>
            <button type="submit" id="searchButton">검색</button>
          </div>
          <div class="dialog--list" id="listContainer">${cardHTML}</div>
        </form>
      `;
      this.$container.innerHTML = template;
      this.$dialog.showModal();

      document.querySelector('#closeBtn').addEventListener('click', () => this.close());

      // 폼 요소 찾아서 submit 이벤트 리스너 추가
      const searchForm = document.querySelector('#searchForm');
      if (searchForm) {
        searchForm.addEventListener('submit', this.handleSearch.bind(this));
      }

    } catch (error) {
      console.error("데이터를 가져오는 중 오류가 발생했습니다:", error);
      alert("데이터를 가져오는 중 오류가 발생했습니다.");
      this.close();
    }
  }

  async handleSearch(event) {
    event.preventDefault();
    const searchValue = document.querySelector('#searchInput').value;
    const selectedOptionValue = document.querySelector('#searchOption').value;
    const listContainer = document.querySelector('#listContainer');

    const params = {};
    if (searchValue) {
      params.name = searchValue; // 서버에서 검색어를 처리하는 파라미터명에 따라 변경
    }
    if (selectedOptionValue) {
      params.code = selectedOptionValue; // 서버에서 옵션 값을 처리하는 파라미터명에 따라 변경
    }

    listContainer.innerHTML = '<p>검색 중...</p>';
    try {
      const searchResults = await this.dialogListAPI(params);
      let cardHTML = '';
      if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
        cardHTML = searchResults.map(card => `<div>${card.name}</div>`).join('');
      } else {
        cardHTML = '<p>검색 결과가 없습니다.</p>';
      }
      listContainer.innerHTML = cardHTML;
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      listContainer.innerHTML = '<p>검색 중 오류가 발생했습니다.</p>';
    }
  }

  close() {
    this.$contentMainInfo.classList.remove('open');
    this.$dialog.close();
  }
}