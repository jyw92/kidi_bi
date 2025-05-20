 import { fetchData } from "./fetchData.js";

// chartOptionPopup.js 수정
const ChartOptionPopup = () => {
    const chartType = document.querySelector('#chartRequestOptions');
    if (!chartType) {
        console.warn('Chart request options element not found');
        return null;
    }

    const DOM = {
        chartTypeButton: chartType.querySelectorAll('.dialog--btn')
    };
    
    const { chartTypeButton } = DOM;
    
    // 초기 선택된 버튼 찾기
    let initialButton = Array.from(chartTypeButton).find(btn => btn.classList.contains('--active'));
    let chartTypeValue = initialButton ? initialButton.getAttribute('data-chart-type') : null;
    let selectList;
    // 이벤트 리스너 설정
    chartTypeButton.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const target = e.currentTarget; // e.target 대신 e.currentTarget 사용
            const dataChartType = target.getAttribute('data-chart-type');

            const data = await fetchData('http://localhost:3000/chart',{});
            const listData = await fetchData('http://localhost:3000/50s_indicators',{});
            const gubunType = document.getElementById('gubunType');
            const taskTitle = document.getElementById('taskTitle');
            const selectListBox = document.getElementById('selectList');
            let optionsHTML = '';
            let selectListHTML = '';
            selectList = data[dataChartType];
            taskTitle.value = btn.textContent;
            optionsHTML = data[dataChartType].map((option, index) => `<option value="0${index}">${option}</option>`).join('');
            selectListHTML= listData.map((option, index) => `<button type="button">${option.name}</button>`).join('');
            gubunType.innerHTML = optionsHTML;
            selectListBox.innerHTML = selectListHTML;

            // 모든 버튼에서 활성 클래스 제거
            chartTypeButton.forEach(button => button.classList.remove('--active')); 
            
            // 클릭된 버튼에 활성 클래스 추가
            target.classList.add('--active'); 
            
            // 차트 타입 값 업데이트
            chartTypeValue = dataChartType;
            
            // 차트 타입 입력 필드 업데이트 (있는 경우)
            const chartTypeInput = document.getElementById('chartType');
            if (chartTypeInput) {
                chartTypeInput.value = chartTypeValue;
                
                // 변경 이벤트 발생시키기 (필요한 경우)
                const event = new Event('change', { bubbles: true });
                chartTypeInput.dispatchEvent(event);
            }
        });
    });

    // 초기화 함수
    const init = () => {
        // 초기 선택된 버튼이 없으면 첫 번째 버튼 선택
        if (!initialButton && chartTypeButton.length > 0) {
            chartTypeButton[0].classList.add('--active');
            chartTypeValue = chartTypeButton[0].getAttribute('data-chart-type');
            
            // 차트 타입 입력 필드 초기화
            const chartTypeInput = document.getElementById('chartType');
            if (chartTypeInput) {
                chartTypeInput.value = chartTypeValue;
            }
        }
    };

    // 현재 선택된 차트 타입 반환 함수
    const getSelectedChartType = () => chartTypeValue;
    
    const getSelectList = () => selectList;

    // 차트 타입 설정 함수
    const setChartType = (type) => {
        if (!type) return;
        
        const button = Array.from(chartTypeButton).find(
            btn => btn.getAttribute('data-chart-type') === type
        );
        
        if (button) {
            chartTypeButton.forEach(btn => btn.classList.remove('--active'));
            button.classList.add('--active');
            chartTypeValue = type;
            
            // 차트 타입 입력 필드 업데이트
            const chartTypeInput = document.getElementById('chartType');
            if (chartTypeInput) {
                chartTypeInput.value = chartTypeValue;
            }
        }
    };
    
    // 초기화 실행
    init();
    
    // 메서드 반환
    return {
        getSelectedChartType,
        setChartType,
        getSelectList
    };
};

export default ChartOptionPopup;