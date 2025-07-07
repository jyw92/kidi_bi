import categoryIdToName from "./categoryIdToName.js";

const IMAGE_PROXY = '../assets/img/lifeStyle/';
const accordionButtonIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
    <g clip-path="url(#clip0_1875_50267)">
    <path d="M8.00078 14.6997L13.4008 9.29971L18.8008 14.6997" stroke="#0069F6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13.4016 1.19961C6.93983 1.19961 1.70156 6.43788 1.70156 12.8996C1.70156 19.3613 6.93983 24.5996 13.4016 24.5996C19.8633 24.5996 25.1016 19.3613 25.1016 12.8996C25.1016 6.43788 19.8633 1.19961 13.4016 1.19961Z" stroke="#0069F6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <defs>
    <clipPath id="clip0_1875_50267">
    <rect width="25.2" height="25.2" fill="white" transform="translate(26 25.5) rotate(-180)"/>
    </clipPath>
    </defs>
  </svg>
` 

function accordion(e){
  const target = e.target;
  target.classList.toggle('close');
}


const cardConfig = {
  step01: {
    containerSelector: '.card--container',
    dataAttribute: 'type',
    dataAttributeName: 'type-name',
    template: (item) => `
      <img src="${IMAGE_PROXY}${item.image}" alt="">
      <div class="card--info">
        <strong>${item.name}</strong>
        <p>${item.desc}</p>
        <span class="card__body-cover-checkbox">
          <svg class="card__body-cover-checkbox--svg" viewBox="0 0 12 10">
            <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
          </svg>
        </span>
      </div>
    `,
  },
  step02: {
    containerSelector: '.gender--area .card--container',
    dataAttribute: 'gender',
    dataAttributeName: 'gender-name',
    template: (item) => `
      <img src="${IMAGE_PROXY}${item.image}" alt="">${item.name}
      <span class="card__body-cover-checkbox">
        <svg class="card__body-cover-checkbox--svg" viewBox="0 0 12 10">
          <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
        </svg>
      </span>
    `,
  },
  step03: {
    containerSelector: '.age--area .card--container',
    dataAttribute: 'age-group',
    dataAttributeName: 'age-group-name',
    template: (item) => `
      <img src="${IMAGE_PROXY}${item.image}" alt="">${item.name}
      <span class="card__body-cover-checkbox">
        <svg class="card__body-cover-checkbox--svg" viewBox="0 0 12 10">
          <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
        </svg>
      </span>
    `,
  },
  step04: {
    containerSelector: '.card--container',
    dataAttribute: 'life-style',
    dataAttributeName: 'life-style-name',
    template: (item) => `
      <div class="category--box">
        <button type="button" class="category--name">
          <span>${categoryIdToName(item.id)}</span>
          ${accordionButtonIcon}
          </button>
        <div class="category--group">
          ${
            item.children.map((card, index) => {
              return `
                <div class="category--slider--item" data-life-style="${card.id}">
                    <div class="life-style-header">
                        <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect y="0.400391" width="10" height="10" rx="2" fill="#A3A3A3"/>
                        </svg>
                        <p>${card.name}</p>
                    </div>
                    <div class="range--item rslider"></div>
                </div>
              `
            }).join('')
          }
        </div>
      </div>
    `,
  },
};

export default async function createCards(step, data) {
  const config = cardConfig[step];
  if (!config || !config.containerSelector) {
    console.error(`Configuration for step "${step}" not found.`);
    return;
  }

  const cardContainer = document.querySelector(config.containerSelector);
  if (!cardContainer) {
    console.error(`Container with selector "${config.containerSelector}" not found.`);
    return;
  }

  cardContainer.innerHTML = '';
  console.log('data', data);

  cardContainer.innerHTML = data
    .map((item) => {
      const attributes = `data-${config.dataAttribute}="${item.id}" data-${config.dataAttributeName}="${item.name}"`;
      const content = config.template(item);

      if (step === 'step04') {
        return `<div class="category-card" ${attributes}>${content}</div>`;
      } else {
        return `<button class="card" ${attributes}>${content}</button>`;
      }
    })
    .join('');

    if (step === 'step04' && !cardContainer.dataset.listenerAdded) {
      cardContainer.dataset.listenerAdded = true;

      document.addEventListener('click', (e) => {
        // 클릭된 요소 또는 그 부모 중에 '.category--name' 버튼을 찾습니다.
        const button = e.target.closest('.category--name');
    
        // 버튼이 클릭된 게 아니면 아무것도 하지 않습니다.
        if (!button || !cardContainer.contains(button)) {
          return;
        }
    
        // 버튼의 부모인 '.category--box'를 찾습니다.
        const categoryBox = button.parentElement;
    
        // 'open' 클래스를 토글하여 아코디언을 열고 닫습니다.
        categoryBox.classList.toggle('close');
      });
    }

    

}
