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
    let chartOptionsData = {}; // 차트 옵션 데이터 저장 객체
    
    // 선택 버튼 클릭 핸들러 (내부 함수로 정의) - 단일 선택만 가능하도록 수정
    const handleSelectButtonClick = (e) => {
        const button = e.currentTarget;
        const selectListBox = document.getElementById('selectList');
        
        // 이미 선택된 버튼인지 확인
        const isAlreadySelected = button.classList.contains('selected');
        
        // 모든 버튼에서 선택 클래스 제거
        if (selectListBox) {
            selectListBox.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('selected');
            });
        }
        
        // 클릭한 버튼이 이미 선택된 상태가 아니었을 때만 선택 클래스 추가
        if (!isAlreadySelected) {
            button.classList.add('selected');
        }
        
        // 현재 편집 중인 작업 ID 가져오기
        const taskForm = document.getElementById('taskForm');
        const editingTaskId = taskForm ? taskForm.dataset.editId : null;
        
        if (editingTaskId) {
            // 로컬 스토리지에서 작업 데이터 가져오기
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
            
            if (taskIndex !== -1) {
                // 선택된 버튼 정보 업데이트 (단일 선택)
                const selectedButton = selectListBox ? 
                    selectListBox.querySelector('button.selected')?.textContent : null;
                
                // 작업에 선택된 버튼 정보 추가
                tasks[taskIndex].selectedButton = selectedButton;
                
                // 로컬 스토리지에 저장
                localStorage.setItem('tasks', JSON.stringify(tasks));
            }
        }
    };
    
    // 선택 목록 버튼 이벤트 리스너 설정 (내부 함수로 정의)
    const setupSelectListButtonEvents = () => {
        const selectListBox = document.getElementById('selectList');
        if (!selectListBox) return;
        
        // 기존 이벤트 리스너 제거 (중복 방지)
        const buttons = selectListBox.querySelectorAll('button');
        buttons.forEach(btn => {
            // 이벤트 리스너 제거 및 추가
            btn.removeEventListener('click', handleSelectButtonClick);
            btn.addEventListener('click', handleSelectButtonClick);
        });
    };
    
    // 구분 타입 변경 이벤트 리스너 설정
    const setupGubunTypeChangeEvent = () => {
        const gubunType = document.getElementById('gubunType');
        if (!gubunType) return;
        
        // 이벤트 리스너 제거 및 추가
        gubunType.removeEventListener('change', handleGubunTypeChange);
        gubunType.addEventListener('change', handleGubunTypeChange);
    };
    
    // 구분 타입 변경 핸들러
    const handleGubunTypeChange = function() {
        // 현재 편집 중인 작업 ID 가져오기
        const taskForm = document.getElementById('taskForm');
        const editingTaskId = taskForm ? taskForm.dataset.editId : null;
        
        if (editingTaskId) {
            // 로컬 스토리지에서 작업 데이터 가져오기
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
            
            if (taskIndex !== -1) {
                // 선택된 구분 타입 업데이트
                tasks[taskIndex].selectedGubunType = this.value;
                tasks[taskIndex].selectedGubunText = this.options[this.selectedIndex].text;
                
                // 로컬 스토리지에 저장
                localStorage.setItem('tasks', JSON.stringify(tasks));
            }
        }
    };
    
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
            
            // 현재 선택된 옵션 데이터 저장
            const selectedGubunType = gubunType.value;
            
            // 차트 옵션 데이터 저장
            chartOptionsData = {
                chartType: dataChartType,
                selectList: selectList,
                selectedGubunType: selectedGubunType,
                listData: listData
            };
            
            // 현재 편집 중인 작업 ID 가져오기
            const taskForm = document.getElementById('taskForm');
            const editingTaskId = taskForm ? taskForm.dataset.editId : null;
            
            if (editingTaskId) {
                // 로컬 스토리지에서 작업 데이터 가져오기
                const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
                const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
                
                if (taskIndex !== -1) {
                    // 작업에 차트 옵션 데이터 추가
                    tasks[taskIndex].chartOptionsData = chartOptionsData;
                    
                    // 로컬 스토리지에 저장
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    
                    // 이전에 선택된 버튼이 있으면 복원
                    if (tasks[taskIndex].selectedButton) {
                        const buttons = selectListBox.querySelectorAll('button');
                        buttons.forEach(btn => {
                            if (btn.textContent === tasks[taskIndex].selectedButton) {
                                btn.classList.add('selected');
                            }
                        });
                    }
                }
            }
            
            // 새로운 버튼이 생성되었으므로 이벤트 리스너 다시 설정
            setupSelectListButtonEvents();
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
        
        // 현재 편집 중인 작업 ID 가져오기
        const taskForm = document.getElementById('taskForm');
        const editingTaskId = taskForm ? taskForm.dataset.editId : null;
        
        if (editingTaskId) {
            // 로컬 스토리지에서 작업 데이터 가져오기
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            const task = tasks.find(t => t.id === editingTaskId);
            
            if (task) {
                // 저장된 차트 옵션 데이터 복원
                if (task.chartOptionsData) {
                    chartOptionsData = task.chartOptionsData;
                    chartTypeValue = chartOptionsData.chartType;
                    selectList = chartOptionsData.selectList;
                    
                    // 버튼 상태 복원
                    chartTypeButton.forEach(btn => {
                        if (btn.getAttribute('data-chart-type') === chartTypeValue) {
                            btn.classList.add('--active');
                        } else {
                            btn.classList.remove('--active');
                        }
                    });
                    
                    // 차트 타입 입력 필드 복원
                    const chartTypeInput = document.getElementById('chartType');
                    if (chartTypeInput) {
                        chartTypeInput.value = chartTypeValue;
                    }
                    
                    // 데이터 로드 및 UI 복원 (비동기 처리)
                    loadSavedChartData(chartOptionsData, task);
                } else {
                    // 차트 옵션 데이터가 없는 경우에도 선택된 버튼 복원 시도
                    const selectListBox = document.getElementById('selectList');
                    if (selectListBox && task.selectedButton) {
                        const buttons = selectListBox.querySelectorAll('button');
                        buttons.forEach(btn => {
                            if (btn.textContent === task.selectedButton) {
                                btn.classList.add('selected');
                            }
                        });
                        
                        // 이벤트 리스너 설정
                        setupSelectListButtonEvents();
                    }
                }
            }
        }
        
        // 이벤트 리스너 설정
        setupGubunTypeChangeEvent();
    };
    
    // 저장된 차트 데이터 로드 함수
    const loadSavedChartData = async (savedData, task) => {
        if (!savedData) return;
        
        try {
            // 필요한 경우 데이터 다시 가져오기
            const data = await fetchData('http://localhost:3000/chart', {});
            const listData = await fetchData('http://localhost:3000/50s_indicators', {});
            
            const gubunType = document.getElementById('gubunType');
            const taskTitle = document.getElementById('taskTitle');
            const selectListBox = document.getElementById('selectList');
            
            if (!gubunType || !taskTitle || !selectListBox) return;
            
            // 버튼 텍스트 찾기
            const activeButton = Array.from(chartTypeButton).find(
                btn => btn.getAttribute('data-chart-type') === savedData.chartType
            );
            
            if (activeButton) {
                taskTitle.value = activeButton.textContent;
            }
            
            // 옵션 목록 복원
            if (data[savedData.chartType]) {
                const optionsHTML = data[savedData.chartType].map((option, index) => 
                    `<option value="0${index}" ${savedData.selectedGubunType === `0${index}` ? 'selected' : ''}>${option}</option>`
                ).join('');
                gubunType.innerHTML = optionsHTML;
            }
            
            // 선택 목록 복원
            if (listData) {
                const selectListHTML = listData.map((option, index) => 
                    `<button type="button">${option.name}</button>`
                ).join('');
                selectListBox.innerHTML = selectListHTML;
                
                // 선택된 버튼 상태 복원 (단일 선택)
                if (task && task.selectedButton) {
                    console.log('복원할 선택된 버튼:', task.selectedButton);
                    const buttons = selectListBox.querySelectorAll('button');
                    buttons.forEach(btn => {
                        if (btn.textContent === task.selectedButton) {
                            btn.classList.add('selected');
                            console.log('버튼 선택 복원됨:', btn.textContent);
                        }
                    });
                }
                
                // 새로운 버튼이 생성되었으므로 이벤트 리스너 다시 설정
                setupSelectListButtonEvents();
            }
        } catch (error) {
            console.error('차트 데이터 로드 중 오류 발생:', error);
        }
    };

    // 현재 선택된 차트 타입 반환 함수
    const getSelectedChartType = () => chartTypeValue;
    
    const getSelectList = () => selectList;
    
    // 차트 옵션 데이터 반환 함수
    const getChartOptionsData = () => chartOptionsData;
    
    // 선택된 버튼 텍스트 반환 함수
    const getSelectedButton = () => {
        const selectListBox = document.getElementById('selectList');
        if (!selectListBox) return null;
        
        const selectedButton = selectListBox.querySelector('button.selected');
        return selectedButton ? selectedButton.textContent : null;
    };

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
        getSelectList,
        getChartOptionsData,
        getSelectedButton
    };
};

export default ChartOptionPopup;