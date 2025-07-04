class rSlider {
    /**
     * @param {object} options - 슬라이더 설정을 위한 옵션 객체
     * @param {string} options.target - 슬라이더를 생성할 요소의 CSS 선택자
     * @param {Array<string|number>} options.values - 슬라이더에 표시될 값의 배열
     * @param {Array<string>} [options.gradient] - 진행 바에 적용할 그라데이션 색상 배열
     * @param {number} [options.initialValueIndex=0] - 초기 설정될 값의 인덱스
     * ... 기타 옵션
     */
    
    constructor(options) {
        // --- 기존 생성자 코드 (변경 없음) ---
        const defaults = {
            range: false,
            tooltip: true,
            scale: true,
            labels: true,
            initialValueIndex: 0,
            gradient: null
        };
        this.options = { ...defaults, ...options };

        if (!this.options.target || !this.options.values || !Array.isArray(this.options.values)) {
            console.error('필수 옵션(target, values)이 올바르지 않습니다.');
            return;
        }

        this.container = document.querySelector(this.options.target);
        if (!this.container) {
            console.error(`타겟 요소('${this.options.target}')를 찾을 수 없습니다.`);
            return;
        }

        this.values = this.options.values;
        this.currentValue = this.values[this.options.initialValueIndex];
        this.currentIndex = this.options.initialValueIndex;

        // --- 드래그 상태 관리를 위한 속성 추가 ---
        this.isDragging = false;

        // --- 이벤트 핸들러 this 바인딩 ---
        this._handleDragStart = this._handleDragStart.bind(this);
        this._handleDragMove = this._handleDragMove.bind(this);
        this._handleDragEnd = this._handleDragEnd.bind(this);
        
        this._processGradientColors();
        this.init();
    }

    /**
     * ✅ 그라데이션 색상 배열을 처리하는 내부 메서드
     */
    _processGradientColors() {
        const { gradient } = this.options;
        const numValues = this.values.length;

        // 1. gradient 옵션이 없거나 비어있으면 기본 색상 적용
        if (!gradient || !Array.isArray(gradient) || gradient.length === 0) {
            this.gradientColors = ['#2196F3']; // 기본 단일 색상
            return;
        }
        
        // 2. gradient 색상이 값보다 부족하면 랜덤 색상 추가
        let colors = [...gradient];
        while (colors.length < numValues) {
            colors.push(this._generateRandomColor());
        }

        // 3. 최종 색상 배열 저장 (값이 색상보다 많을 경우, 값의 개수에 맞춰 자름)
        this.gradientColors = colors.slice(0, numValues);
    }
    
    /**
     * ✅ 랜덤 HEX 색상 코드를 생성하는 내부 메서드
     * @returns {string} - #xxxxxx 형식의 색상 코드
     */
    _generateRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    /**
     * 슬라이더의 HTML 구조를 생성하고 초기화합니다.
     */
    init() {
        this.container.innerHTML = this.createSliderHTML();
        
        this.progressBar = this.container.querySelector('.slider-progress');
        this.selectedDisplay = this.container.querySelector('.slider-tooltip');
        this.points = this.container.querySelectorAll('.slider-point');
        this.track = this.container.querySelector('.slider-track'); // 트랙 요소 추가
        this.labels = this.container.querySelectorAll('.slider-label');

        if (this.gradientColors.length === 1) {
            this.progressBar.style.background = this.gradientColors[0];
        } else {
            this.progressBar.style.background = `linear-gradient(90deg, ${this.gradientColors.join(', ')})`;
        }

        this.setupEventListeners();
        this.setValue(this.currentValue);
    }

    createSliderHTML() {
        const scaleHTML = this.options.scale ? this.values.map((value, index) =>
            `<div class="slider-point" data-index="${index}" style="left: ${index / (this.values.length - 1) * 100}%" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="${this.values.length - 1}" aria-valuenow="${this.currentIndex}" aria-valuetext="${value}"></div>`
        ).join('') : '';

        const labelsHTML = this.options.labels ? this.values.map((value, index) =>
            `<div class="slider-label" data-index="${index}" style="left: ${index / (this.values.length - 1) * 100}%">${value}</div>`
        ).join('') : '';

        return `
            ${this.options.tooltip ? `<div class="slider-tooltip"></div>` : ''}
            <div class="slider-track">
                <div class="slider-progress"></div>
                ${scaleHTML}
            </div>
            <div class="slider-labels">${labelsHTML}</div>
        `;
    }

    setupEventListeners() {
        this.points.forEach(point => {
            point.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.setValue(this.values[index]);
            });

            point.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const index = parseInt(e.currentTarget.dataset.index);
                    this.setValue(this.values[index]);
                }
            });
            // --- 드래그 & 터치 이벤트 리스너 추가 ---
            point.addEventListener('mousedown', this._handleDragStart);
            point.addEventListener('touchstart', this._handleDragStart, { passive: false });
        });

        this.container.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('slider-point')) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.moveToPreviousPoint();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.moveToNextPoint();
                }
            }
        });
    }

    /**
     * ✅ 드래그 시작 (mousedown, touchstart)
     */
    _handleDragStart(e) {
        e.preventDefault();
        this.isDragging = true;
        this.container.classList.add('is-dragging');

        // 문서 전체에 mousemove와 mouseup 이벤트를 추가하여 부드러운 드래그 지원
        document.addEventListener('mousemove', this._handleDragMove);
        document.addEventListener('mouseup', this._handleDragEnd);
        document.addEventListener('touchmove', this._handleDragMove, { passive: false });
        document.addEventListener('touchend', this._handleDragEnd);
    }

    /**
     * ✅ 드래그 중 (mousemove, touchmove)
     */
    _handleDragMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const trackRect = this.track.getBoundingClientRect();
        
        // 트랙 내에서의 마우스 위치 계산 (0% ~ 100%)
        let position = clientX - trackRect.left;
        let percentage = (position / trackRect.width) * 100;
        percentage = Math.max(0, Math.min(100, percentage)); // 0과 100 사이로 값 제한

        // 퍼센티지를 가장 가까운 포인트의 인덱스로 변환
        const newIndex = Math.round((percentage / 100) * (this.values.length - 1));

        // 인덱스가 변경되었을 때만 값 업데이트
        if (newIndex !== this.currentIndex) {
            this.setValueByIndex(newIndex);
        }
    }

    /**
     * ✅ 드래그 종료 (mouseup, touchend)
     */
    _handleDragEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.container.classList.remove('is-dragging');

        // 문서에 추가했던 이벤트 리스너들 제거
        document.removeEventListener('mousemove', this._handleDragMove);
        document.removeEventListener('mouseup', this._handleDragEnd);
        document.removeEventListener('touchmove', this._handleDragMove);
        document.removeEventListener('touchend', this._handleDragEnd);
    }

    setValue(value) {
        const index = this.values.indexOf(value);
        if (index === -1) return;

        this.currentValue = value;
        this.currentIndex = index;

        this.updateDisplay();
        this.setActivePoint();
        this.triggerChangeEvent();
    }

    /**
     * 슬라이더의 진행 상태 바와 툴팁을 업데이트합니다.
     * 각 구간을 부드러운 그라데이션으로 연결합니다.
     */
    updateDisplay() {
        const totalSegments = this.values.length - 1;
        if (totalSegments <= 0) return;

        const percentage = (this.currentIndex / totalSegments) * 100;
        if (this.progressBar) {
            this.progressBar.style.width = `${percentage}%`;
        }
        
        if (this.currentIndex > 0) {
            const stops = [];
            for (let i = 0; i <= this.currentIndex; i++) {
                const color = this.gradientColors[i];
                const position = (i / this.currentIndex) * 100;
                stops.push(`${color} ${position}%`);
            }
            this.progressBar.style.background = `linear-gradient(90deg, ${stops.join(', ')})`;
        } else {
            this.progressBar.style.background = 'transparent';
        }
        
        if (this.selectedDisplay) {
            // 툴팁 SVG 색상을 this.gradientColors에서 가져오도록 수정
            const currentFillColor = this.gradientColors[this.currentIndex];
            this.selectedDisplay.innerHTML = `
            <div class="slider-tooltip--inner">
                나의소비 : ${this.currentValue}
                <svg xmlns="http://www.w3.org/2000/svg" width="7" height="6" viewBox="0 0 7 6" fill="none">
                    <path d="M4.36602 5.5C3.98112 6.16667 3.01887 6.16667 2.63397 5.5L0.468911 1.75C0.0840111 1.08333 0.565137 0.249999 1.33494 0.249999L5.66507 0.25C6.43487 0.25 6.91599 1.08333 6.53109 1.75L4.36602 5.5Z" fill="${currentFillColor}"/>
                </svg>
            </div> `;
            this.selectedDisplay.style.left = `${percentage}%`;
            this.selectedDisplay.style.backgroundColor = currentFillColor;
        }
    }

    /**
     * 현재 활성화된 눈금(점)에 'active' 클래스를 추가하고,
     * 진행률에 따라 각 포인트의 색상을 업데이트합니다.
     */
    setActivePoint() {
        this.points.forEach((point) => {
            const pointIndex = parseInt(point.dataset.index);
            const color = this.gradientColors[pointIndex];

            // 상태에 따라 스타일을 적용합니다.
            if (pointIndex < this.currentIndex) {
                // --- 1. 통과한 포인트 ---
                point.classList.remove('active');
                point.style.borderColor = color;
                point.style.backgroundColor = color; // 통과한 점의 내부도 채웁니다.
            } 
            else if (pointIndex === this.currentIndex) {
                // --- 2. 현재 활성화된 포인트 ---
                point.classList.add('active');
                point.style.borderColor = color;
                point.style.backgroundColor = 'white'; // 활성화된 점은 테두리만 강조합니다.
                point.focus();
            } 
            else {
                // --- 3. 아직 도달하지 않은 포인트 ---
                point.classList.remove('active');
                point.style.borderColor = ''; // 기본값으로 되돌립니다.
                point.style.backgroundColor = ''; // 기본값으로 되돌립니다.
            }

            // ARIA 속성 업데이트
            point.setAttribute('aria-valuenow', this.currentIndex);
            
        });
    }

    moveToPreviousPoint() {
        if (this.currentIndex > 0) {
            this.setValue(this.values[this.currentIndex - 1]);
        }
    }

    moveToNextPoint() {
        if (this.currentIndex < this.values.length - 1) {
            this.setValue(this.values[this.currentIndex + 1]);
        }
    }

    triggerChangeEvent() {
        const event = new CustomEvent('sliderChange', {
            detail: {
                value: this.currentValue,
                index: this.currentIndex
            }
        });
        this.container.dispatchEvent(event);
    }

    getValue() {
        return {
            value: this.currentValue,
            index: this.currentIndex
        };
    }

    setValueByIndex(index) {
        if (index >= 0 && index < this.values.length) {
            this.setValue(this.values[index]);
        }
    }

    reset() {
        this.setValueByIndex(this.options.initialValueIndex);
    }
}