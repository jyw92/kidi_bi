export default async function resultTemplate(data) {
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
          Number(score) === ratingValue ? "checked" : ""
        } disabled/>
            <label class="full" for="${fieldName}Star${ratingValue}" title="${ratingValue} stars"></label>
        `;
      })
      .join("");
  };

  const updateScoreDisplay = (score) => {
    switch (score) {
      case "1":
        return `<span class="score-display score-1">낮음</span>`;
      case "2":
        return `<span class="score-display score-2">조금 낮음</span>`;
      case "3":
        return `<span class="score-display score-3">평균</span>`;
      case "4":
        return `<span class="score-display score-4">높음</span>`;
      case "5":
        return `<span class="score-display score-5">매우높음</span>`;
      default:
        return `<span class="score-display">알수없음</span>`;
    }
  };

  //   <p>당신은 <em class="var">${lfstlNm}</em> 유형</p>
  return `
            <div class="card--step--wrapper">
                    <span class="step--badge">STEP4.</span>
                   
            </div>
            <article>
                    <div class="banner">
                      <div class="column">
                        <span>당신의 유형은...</span>
                        <strong>
                          <svg xmlns="http://www.w3.org/2000/svg" width="93" height="44" viewBox="0 0 93 44" fill="none" id="star">
                            <path d="M35.0799 36.3069C35.2359 35.3829 34.6759 35.2949 34.1879 35.1629C31.0999 34.3269 27.9519 33.7709 24.8199 33.1589C23.7159 32.9429 22.6079 32.7309 21.5239 32.4349C20.5759 32.1789 19.5359 31.8789 19.4519 30.6629C19.3639 29.3989 20.3319 28.9269 21.3159 28.5629C23.5999 27.7109 25.9679 27.1349 28.3279 26.5429C30.3359 26.0389 32.3399 25.5229 34.3639 25.0749C35.1039 24.9109 35.4199 24.5949 35.3719 23.8269C35.2519 21.9789 35.1759 20.1309 35.0799 18.2829C35.0719 18.1389 35.0239 17.9949 35.0199 17.8509C35.0079 16.9549 34.7799 15.9149 35.7799 15.4269C36.8159 14.9229 37.4719 15.7629 38.0919 16.4109C39.7359 18.1269 40.9399 20.1709 42.2199 22.1509C42.6599 22.8309 43.0999 23.0509 43.9159 22.8669C46.9279 22.1949 49.9319 21.4709 52.9839 20.9989C53.9559 20.8509 54.9359 20.7429 55.9079 20.9469C57.3359 21.2429 57.9279 22.3829 57.4039 23.7469C57.0679 24.6149 56.4639 25.2949 55.8439 25.9549C53.8239 28.1029 51.5679 29.9949 49.2519 31.8109C48.6039 32.3189 48.5399 32.7509 48.9079 33.4589C49.8079 35.1989 50.6279 36.9829 51.4759 38.7509C51.6159 39.0469 51.7319 39.3509 51.8439 39.6589C52.0839 40.3389 52.2159 41.0509 51.6319 41.5949C50.9839 42.1949 50.2559 41.8789 49.6079 41.5309C48.1679 40.7589 46.6919 40.0389 45.3239 39.1509C42.8839 37.5669 40.5679 37.2749 38.2839 39.3909C38.0519 39.6069 37.7399 39.7629 37.4359 39.8789C36.4239 40.2629 35.7599 40.8549 35.9039 42.0549C35.9279 42.2589 35.8319 42.4829 35.7799 42.6909C35.7159 42.9429 35.6439 43.2149 35.3119 43.1909C34.9719 43.1669 34.9759 42.8789 34.9359 42.6269C34.7159 41.2789 34.7159 41.2829 33.3799 41.6909C32.7919 41.8709 32.1919 42.0229 31.5959 42.1869C31.2679 42.2789 30.9159 42.3629 30.7359 41.9829C30.5839 41.6629 30.8439 41.4269 31.0599 41.2469C31.8919 40.5469 32.6639 39.7229 33.5999 39.2069C34.9039 38.4909 35.1479 37.4069 35.0919 36.3069H35.0799ZM36.3959 31.9549C36.0999 33.0029 36.6519 33.5309 37.7239 33.7589C38.3599 33.8949 38.9679 34.1549 39.5839 34.3749C39.9919 34.5229 40.3519 34.4829 40.7079 34.2189C41.8719 33.3469 43.0359 32.4829 44.2159 31.6389C44.7399 31.2669 44.7879 30.8869 44.4519 30.3549C43.6919 29.1589 42.9679 27.9429 42.2399 26.7269C41.9799 26.2869 41.6319 26.1429 41.1439 26.2629C39.8719 26.5669 38.6039 26.8709 37.3279 27.1549C36.7719 27.2789 36.5719 27.6069 36.5599 28.1589C36.5319 29.3909 36.4559 30.6229 36.3959 31.9549ZM24.4679 30.2469C24.4799 30.3429 24.4879 30.4389 24.4999 30.5349C27.8439 31.2109 31.1919 31.8589 34.4799 32.7549C35.0399 32.9069 35.1839 32.5629 35.2519 32.1229C35.4479 30.8589 35.3319 29.5869 35.3479 28.3149C35.3519 27.8189 35.0399 27.6909 34.6119 27.7949C31.2279 28.6109 27.8479 29.4309 24.4679 30.2469ZM53.4279 23.9029C52.8239 23.7309 52.4359 23.8269 52.0519 23.9029C50.2439 24.2669 48.4359 24.6269 46.6319 25.0069C44.3359 25.4909 44.3359 25.4989 45.5199 27.4709C46.8039 29.6189 46.8239 29.6429 48.7799 28.0349C50.3319 26.7549 51.9599 25.5509 53.4319 23.9029H53.4279ZM36.5799 18.0029C36.5799 19.2189 36.5719 20.4349 36.5799 21.6509C36.5959 23.7496 37.6039 24.4789 39.6039 23.8389C39.7079 23.8069 39.8119 23.7789 39.9159 23.7429C40.1759 23.6509 40.2519 23.4629 40.1119 23.2349C39.0359 21.4509 38.0079 19.6309 36.5759 18.0029H36.5799ZM49.0119 38.5309C48.6079 37.7429 48.2399 36.9389 47.7879 36.1749C46.2399 33.5469 46.9999 33.6389 44.3319 35.4949C44.2719 35.5349 44.2159 35.5789 44.1559 35.6229C43.8079 35.8869 43.9039 36.1309 44.2399 36.2709C45.8399 36.9349 47.3039 37.8629 49.0079 38.5309H49.0119Z" fill="#B4B8D8"/>
                            <path d="M92.988 20.8152C92.96 21.5312 92.516 22.0592 92.012 22.5432C90.42 24.0712 88.472 25.0712 86.588 26.1672C85.7667 26.6445 85.6227 27.2845 86.156 28.0872C86.64 28.8112 87.14 29.5232 87.728 30.1752C88.324 30.8352 88.524 31.6192 87.88 32.3392C87.204 33.0952 86.42 32.8472 85.74 32.2992C84.3 31.1392 82.608 30.4752 80.944 29.7512C80.748 29.6672 80.484 29.5192 80.328 29.5872C78.74 30.2592 76.992 30.6432 75.756 31.9592C75.404 32.3352 75.172 32.7232 74.624 32.2832C74.312 32.0352 73.996 32.2352 73.692 32.3312C72.896 32.5832 72.108 32.8552 71.308 33.1032C71.032 33.1872 70.708 33.2872 70.568 32.9112C70.456 32.6152 70.688 32.4352 70.9 32.2952C72.016 31.5472 73.136 30.8032 74.264 30.0712C74.632 29.8312 74.972 29.6272 75.12 29.1512C75.4 28.2632 75.288 27.7312 74.248 27.4952C71.912 26.9632 69.592 26.3432 67.268 25.7512C65.7 25.3512 65.044 24.7952 65.04 23.8832C65.04 22.9192 65.7 22.3512 67.376 22.0432C70.0201 21.5552 72.668 21.0992 75.328 20.6872C76.088 20.5712 76.396 20.2592 76.408 19.4992C76.432 17.7952 76.516 16.0872 76.572 14.3832C76.596 13.6672 76.66 12.9432 77.54 12.7792C78.344 12.6272 78.736 13.1992 79.008 13.8152C79.64 15.2432 80.22 16.6952 80.844 18.1272C81.54 19.7272 81.596 19.7312 83.292 19.4872C85.592 19.1552 87.9 18.8472 90.236 18.9232C90.856 18.9432 91.464 19.0032 92.028 19.3072C92.628 19.6312 92.932 20.1232 92.984 20.8272L92.988 20.8152ZM89.928 21.3152C89.508 21.2512 89.4 21.2112 89.296 21.2232C87.788 21.3952 86.2761 21.5352 84.7761 21.7592C82.68 22.0752 82.52 22.5992 83.904 24.3112C84.124 24.5832 84.324 24.6952 84.636 24.5352C86.388 23.6112 88.108 22.6432 89.928 21.3152ZM80.364 26.4992C81.3 26.5672 81.604 26.1312 81.256 25.3752C80.936 24.6832 80.568 24.0152 80.252 23.3192C80.016 22.7992 79.728 22.4832 79.084 22.6552C78.564 22.7912 77.864 22.7312 77.856 23.4552C77.848 24.1672 77.132 25.0392 77.948 25.5672C78.692 26.0472 79.628 26.2272 80.36 26.4952L80.364 26.4992Z" fill="#B4B8D8"/>
                            <path d="M7.98025 14.5507C8.15225 13.8187 7.70424 13.7747 7.31224 13.6907C5.82424 13.3587 4.32424 13.0707 2.85224 12.6907C1.79624 12.4147 0.396242 12.3147 0.424242 10.8187C0.452242 9.37073 1.82824 9.20273 2.88824 8.93473C4.36424 8.56273 5.86824 8.28273 7.37224 8.05073C8.10424 7.93873 8.40424 7.62673 8.32424 6.91073C8.15224 5.32273 8.00425 3.73473 7.80425 2.15473C7.71225 1.42273 7.70424 0.70673 8.44824 0.35873C9.22824 -0.00927009 9.86825 0.43873 10.3522 1.02273C11.6242 2.56273 12.9042 4.09873 14.0922 5.69873C14.6522 6.45473 15.2483 6.64673 16.1322 6.47073C17.9443 6.10673 19.7722 5.80673 21.6002 5.51073C22.1322 5.42273 22.6842 5.41873 23.2282 5.42273C23.8402 5.42273 24.3882 5.61073 24.6602 6.22673C24.9282 6.83473 24.7042 7.37473 24.3282 7.84673C23.2322 9.22673 21.8202 10.2707 20.4202 11.2947C19.5443 11.9347 19.6202 12.3947 20.3042 13.0827C21.1202 13.9067 21.8883 14.7867 22.6203 15.6827C23.1203 16.2947 23.7042 16.9827 23.1442 17.8267C22.5483 18.7267 21.6922 18.4507 20.8882 18.1387C19.0962 17.4387 17.3042 16.7347 15.5242 16.0027C14.8202 15.7107 14.2362 15.7747 13.6002 16.2267C11.9122 17.4187 10.2202 18.6227 8.44824 19.6747C7.40024 20.2987 6.19224 20.6467 5.05224 21.1107C4.84824 21.1947 4.60824 21.2267 4.46424 21.0067C4.29624 20.7467 4.43625 20.5147 4.62825 20.3307C5.09625 19.8747 5.52024 19.3427 6.06424 18.9987C7.30024 18.2227 7.76825 17.0907 7.85625 15.7187C7.88425 15.2827 7.95224 14.8547 7.98424 14.5547L7.98025 14.5507ZM13.3362 9.15473C12.4842 9.32673 11.6242 9.45873 10.7882 9.68273C9.88824 9.92673 10.1322 10.7787 10.0002 11.4067C9.87224 12.0267 10.3242 12.2067 10.8162 12.3347C11.6202 12.5467 12.4202 12.7787 13.2242 12.9907C13.9362 13.1747 15.5242 12.5787 15.7682 11.9507C16.0562 11.2147 15.2802 10.9187 14.9722 10.4307C14.7802 10.1267 14.5162 9.87073 14.2882 9.58673C14.0402 9.28273 13.7322 9.13073 13.3322 9.15073L13.3362 9.15473ZM21.6642 7.73873L21.5562 7.44273C20.0442 7.75073 18.5282 8.05073 17.0162 8.37073C16.9002 8.39473 16.7002 8.55873 16.7162 8.61873C16.8482 9.21073 17.3282 9.57473 17.6922 10.0147C18.0042 10.3947 18.3242 10.2347 18.6402 10.0027C19.6482 9.25073 20.6602 8.49473 21.6682 7.74273L21.6642 7.73873Z" fill="#B4B8D8"/>
                          </svg>
                          ${lfstlNm}
                          <svg xmlns="http://www.w3.org/2000/svg" width="425" height="29" viewBox="0 0 425 29" fill="none" id="line">
                            <path d="M193.999 11.1631C202.885 11.6292 211.778 11.9438 220.639 12.5909C235.081 13.6421 249.535 14.7548 263.654 17.4499C265.722 17.8419 267.767 18.3846 269.729 19.004C272.235 19.7937 274.085 21.0351 273.907 22.9295C273.728 24.824 271.622 25.7465 269.047 26.2595C264.697 27.1351 260.155 27.4336 255.614 27.7118C235.862 28.9138 216.019 29.159 196.057 28.6384C189.894 28.4771 183.733 28.559 177.582 28.1554C176.383 28.0722 174.456 28.3053 174.32 27.2754C174.161 26.0822 176.101 26.2043 177.482 26.1248C195.529 25.1271 213.658 24.6806 231.765 24.0608C240.58 23.7536 249.398 23.406 258.171 22.1041C255.454 21.7084 252.742 21.2016 250.002 20.9465C222.159 18.3011 194.225 16.5117 166.265 15.5008C147.625 14.8268 128.997 14.2243 110.43 12.4605C109.438 12.368 108.43 12.2645 107.46 12.0617C105.111 11.5739 103.079 10.7888 103.11 8.98789C103.14 7.20716 105.156 6.49263 107.544 6.23306C110.059 5.95991 112.613 5.85083 115.121 5.40517C106.359 5.59366 97.6011 5.70137 88.8654 5.99251C64.4966 6.82059 40.1252 7.69916 15.7658 8.64925C11.9914 8.79557 8.01304 8.60713 4.63173 10.0095C3.40255 10.5122 2.02105 10.2979 1.34112 9.38123C0.425076 8.13822 1.18882 7.15547 3.01564 6.72471C6.62193 5.8607 10.522 5.73109 14.3454 5.55696C53.9107 3.76398 93.5234 2.27729 133.229 1.42335C164.364 0.747647 195.547 0.347921 226.779 0.538078C250.843 0.686453 274.898 1.0065 298.975 1.5302C335.003 2.30613 370.96 4.12144 406.927 6.37265C411.627 6.66987 416.307 7.36096 420.976 7.96031C422.941 8.21528 424.568 8.88794 424.425 10.4096C424.29 11.7696 422.703 12.1623 420.921 12.3423C412.455 13.2147 403.825 12.9949 395.25 12.94C371.629 12.7946 347.987 12.4355 324.357 12.158C302.024 11.8979 279.675 11.6168 257.34 11.397C236.222 11.1906 215.1 11.075 193.996 10.9098C193.992 10.9906 193.988 11.0713 193.983 11.1521L193.999 11.1631ZM392.744 9.13254C304.021 4.28611 215.464 3.53953 127.012 5.29981C215.553 5.76196 304.175 8.00054 392.744 9.13254Z" fill="#B4B8D8"/>
                          </svg>
                        </strong>
                      </div>
                      <img src="/assets/img/lifeStyle/bg_lf_1.svg" alt="">
                    </div>
                    <h2 class="guide--text"><em class="var">[${typeName}]</em> 사용정보를 토대로 분류한 당신의 유형은 아래와 같은 관심사를 보입니다.</h2>
                    <div class="result--area">
                    <!-- ----------------------------------------------------------------------- -->
                    <div class="result--area--inner">
                            <div class="result--area--title">
                            <h3>같은 <em class="var">[${ageGroupName} ${genderName}]</em> 대비 관심분야</h3>
                            </div>
                            <div class="result--area--info">
                            <div class="result--area--info--thumbnail" style="--borderColor:#3B3BE2;--bgColor:#8C8CF2;">
                                    <img src="../assets/img/lifeStyle/ico_result_1.svg" alt="">
                            </div>
                            <div class="result--area--info--table">
                                    <div class="result--area--info--table--name">
                                        ${hatmtFrstTitlNm}
                                        <div class="increase-chart" style="--barColor:#10B981">
                                        <div class="bar" style=""></div>
                                        <div class="bar" style=""></div>
                                        <div class="bar" style=""></div>
                                        <div class="bar" style=""></div>
                                        <div class="bar" style=""></div>
                                    </div>
                                    </div>
                                    <div class="result--area--info--table--counter" data-count="${hatmtFrstRt}"></div>
                                    <div class="result--area--info--table--name">
                                        ${hatmtScndTitlNm}
                                        <div class="increase-chart" style="--barColor:#10B981">
                                        <div class="bar" style=""></div>
                                        <div class="bar" style=""></div>
                                        <div class="bar" style=""></div>
                                        <div class="bar" style=""></div>
                                        <div class="bar" style=""></div>
                                    </div>
                                        </div>
                                    <div class="result--area--info--table--counter" data-count="${hatmtScndRt}"></div>
                            </div>
                            </div>
                    </div>
                    <!-- ----------------------------------------------------------------------- -->
                    <div class="result--area--inner">
                            <div class="result--area--title">
                            <h3>같은 <em class="var">[${ageGroupName} ${genderName}]</em> 대비 낮은 관심분야</h3>
                            </div>
                            <div class="result--area--info">
                            <div class="result--area--info--thumbnail" style="--borderColor:#7C0A38;--bgColor:#DD2E74;">
                                    <img src="../assets/img/lifeStyle/ico_result_2.svg" alt="">
                            </div>
                            <div class="result--area--info--table">
                                    <div class="result--area--info--table--name">
                                    ${latmtFrstTitlNm}
                                        <div class="increase-chart" style="--barColor:#EF4444">
                                                <div class="bar" style="--barHeight:55%"></div>
                                                <div class="bar" style="--barHeight:45%"></div>
                                                <div class="bar" style="--barHeight:35%"></div>
                                                <div class="bar" style="--barHeight:25%"></div>
                                                <div class="bar" style="--barHeight:15%"></div>
                                        </div>
                                    </div>
                                    <div class="result--area--info--table--counter" data-count="${latmtFrstRt}"></div>
                                    <div class="result--area--info--table--name">
                                    ${latmtScndTitlNm}
                                        <div class="increase-chart" style="--barColor:#EF4444">
                                                <div class="bar" style="--barHeight:55%"></div>
                                                <div class="bar" style="--barHeight:45%"></div>
                                                <div class="bar" style="--barHeight:35%"></div>
                                                <div class="bar" style="--barHeight:25%"></div>
                                                <div class="bar" style="--barHeight:15%"></div>
                                        </div>
                                    </div>
                                    <div class="result--area--info--table--counter" data-count="${latmtScndRt}"></div>
                            </div>
                            </div>
                    </div>
                    </div>
                    <!-- ----------------------------------------------------------------------- -->
            </article>
            <article>
                
                    <h2 class="guide--text">당신의 유형은 아래와 같은 보험특성을 보입니다.</h2>
                    <div class="result--area">
                    <!-- ----------------------------------------------------------------------- -->
                    <div class="result--area--inner">
                            <div class="result--area--title">
                            <h3>보험가입정보</h3>
                            </div>
                            <div class="result--area--info">
                            <div class="result--area--info--thumbnail" style="--borderColor:#0D6EEC;--bgColor:#4AB4FF;">
                                    <img src="../assets/img/lifeStyle/ico_result_3.svg" alt="">
                            </div>
                            <div class="result--area--info--table" style="--rows:5">
                                    <div class="result--area--info--table--name">종신보험</div>
                                    <div class="result--area--info--table--rating">
                                        ${updateScoreDisplay(cntrWlinsuScor)}
                                    <fieldset class="rating" data-rating="${cntrWlinsuScor}">
                                            ${generateRatingStars(
                                              cntrWlinsuScor,
                                              "cntrWlinsuScor"
                                            )}
                                    </fieldset>
                                    </div>
                                    <div class="result--area--info--table--name">암보험</div>
                                    <div class="result--area--info--table--rating">
                                    ${updateScoreDisplay(cntrCninsuScor)}
                                    <fieldset class="rating" data-rating="${cntrCninsuScor}">
                                            ${generateRatingStars(
                                              cntrCninsuScor,
                                              "cntrCninsuScor"
                                            )}
                                    </fieldset>
                                    </div>
                                    <div class="result--area--info--table--name">연금보험</div>
                                    <div class="result--area--info--table--rating">
                                    ${updateScoreDisplay(cntrPsinsuScor)}
                                    <fieldset class="rating" data-rating="${cntrPsinsuScor}">
                                            ${generateRatingStars(
                                              cntrPsinsuScor,
                                              "cntrPsinsuScor"
                                            )}
                                    </fieldset>
                                    </div>
                                    <div class="result--area--info--table--name">상해보험</div>
                                    <div class="result--area--info--table--rating">
                                    ${updateScoreDisplay(cntrljinsuScor)}
                                    <fieldset class="rating" data-rating="${cntrljinsuScor}">
                                            ${generateRatingStars(
                                              cntrljinsuScor,
                                              "cntrljinsuScor"
                                            )}
                                    </fieldset>
                                    </div>
                                    <div class="result--area--info--table--name">질병보험</div>
                                    <div class="result--area--info--table--rating">
                                    ${updateScoreDisplay(cntrDsinsuScor)}
                                    <fieldset class="rating" data-rating="${cntrDsinsuScor}">
                                            ${generateRatingStars(
                                              cntrDsinsuScor,
                                              "cntrDsinsuScor"
                                            )}
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
                            <div class="result--area--info--thumbnail" style="--borderColor:#059669;--bgColor:#6ED5AF;">
                                    <img src="../assets/img/lifeStyle/ico_result_4.svg" alt="">
                            </div>
                            <div class="result--area--info--table" style="--rows:4">
                                    <div class="result--area--info--table--name">암 발생률</div>
                                    <div class="result--area--info--table--rating">
                                    ${updateScoreDisplay(acdtCnillOccrRtScor)}
                                            <fieldset class="rating" data-rating="${acdtCnillOccrRtScor}">
                                            
                                            ${generateRatingStars(
                                              acdtCnillOccrRtScor,
                                              "acdtCnillOccrRtScor"
                                            )}
                                            </fieldset>
                                    </div>
                                    <div class="result--area--info--table--name">질병 발생률</div>
                                    <div class="result--area--info--table--rating">
                                    ${updateScoreDisplay(acdtDissHsptzRtScor)}
                                            <fieldset class="rating" data-rating="${acdtDissHsptzRtScor}">
                                           
                                            ${generateRatingStars(
                                              acdtDissHsptzRtScor,
                                              "acdtDissHsptzRtScor"
                                            )}
                                            </fieldset>
                                    </div>
                                    <div class="result--area--info--table--name">상해 입원률</div>
                                    <div class="result--area--info--table--rating">
                                    ${updateScoreDisplay(acdtInjrHsptzRtScor)}
                                            <fieldset class="rating" data-rating="${acdtInjrHsptzRtScor}">
                                           
                                            ${generateRatingStars(
                                              acdtInjrHsptzRtScor,
                                              "acdtInjrHsptzRtScor"
                                            )}
                                            </fieldset>
                                    </div>
                                    <div class="result--area--info--table--name">상해 수술률</div>
                                    <div class="result--area--info--table--rating">
                                    ${updateScoreDisplay(acdtInjrSrgRtScor)}
                                            <fieldset class="rating" data-rating="${acdtInjrSrgRtScor}">
                                           
                                            ${generateRatingStars(
                                              acdtInjrSrgRtScor,
                                              "acdtInjrSrgRtScor"
                                            )}
                                            </fieldset>
                                    </div>
                            </div>
                            </div>
                    </div>
                    <!-- ----------------------------------------------------------------------- -->
                    </div>
            </article>
            <article>
                    <h2 class="guide--text">당신이 속한 라이프스타일 그룹이 갖는 보험특성에 따라 추천드리는 보험은 아래와 같습니다.</h2>
                    <div class="result--last--container">
                    <div class="user--target">
                            <span>추천보험</span>
                            <p>상해보험, 연금보험</p>
                    </div>
                    <div class="result--last--info">
                        [${ageGroupName} ${genderName}] ${rcmdInsuCtt}
                    </div>
                    </div>
            </article>
            
    `;
}
