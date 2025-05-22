
export default class Dialog {
  constructor() {
    this.$dialog = document.querySelector('dialog');
  }
  async open() {
    document.body.style.overflow = 'hidden'
    this.$dialog.showModal();
  }
  close() {
    this.$dialog.close();
  }
}