const skeletonConfig = {
  step01: {
    template: () => {
      return ` <div class="image"></div>
            <div class="line--wrap">
              <p class="line"></p>
              <p class="line long"></p>
            </div>
          `;
    },
  },
  step02: {
    template: () => {
      return ` <div class="image"></div>
            <p class="line"></p>
          `;
    },
  },
  step03: {
    template: () => {
      return ` 
            <p class="line"></p>
            <div class="image"></div>
          `;
    },
  },
  step04: {
    template: () => {
      return ` 
            <p class="line"></p>
            <div class="image"></div>
          `;
    },
  },
};

export default function skeletonUI(step, wrapper, column) {
  const config = skeletonConfig[step];
  let skeleton = "";
  for (let i = 0; i < column; i++) {
    skeleton += `<button class="card skeleton ${step}">
        ${config.template()}
      </button>`;
  }
  wrapper.innerHTML = skeleton;
}
