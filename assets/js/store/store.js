/* ------------------------------- redux 초기상태 ------------------------------- */
const initialState = {
    type: null,
    typeName: null,
    gender: null,
    genderName: null,
    ageGroup: null,
    ageGroupName: null,
    lifeStyle: null,
    lifeStyleName: null,
    result: null,
    current:0,
  };
  
  /* -------------------------------- 리듀서 함수 정의 ------------------------------- */
  function reducer(state = initialState, action) {
    switch (action.type) {
      case "SET_TYPE":
        return { ...state, type: action.payload.type, typeName: action.payload.typeName };
      case "SET_GENDER_AND_AGE_GROUP": // 액션 타입 수정
        return {
          ...state,
          gender: action.payload.gender,
          genderName: action.payload.genderName,
          ageGroup: action.payload.ageGroup, 
          ageGroupName: action.payload.ageGroupName,
        };
      case "SET_LIFESTYLE":
        return { ...state, lifeStyle: action.payload.lifeStyle, lifeStyleName: action.payload.lifeStyleName };
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