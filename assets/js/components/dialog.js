
export default class Dialog {
  constructor() {
    this.$dialog = document.querySelector('dialog');
    this.$contentMainInfo = document.querySelector('.content--main--info');
  }
  async open() {
    document.body.style.overflow = 'hidden'
    this.$contentMainInfo.classList.add('open');
    this.$dialog.showModal();
  }
  close() {
    this.$contentMainInfo.classList.remove('open');
    document.body.style.overflow = 'auto'
    this.$dialog.close();
  }
}