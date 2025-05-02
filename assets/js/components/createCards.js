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
      </div>
    `,
  },
  step02: {
    containerSelector: '.gender--area .card--container',
    dataAttribute: 'gender',
    dataAttributeName: 'gender-name',
    template: (item) => `
      <img src="${IMAGE_PROXY}${item.image}" alt="">${item.name}
    `,
  },
  step03: {
    containerSelector: '.age--area .card--container',
    dataAttribute: 'age-group',
    dataAttributeName: 'age-group-name',
    template: (item) => `
      <img src="${IMAGE_PROXY}${item.image}" alt="">${item.name}
    `,
  },
  step04: {
    containerSelector: '.card--container',
    dataAttribute: 'life-style',
    dataAttributeName: 'life-style-name',
    template: (item) => `
      <p>${item.name}</p>
      <img src="${IMAGE_PROXY}${item.image}" alt="">
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
        .map(
            (item) => `
        <button class="card" data-${config.dataAttribute}="${item.id}" data-${config.dataAttributeName}="${item.name}">
            ${config.template(item)}
        </button>
    `
        )
        .join('');
}
