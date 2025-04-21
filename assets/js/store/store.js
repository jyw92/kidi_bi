/* ------------------------------- redux 초기상태 ------------------------------- */
const initialState = {
    type: null,
    gender: null,
    ageGroup: null,
    lifeStyle: null,
    result: null,
    current:0,
  };
  
  /* -------------------------------- 리듀서 함수 정의 ------------------------------- */
  function reducer(state = initialState, action) {
    switch (action.type) {
      case "SET_TYPE":
        return { ...state, type: action.payload };
      case "SET_GENDER_AND_AGE_GROUP": // 액션 타입 수정
        return {
          ...state,
          gender: action.payload.gender,
          ageGroup: action.payload.ageGroup,
        };
      case "SET_LIFESTYLE":
        return { ...state, lifeStyle: action.payload };
      case "SET_RESULT":
        return { ...state, result: action.payload };
      case "SET_CURRENT":
        return { ...state, current:action.payload};
      default:
        return state;
    }
  }
  
  /* ------------------------------ Redux 스토어 생성 ------------------------------ */
  export const store = Redux.createStore(reducer);