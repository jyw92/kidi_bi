/**
 * 간단한 개인정보수집이용동의 팝업 관리
 */
class SimplePrivacyPopup {
    constructor() {
      this.popup = null
      this.agreeLink = null
      this.popupClose = null
      this.popupConfirm = null
      this.mainAgreeCheck = null
  
      this.init()
    }
  
    /**
     * 초기화
     */
    init() {
      // DOM 요소들 가져오기
      this.popup = document.getElementById("agreePopup")
      this.agreeLink = document.getElementById("agreeLink")
      this.popupClose = document.getElementById("popupClose")
      this.popupConfirm = document.getElementById("popupConfirm")
      this.mainAgreeCheck = document.getElementById("agree")
  
      if (!this.popup) {
        console.error("개인정보 동의 팝업 요소를 찾을 수 없습니다.")
        return
      }
  
      this.setupEventListeners()
      console.log("✅ 간단한 개인정보 팝업이 초기화되었습니다.")
    }
  
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
      // 개인정보 동의 링크 클릭
      if (this.agreeLink) {
        this.agreeLink.addEventListener("click", (e) => {
          e.preventDefault()
          this.openPopup()
        })
      }
  
      // 팝업 닫기 버튼
      if (this.popupClose) {
        this.popupClose.addEventListener("click", () => {
          this.closePopup()
        })
      }
  
      // 확인 버튼
      if (this.popupConfirm) {
        this.popupConfirm.addEventListener("click", () => {
          this.confirmAgreement()
        })
      }
  
      // 팝업 외부 클릭 시 닫기
      if (this.popup) {
        this.popup.addEventListener("click", (e) => {
          if (e.target === this.popup) {
            this.closePopup()
          }
        })
      }
  
      // ESC 키로 팝업 닫기
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isPopupOpen()) {
          this.closePopup()
        }
      })
    }
  
    /**
     * 팝업 열기
     */
    openPopup() {
      if (!this.popup) return
  
      console.log("📋 개인정보 동의 팝업 열기")
  
      // 팝업 표시
      this.popup.classList.add("show")
  
      // 스크롤 방지
      document.body.style.overflow = "hidden"
  
      // 포커스 설정
      setTimeout(() => {
        if (this.popupConfirm) {
          this.popupConfirm.focus()
        }
      }, 300)
    }
  
    /**
     * 팝업 닫기
     */
    closePopup() {
      if (!this.popup) return
  
      console.log("❌ 개인정보 동의 팝업 닫기")
  
      // 팝업 숨기기
      this.popup.classList.remove("show")
  
      // 스크롤 복원
      document.body.style.overflow = ""
  
      // 원래 요소로 포커스 복원
      if (this.agreeLink) {
        this.agreeLink.focus()
      }
    }
  
    /**
     * 동의 확인 처리
     */
    confirmAgreement() {
      console.log("✅ 개인정보 수집·이용 동의 완료")
  
      // 메인 체크박스 체크
      if (this.mainAgreeCheck) {
        this.mainAgreeCheck.checked = true
  
        // 체크박스 변경 이벤트 발생
        const changeEvent = new Event("change", { bubbles: true })
        this.mainAgreeCheck.dispatchEvent(changeEvent)
      }
  
      // 성공 메시지 표시
      this.showMessage("개인정보 수집·이용에 동의하셨습니다! ✅")
  
      // 팝업 닫기
      setTimeout(() => {
        this.closePopup()
      }, 800)
    }
  
    /**
     * 팝업이 열려있는지 확인
     */
    isPopupOpen() {
      return this.popup && this.popup.classList.contains("show")
    }
  
    /**
     * 메시지 표시
     */
    showMessage(message) {
      // 기존 메시지 제거
      const existingMessage = document.querySelector(".simple-message")
      if (existingMessage) {
        existingMessage.remove()
      }
  
      // 새 메시지 생성
      const messageElement = document.createElement("div")
      messageElement.className = "simple-message"
      messageElement.textContent = message
  
      // 메시지 스타일
      Object.assign(messageElement.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "#28a745",
        color: "white",
        padding: "12px 20px",
        borderRadius: "6px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        zIndex: "1001",
        fontSize: "14px",
        fontWeight: "500",
        animation: "slideInRight 0.3s ease-out",
      })
  
      // 메시지 추가
      document.body.appendChild(messageElement)
  
      // 3초 후 자동 제거
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.style.animation = "slideOutRight 0.3s ease-out"
          setTimeout(() => {
            messageElement.remove()
          }, 300)
        }
      }, 3000)
    }
  
    /**
     * 동의 상태 확인 (외부에서 사용)
     */
    getAgreementStatus() {
      return {
        isPopupOpen: this.isPopupOpen(),
        isAgreed: this.mainAgreeCheck ? this.mainAgreeCheck.checked : false,
      }
    }
  
    /**
     * 프로그래밍 방식으로 동의 설정
     */
    setAgreement(agreed = true) {
      if (this.mainAgreeCheck) {
        this.mainAgreeCheck.checked = agreed
  
        // 변경 이벤트 발생
        const changeEvent = new Event("change", { bubbles: true })
        this.mainAgreeCheck.dispatchEvent(changeEvent)
      }
  
      console.log(`📋 개인정보 동의 상태: ${agreed ? "동의" : "비동의"}`)
    }
  }
  
  // CSS 애니메이션 추가
  const style = document.createElement("style")
  style.textContent = `
      @keyframes slideInRight {
          from {
              opacity: 0;
              transform: translateX(100%);
          }
          to {
              opacity: 1;
              transform: translateX(0);
          }
      }
  
      @keyframes slideOutRight {
          from {
              opacity: 1;
              transform: translateX(0);
          }
          to {
              opacity: 0;
              transform: translateX(100%);
          }
      }
  `
  document.head.appendChild(style)
  
  // DOM이 로드되면 자동으로 초기화
  document.addEventListener("DOMContentLoaded", () => {
    // 전역 변수로 인스턴스 생성
    window.simplePrivacyPopup = new SimplePrivacyPopup()
  })
  
  // 전역 함수들 (기존 코드와의 호환성을 위해)
  window.openSimplePrivacyPopup = () => {
    if (window.simplePrivacyPopup) {
      window.simplePrivacyPopup.openPopup()
    }
  }
  
  window.closeSimplePrivacyPopup = () => {
    if (window.simplePrivacyPopup) {
      window.simplePrivacyPopup.closePopup()
    }
  }
  
  window.getSimplePrivacyStatus = () => {
    if (window.simplePrivacyPopup) {
      return window.simplePrivacyPopup.getAgreementStatus()
    }
    return null
  }
  
  console.log("✅ 간단한 개인정보 팝업 스크립트가 로드되었습니다.")
  