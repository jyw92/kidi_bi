export default function resultTemplate(data) {
  const {
    lfstlNm,
    typeName,
    ageGroupName,
    genderName,
    hatmtFrstTitlNm,
    hatmtFrstRt,
    hatmtScndTitlNm,
    hatmtScndRt,
    latmtFrstTitlNm,
    latmtFrstRt,
    latmtScndTitlNm,
    latmtScndRt,
    cntrWlinsuScor,
    cntrCninsuScor,
    cntrPsinsuScor,
    cntrljinsuScor,
    cntrDsinsuScor,
    acdtCnillOccrRtScor,
    acdtDissHsptzRtScor,
    acdtInjrHsptzRtScor,
    acdtInjrSrgRtScor,
    rcmdInsuCtt,
  } = data;
  const generateRatingStars = (score, fieldName) => {
    return [...Array(5)]
      .map((_, i) => {
        const ratingValue = 5 - i;
        return `
            <input type="radio" name="${fieldName}" value="${ratingValue}" ${
          Number(score) === ratingValue ? 'checked' : ''
        } disabled/>
            <label class="full" for="${fieldName}Star${ratingValue}" title="${ratingValue} stars"></label>
        `;
      })
      .join('');
  };

  return `
            <div class="card--step--wrapper">
                    <span class="step--badge">STEP4.</span>
                    <p>당신은 <em class="var">${lfstlNm}</em> 유형</p>
            </div>
            <article>
                    <h2><em class="var">[${typeName}]</em> 사용정보를 토대로 분류한 당신의 유형은 아래와 같은 관심사를 보입니다.</h2>
                    <div class="result--area">
                    <!-- ----------------------------------------------------------------------- -->
                    <div class="result--area--inner">
                            <div class="result--area--title">
                            <h3>같은 <em class="var">[${ageGroupName} ${genderName}]</em> 대비 관심분야</h3>
                            </div>
                            <div class="result--area--info">
                            <div class="result--area--info--thumbnail" style="--borderColor:#064291;--bgColor:#2D83F3;">
                                    <img src="../assets/img/lifeStyle/ico_result_1.svg" alt="">
                            </div>
                            <div class="result--area--info--table">
                                    <div class="result--area--info--table--name">${hatmtFrstTitlNm}</div>
                                    <div class="result--area--info--table--counter">${hatmtFrstRt}</div>
                                    <div class="result--area--info--table--name">${hatmtScndTitlNm}</div>
                                    <div class="result--area--info--table--counter">${hatmtScndRt}</div>
                            </div>
                            </div>
                    </div>
                    <!-- ----------------------------------------------------------------------- -->
                    <div class="result--area--inner">
                            <div class="result--area--title">
                            <h3>같은 <em class="var">[${ageGroupName} ${genderName}]</em> 대비 낮은 관심분야</h3>
                            </div>
                            <div class="result--area--info">
                            <div class="result--area--info--thumbnail" style="--borderColor:#2D83F3;--bgColor:#064392;">
                                    <img src="../assets/img/lifeStyle/ico_result_2.svg" alt="">
                            </div>
                            <div class="result--area--info--table">
                                    <div class="result--area--info--table--name">${latmtFrstTitlNm}</div>
                                    <div class="result--area--info--table--counter">${latmtFrstRt}</div>
                                    <div class="result--area--info--table--name">${latmtScndTitlNm}</div>
                                    <div class="result--area--info--table--counter">${latmtScndRt}</div>
                            </div>
                            </div>
                    </div>
                    </div>
                    <!-- ----------------------------------------------------------------------- -->
            </article>
            <article>
                    <h2>당신의 유형은 아래와 같은 보험특성을 보입니다.</h2>
                    <div class="result--area">
                    <!-- ----------------------------------------------------------------------- -->
                    <div class="result--area--inner">
                            <div class="result--area--title">
                            <h3>보험가입정보</h3>
                            </div>
                            <div class="result--area--info">
                            <div class="result--area--info--thumbnail" style="--borderColor:#2D83F3;--bgColor:#064291;">
                                    <img src="../assets/img/lifeStyle/ico_result_3.svg" alt="">
                            </div>
                            <div class="result--area--info--table" style="--rows:5">
                                    <div class="result--area--info--table--name">종신보험</div>
                                    <div class="result--area--info--table--rating">
                                    <fieldset class="rating" data-rating="${cntrWlinsuScor}">
                                            ${generateRatingStars(cntrWlinsuScor, 'cntrWlinsuScor')}
                                    </fieldset>
                                    </div>
                                    <div class="result--area--info--table--name">암보험</div>
                                    <div class="result--area--info--table--rating">
                                    <fieldset class="rating" data-rating="${cntrCninsuScor}">
                                            ${generateRatingStars(cntrCninsuScor, 'cntrCninsuScor')}
                                    </fieldset>
                                    </div>
                                    <div class="result--area--info--table--name">연금보험</div>
                                    <div class="result--area--info--table--rating">
                                    <fieldset class="rating" data-rating="${cntrPsinsuScor}">
                                            ${generateRatingStars(cntrPsinsuScor, 'cntrPsinsuScor')}
                                    </fieldset>
                                    </div>
                                    <div class="result--area--info--table--name">상해보험</div>
                                    <div class="result--area--info--table--rating">
                                    <fieldset class="rating" data-rating="${cntrljinsuScor}">
                                            ${generateRatingStars(cntrljinsuScor, 'cntrljinsuScor')}
                                    </fieldset>
                                    </div>
                                    <div class="result--area--info--table--name">질병보험</div>
                                    <div class="result--area--info--table--rating">
                                    <fieldset class="rating" data-rating="${cntrDsinsuScor}">
                                            ${generateRatingStars(cntrDsinsuScor, 'cntrDsinsuScor')}
                                    </fieldset>
                                    </div>
                            </div>
                            </div>
                    </div>
                    <!-- ----------------------------------------------------------------------- -->
                    <div class="result--area--inner">
                            <div class="result--area--title">
                            <h3>보험사고정보</h3>
                            </div>
                            <div class="result--area--info">
                            <div class="result--area--info--thumbnail" style="--borderColor:#064291;--bgColor:#2D83F3;">
                                    <img src="../assets/img/lifeStyle/ico_result_4.svg" alt="">
                            </div>
                            <div class="result--area--info--table" style="--rows:4">
                                    <div class="result--area--info--table--name">암 발생률</div>
                                    <div class="result--area--info--table--rating">
                                            <fieldset class="rating" data-rating="${acdtCnillOccrRtScor}">
                                            ${generateRatingStars(acdtCnillOccrRtScor, 'acdtCnillOccrRtScor')}
                                            </fieldset>
                                    </div>
                                    <div class="result--area--info--table--name">질병 발생률</div>
                                    <div class="result--area--info--table--rating">
                                            <fieldset class="rating" data-rating="${acdtDissHsptzRtScor}">
                                            ${generateRatingStars(acdtDissHsptzRtScor, 'acdtDissHsptzRtScor')}
                                            </fieldset>
                                    </div>
                                    <div class="result--area--info--table--name">상해 입원률</div>
                                    <div class="result--area--info--table--rating">
                                            <fieldset class="rating" data-rating="${acdtInjrHsptzRtScor}">
                                            ${generateRatingStars(acdtInjrHsptzRtScor, 'acdtInjrHsptzRtScor')}
                                            </fieldset>
                                    </div>
                                    <div class="result--area--info--table--name">상해 수술률</div>
                                    <div class="result--area--info--table--rating">
                                            <fieldset class="rating" data-rating="${acdtInjrSrgRtScor}">
                                            ${generateRatingStars(acdtInjrSrgRtScor, 'acdtInjrSrgRtScor')}
                                            </fieldset>
                                    </div>
                            </div>
                            </div>
                    </div>
                    <!-- ----------------------------------------------------------------------- -->
                    </div>
            </article>
            <article>
                    <h2>당신이 속한 라이프스타일 그룹이 갖는 보험특성에 따라 추천드리는 보험은 아래와 같습니다.</h2>
                    <div class="result--last--container">
                    <div class="user--target">
                            <span>대상</span>
                            <p>${ageGroupName} ${genderName}</p>
                    </div>
                    <div class="result--last--info">
                            ${rcmdInsuCtt}
                    </div>
                    </div>
            </article>
    `;
}
