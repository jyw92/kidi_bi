// Swiper 초기화
document.addEventListener('DOMContentLoaded', function() {
    const swiper = new Swiper('.indicators-swiper', {
        // 기본 설정
        slidesPerView: 'auto',
        spaceBetween: 20,
        centeredSlides: false,
        
        // 페이지네이션
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        
        // 반응형 브레이크포인트
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 15,
                centeredSlides: true,
            },
            480: {
                slidesPerView: 1.2,
                spaceBetween: 15,
                centeredSlides: true,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20,
                centeredSlides: false,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 20,
                centeredSlides: false,
            }
        },
        
        // 터치/마우스 설정
        touchRatio: 1,
        touchAngle: 45,
        grabCursor: true,
        
        // // 자동재생 (선택사항)
        // autoplay: {
        //     delay: 5000,
        //     disableOnInteraction: false,
        //     pauseOnMouseEnter: true,
        // },
        
        // 루프 설정
        loop: true,
        loopedSlides: 3,
        
        // 효과
        effect: 'slide',
        speed: 600,
        
        // 키보드 네비게이션
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
        
        // 마우스휠 네비게이션
        mousewheel: {
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true,
        }
    });
    
    // 카드 호버 효과 개선
    const cards = document.querySelectorAll('.indicator-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // 더보기 버튼 클릭 이벤트
    const moreBtn = document.querySelector('.more-btn');
    if (moreBtn) {
        moreBtn.addEventListener('click', function() {
            alert('더 많은 보험 지표를 확인하시겠습니까?');
        });
    }
    
    // 숫자 애니메이션 효과
    function animateNumbers() {
        const stats = document.querySelectorAll('.main-stat');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stat = entry.target;
                    const text = stat.textContent;
                    const number = parseFloat(text.replace(/[^\d.]/g, ''));
                    const unit = text.replace(/[\d.,\s]/g, '');
                    
                    animateNumber(stat, 0, number, unit, 2000);
                    observer.unobserve(stat);
                }
            });
        });
        
        stats.forEach(stat => observer.observe(stat));
    }
    
    function animateNumber(element, start, end, unit, duration) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easeOutCubic 이징 함수
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * easeProgress;
            
            let displayValue;
            if (unit.includes('%')) {
                displayValue = current.toFixed(1);
            } else if (unit.includes('만')) {
                displayValue = current.toLocaleString();
            } else {
                displayValue = current.toFixed(1);
            }
            
            element.innerHTML = `${displayValue} <span class="unit">${unit}</span>`;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
    
    // 페이지 로드 후 숫자 애니메이션 시작
    setTimeout(animateNumbers, 500);
    
    // 스와이프 제스처 개선
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchmove', function(e) {
        if (!startX || !startY) return;
        
        const diffX = startX - e.touches[0].clientX;
        const diffY = startY - e.touches[0].clientY;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            e.preventDefault(); // 수평 스크롤 시 세로 스크롤 방지
        }
    });
});

// 리사이즈 이벤트 처리
window.addEventListener('resize', function() {
    // 스와이퍼 업데이트
    if (window.swiper) {
        window.swiper.update();
    }
});

// 성능 최적화를 위한 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 스크롤 성능 최적화
const optimizedResize = debounce(function() {
    // 리사이즈 관련 로직
}, 250);

window.addEventListener('resize', optimizedResize);