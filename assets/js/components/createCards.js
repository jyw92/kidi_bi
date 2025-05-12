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
     <div class="category-header">
        <div class="checkbox-wrapper">
          <input type="checkbox" class="category-checkbox" id="checkbox-life">
          <span class="checkmark"></span>
        </div>
        <span class="category-name">${item.name}</span>
      </div>
      <div class="subcategories">
        ${item.children
          .map((radio, index) => {
            return `
            <div class="subcategory">
              <div class="radio-wrapper">
                <input
                  type="radio"
                  class="subcategory-radio"
                  name="subcategory-${item.id}"
                  id="radio-${item.id}${index}"
                  data-id="${radio.id}"
                  value="${radio.name}"
                  data-image="${radio.image}"
                  data-life-style="${radio.id}" 
                  data-life-style-name="${radio.name}"
                  disabled=""
                /><span class="radio-mark"></span>
              </div>
              <label class="subcategory-name" for="radio-${item.id}${index}">${radio.name}</label>
            </div>
          `;
          })
          .join('')}
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
}
