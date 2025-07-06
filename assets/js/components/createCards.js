const IMAGE_PROXY = '../assets/img/lifeStyle/';

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
      <div class="life-style-header">
        <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="0.400391" width="10" height="10" rx="2" fill="#A3A3A3"/>
        </svg>
        <p>${item.name}</p>
      </div>
      <div id="${item.id}" class="range--item rslider"></div>
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
}
