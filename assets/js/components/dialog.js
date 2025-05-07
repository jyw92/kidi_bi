export default function Dialog({initialState, onClick}){
  this.state = initialState;
  this.onClick = onClick;

  this.setState = (newState) => {
    this.state = newState;
  }
}