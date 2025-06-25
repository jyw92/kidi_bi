/**
 * 보험 선택 데이터 불러오기
 */
export function loadInsuranceSelection() {
  try {
    const savedSelection = localStorage.getItem("insuranceSelection")
    if (savedSelection) {
      const selectionData = JSON.parse(savedSelection)
      console.log("저장된 보험 선택 데이터 로드:", selectionData)
      return selectionData
    }
    return null
  } catch (error) {
    console.error("보험 선택 데이터 로드 오류:", error)
    return null
  }
}

/**
 * 보험 선택 데이터 삭제
 */
export function clearInsuranceSelection() {
  try {
    localStorage.removeItem("insuranceSelection")
    console.log("보험 선택 데이터가 삭제되었습니다.")
    return true
  } catch (error) {
    console.error("보험 선택 데이터 삭제 오류:", error)
    return false
  }
}

/**
 * 보험 선택 데이터 존재 여부 확인
 */
export function hasInsuranceSelection() {
  return localStorage.getItem("insuranceSelection") !== null
}

/**
 * 보험 선택 데이터 저장
 */
export function saveInsuranceSelection(selectionData) {
  try {
    localStorage.setItem("insuranceSelection", JSON.stringify(selectionData))
    console.log("보험 선택 데이터 저장 완료:", selectionData)
    return true
  } catch (error) {
    console.error("보험 선택 데이터 저장 오류:", error)
    return false
  }
}

/**
 * 저장된 선택 데이터로 보험 선택기 복원
 */
export function restoreInsuranceSelection(insuranceSelector) {
  const savedSelection = loadInsuranceSelection()
  if (!savedSelection || !insuranceSelector) {
    console.warn("복원할 데이터가 없거나 보험 선택기가 초기화되지 않았습니다.")
    return false
  }

  try {
    console.log("보험 선택기 상태 복원 시작:", savedSelection)

    // 분류 타입 복원
    if (savedSelection.type) {
      const typeSelect = document.getElementById("classificationType")
      if (typeSelect) {
        typeSelect.value = savedSelection.type
        typeSelect.dispatchEvent(new Event("change"))
        console.log("분류 타입 복원:", savedSelection.type)
      }
    }

    // 년도 범위 복원
    if (savedSelection.yearFrom) {
      const yearFromSelect = document.getElementById("yearFromSelect")
      if (yearFromSelect) {
        yearFromSelect.value = savedSelection.yearFrom
        console.log("시작 년도 복원:", savedSelection.yearFrom)
      }
    }

    if (savedSelection.yearTo) {
      const yearToSelect = document.getElementById("yearToSelect")
      if (yearToSelect) {
        yearToSelect.value = savedSelection.yearTo
        console.log("종료 년도 복원:", savedSelection.yearTo)
      }
    }

    // 월 범위 복원 (월별 조회인 경우)
    if (savedSelection.type === "monthly") {
      if (savedSelection.monthFrom) {
        const monthFromSelect = document.getElementById("monthFromSelect")
        if (monthFromSelect) {
          monthFromSelect.value = savedSelection.monthFrom
          console.log("시작 월 복원:", savedSelection.monthFrom)
        }
      }

      if (savedSelection.monthTo) {
        const monthToSelect = document.getElementById("monthToSelect")
        if (monthToSelect) {
          monthToSelect.value = savedSelection.monthTo
          console.log("종료 월 복원:", savedSelection.monthTo)
        }
      }
    }

    // 분기 범위 복원 (분기별 조회인 경우)
    if (savedSelection.type === "quarterly") {
      if (savedSelection.quarterFrom) {
        const quarterFromSelect = document.getElementById("quarterFromSelect")
        if (quarterFromSelect) {
          quarterFromSelect.value = savedSelection.quarterFrom
          console.log("시작 분기 복원:", savedSelection.quarterFrom)
        }
      }

      if (savedSelection.quarterTo) {
        const quarterToSelect = document.getElementById("quarterToSelect")
        if (quarterToSelect) {
          quarterToSelect.value = savedSelection.quarterTo
          console.log("종료 분기 복원:", savedSelection.quarterTo)
        }
      }
    }

    // 선택된 노드들 복원
    if (savedSelection.nodes && savedSelection.nodes.length > 0) {
      console.log("노드 복원 시작:", savedSelection.nodes)

      // 보험 선택기의 상태 직접 복원
      if (insuranceSelector.state) {
        // 선택된 노드들을 보험 선택기 상태에 복원
        savedSelection.nodes.forEach((node) => {
          if (insuranceSelector.state.selectedNodes) {
            insuranceSelector.state.selectedNodes.set(node.id, node)
            console.log("노드 복원:", node.title)
          }
        })

        // 트리 디스플레이 업데이트
        if (typeof insuranceSelector.updateTreeDisplay === "function") {
          insuranceSelector.updateTreeDisplay()
        }

        // 결과 업데이트
        if (typeof insuranceSelector.updateResult === "function") {
          insuranceSelector.updateResult()
        }
      }
    }

    console.log("보험 선택 상태가 복원되었습니다:", savedSelection)
    return true
  } catch (error) {
    console.error("보험 선택 상태 복원 오류:", error)
    return false
  }
}

/**
 * 분류 타입 텍스트 변환
 */
export function getTypeText(type) {
  switch (type) {
    case "yearly":
      return "년도별 조회"
    case "monthly":
      return "월별 조회"
    case "quarterly":
      return "분기별 조회"
    default:
      return "미선택"
  }
}
