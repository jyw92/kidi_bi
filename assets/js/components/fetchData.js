async function fetchData(url, params = {}) {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(`데이터를 가져오는 중 오류가 발생했습니다 (${url}):`, error);
    alert(`데이터를 가져오는 중 오류가 발생했습니다.`);
    return [];
  }
}

// 각 단계별 데이터 fetching 함수 (통합된 fetchData 함수 사용)
async function fetchStep01Data() {
  return await fetchData("http://localhost:3000/step1");
}

async function fetchStep02Data() {
  return await fetchData("http://localhost:3000/step2");
}

async function fetchStep03Data(gender) {
  return await fetchData("http://localhost:3000/step3", { gender });
}

async function fetchStep04Data(type, gender, ageGroup, cost=null) {
  return await fetchData("http://localhost:3000/rangeState", {
    type,
    gender,
    ageGroup,
  });
}

async function fetchResultData(type, gender, ageGroup, lifeStyle) {
  return await fetchData("http://localhost:3000/result", {
    type,
    gender,
    ageGroup,
    lifeStyle,
  });
}

export {
  fetchData,
  fetchStep01Data,
  fetchStep02Data,
  fetchStep03Data,
  fetchStep04Data,
  fetchResultData,
};
