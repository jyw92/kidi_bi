class newRSlider {
    /**
     * @param {object} options - 슬라이더 설정을 위한 옵션 객체
     * @param {string} options.target - 슬라이더를 생성할 요소의 CSS 선택자
     * @param {Array<string|number>} options.values - 슬라이더에 표시될 값의 배열
     * @param {Array<string|number>} [options.subValues] - 보조 레이블에 표시될 값의 배열
     * @param {boolean} [options.subLabels=false] - 보조 레이블 표시 여부
     * @param {Array<string>} [options.gradient] - 진행 바에 적용할 그라데이션 색상 배열
     * @param {number} [options.initialValueIndex=0] - 초기 설정될 값의 인덱스
     * ... 기타 옵션
     */
    constructor(options) {
        const defaults = {
            range: false,
            tooltip: true,
            scale: true,
            labels: true,
            initialValueIndex: 0,
            tooltipName: null,
            gradient: null,
            subLabels: false,
            subValues: [],
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
        this.isDragging = false;

        this._handleDragStart = this._handleDragStart.bind(this);
        this._handleDragMove = this._handleDragMove.bind(this);
        this._handleDragEnd = this._handleDragEnd.bind(this);
        
        this._processGradientColors();
        this.init();
    }

    _processGradientColors() {
        const { gradient } = this.options;
        const numValues = this.values.length;

        if (!gradient || !Array.isArray(gradient) || gradient.length === 0) {
            this.gradientColors = Array(numValues).fill('#2196F3');
            return;
        }
        
        let colors = [...gradient];
        while (colors.length < numValues) {
            colors.push(this._generateRandomColor());
        }

        this.gradientColors = colors.slice(0, numValues);
    }
    
    _generateRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    init() {
        this.container.innerHTML = this.createSliderHTML();
        
        this.progressBar = this.container.querySelector('.slider-progress');
        this.selectedDisplay = this.container.querySelector('.slider-tooltip');
        this.points = this.container.querySelectorAll('.slider-point');
        this.track = this.container.querySelector('.slider-track');
        this.labels = this.container.querySelectorAll('.slider-label');
        this.subLabels = this.container.querySelectorAll('.slider-sub-label');

        if (this.gradientColors.length > 0) {
            const initialColor = this.gradientColors[this.options.initialValueIndex] || '#2196F3';
            if(this.progressBar) this.progressBar.style.background = initialColor;
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

        const subLabelsHTML = this.options.subLabels ? this.options.subValues.map((subValue, index) =>
            `<div class="slider-sub-label" data-index="${index}" style="left: ${index / (this.values.length - 1) * 100}%">${subValue || ''}</div>`
        ).join('') : '';

        return `
            ${this.options.tooltip ? `<div class="slider-tooltip"></div>` : ''}
            <div class="slider-track">
                <div class="slider-progress"></div>
                ${scaleHTML}
            </div>
            <div class="slider-labels-container">
                ${labelsHTML ? `<div class="slider-labels">${labelsHTML}</div>` : ''}
                ${subLabelsHTML ? `<div class="slider-sub-labels">${subLabelsHTML}</div>` : ''}
            </div>
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

    _handleDragStart(e) {
        e.preventDefault();
        this.isDragging = true;
        this.container.classList.add('is-dragging');

        document.addEventListener('mousemove', this._handleDragMove);
        document.addEventListener('mouseup', this._handleDragEnd);
        document.addEventListener('touchmove', this._handleDragMove, { passive: false });
        document.addEventListener('touchend', this._handleDragEnd);
    }

    _handleDragMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const trackRect = this.track.getBoundingClientRect();
        
        let position = clientX - trackRect.left;
        let percentage = (position / trackRect.width) * 100;
        percentage = Math.max(0, Math.min(100, percentage));

        const newIndex = Math.round((percentage / 100) * (this.values.length - 1));

        if (newIndex !== this.currentIndex) {
            this.setValueByIndex(newIndex);
        }
    }

    _handleDragEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.container.classList.remove('is-dragging');

        document.removeEventListener('mousemove', this._handleDragMove);
        document.removeEventListener('mouseup', this._handleDragEnd);
        document.removeEventListener('touchmove', this._handleDragMove);
        document.removeEventListener('touchend', this._handleDragEnd);
    }

    setValue(value) {
        const index = this.values.indexOf(value);
        if (index === -1) return;

        this.currentIndex = index;
        this.currentValue = this.values[this.currentIndex];

        this.updateDisplay();
        this.setActivePoint();
        this.triggerChangeEvent();
    }

    updateDisplay() {
        const totalSegments = this.values.length - 1;
        if (totalSegments <= 0) return;

        const percentage = (this.currentIndex / totalSegments) * 100;
        const currentFillColor = this.gradientColors[this.currentIndex];

        if (this.progressBar) {
            this.progressBar.style.width = `${percentage}%`;
            
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
        }
        
        if (this.selectedDisplay) {
            this.selectedDisplay.innerHTML = `
            <div class="slider-tooltip--inner">
                ${this.options.tooltipName || ''} : ${this.currentValue}
                <svg xmlns="http://www.w3.org/2000/svg" width="7" height="6" viewBox="0 0 7 6" fill="none">
                    <path d="M4.36602 5.5C3.98112 6.16667 3.01887 6.16667 2.63397 5.5L0.468911 1.75C0.0840111 1.08333 0.565137 0.249999 1.33494 0.249999L5.66507 0.25C6.43487 0.25 6.91599 1.08333 6.53109 1.75L4.36602 5.5Z" fill="${currentFillColor}"/>
                </svg>
            </div> `;
            this.selectedDisplay.style.left = `${percentage}%`;
            this.selectedDisplay.style.backgroundColor = currentFillColor;
        }
    }

    setActivePoint() {
        [this.labels, this.subLabels].forEach(labelSet => {
            if(labelSet) {
                labelSet.forEach(label => {
                    const labelIndex = parseInt(label.dataset.index);
                    if (labelIndex === this.currentIndex) {
                        label.classList.add('active');
                    } else {
                        label.classList.remove('active');
                    }
                });
            }
        });

        this.points.forEach((point) => {
            const pointIndex = parseInt(point.dataset.index);
            const color = this.gradientColors[pointIndex];

            if (pointIndex < this.currentIndex) {
                point.classList.remove('active');
                point.style.borderColor = color;
                point.style.backgroundColor = color;
            } else if (pointIndex === this.currentIndex) {
                point.classList.add('active');
                point.style.borderColor = color;
                point.style.backgroundColor = 'white';
                point.focus();
            } else {
                point.classList.remove('active');
                point.style.borderColor = '';
                point.style.backgroundColor = '';
            }
            point.setAttribute('aria-valuenow', this.currentIndex);
        });
    }

    moveToPreviousPoint() {
        if (this.currentIndex > 0) {
            this.setValueByIndex(this.currentIndex - 1);
        }
    }

    moveToNextPoint() {
        if (this.currentIndex < this.values.length - 1) {
            this.setValueByIndex(this.currentIndex + 1);
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

export default newRSlider;