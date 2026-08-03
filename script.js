// Simple calculator logic
const display = document.querySelector('.display');
const buttons = document.querySelectorAll('.btn');

function setDisplay(val){
  display.value = String(val);
}

function appendValue(val){
  if(display.value === '0' && val !== '.') setDisplay(val);
  else setDisplay(display.value + val);
}

function clearDisplay(){
  setDisplay('0');
}

function deleteLast(){
  if(display.value.length <= 1) { setDisplay('0'); return; }
  setDisplay(display.value.slice(0, -1));
}

function togglePlusMinus(){
  // Flip sign of the last number in the expression
  const expr = display.value;
  // find last number using regex
  const match = expr.match(/(-?\d+(\.\d+)?)$/);
  if(!match) return;
  const num = match[0];
  const start = match.index;
  const flipped = String(Number(num) * -1);
  const newExpr = expr.slice(0, start) + flipped;
  setDisplay(newExpr);
}

function percent(){
  try {
    const value = evaluateExpression(display.value);
    setDisplay(value / 100);
  } catch {
    setDisplay('Error');
  }
}

function evaluateExpression(expr){
  // replace nice symbols with JS operators
  let sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  // allow only digits, operators, parentheses, dot, space, percent sign handled separately
  if(!/^[0-9+\-*/().\s%]+$/.test(sanitized)){
    throw new Error('Invalid characters');
  }
  // evaluate safely using Function
  // eslint-disable-next-line no-new-func
  const fn = new Function('return ' + sanitized);
  const result = fn();
  if(result === Infinity || result === -Infinity || Number.isNaN(result)) throw new Error('Math error');
  // trim floating rounding artifacts
  return Math.round((result + Number.EPSILON) * 1e12) / 1e12;
}

function handleEquals(){
  try {
    const val = evaluateExpression(display.value);
    setDisplay(val);
  } catch(err) {
    setDisplay('Error');
  }
}

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const v = btn.getAttribute('data-value');
    const action = btn.getAttribute('data-action');
    if(v){
      appendValue(v);
    } else if(action){
      if(action === 'clear') clearDisplay();
      else if(action === 'delete') deleteLast();
      else if(action === 'plus-minus') togglePlusMinus();
      else if(action === 'percent') percent();
      else if(action === 'equals') handleEquals();
    }
  });
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  if((e.key >= '0' && e.key <= '9') || '+-*/().'.includes(e.key)){
    appendValue(e.key);
    e.preventDefault();
    return;
  }
  if(e.key === 'Enter'){
    handleEquals();
    e.preventDefault();
    return;
  }
  if(e.key === 'Backspace'){
    deleteLast();
    e.preventDefault();
    return;
  }
  if(e.key === 'Escape'){
    clearDisplay();
    e.preventDefault();
    return;
  }
});

// Initialize
clearDisplay();