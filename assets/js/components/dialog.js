
export default class Dialog {
  constructor() {
    this.$dialog = document.querySelector('dialog');
  }
  async open() {
    this.$dialog.classList.add('open');
    this.$dialog.showModal();
  }
  close() {
    this.$dialog.classList.remove('open');
    this.$dialog.close();
  }
}