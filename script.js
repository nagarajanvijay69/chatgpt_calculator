const output = document.getElementById('output');
const history = document.getElementById('history');
const keys = document.querySelector('.keys');
let expression = '';
let justEvaluated = false;
const render = () => { output.textContent = expression || '0'; };
function append(value) {
  if (justEvaluated && /[0-9.]/.test(value)) expression = '';
  justEvaluated = false;
  const last = expression.slice(-1);
  if (['+','-','×','÷'].includes(value)) {
    if (!expression && value !== '-') return;
    if (['+','-','×','÷'].includes(last)) expression = expression.slice(0,-1);
  }
  if (value === '.') {
    const current = expression.split(/[+\-×÷%]/).pop();
    if (current.includes('.')) return;
    if (!current) expression += '0';
  }
  expression += value; render();
}
function calculate() {
  if (!expression) return;
  try {
    let safe = expression.replace(/×/g,'*').replace(/÷/g,'/');
    safe = safe.replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');
    if (!/^[0-9+*/().\-\s]+$/.test(safe)) throw new Error('Invalid');
    const result = Function('"use strict"; return (' + safe + ')')();
    if (!Number.isFinite(result)) throw new Error('Math error');
    history.textContent = expression + ' =';
    expression = String(Number(result.toPrecision(12)));
    justEvaluated = true; render();
  } catch {
    output.textContent = 'Error'; expression = ''; justEvaluated = true;
  }
}
function act(action) {
  if (action === 'clear') { expression=''; history.textContent=''; justEvaluated=false; }
  if (action === 'delete') { expression=expression.slice(0,-1); justEvaluated=false; }
  if (action === 'equals') return calculate();
  if (action === 'sign' && expression) {
    const match = expression.match(/(\d*\.?\d+)$/);
    if (match) {
      const start = expression.length - match[0].length;
      expression = expression.slice(0,start) + (match[0].startsWith('-') ? match[0].slice(1) : '-' + match[0]);
    }
  }
  render();
}
keys.addEventListener('click',event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.action) act(button.dataset.action);
  else append(button.dataset.value);
});
document.addEventListener('keydown',event => {
  if (/^[0-9.]$/.test(event.key)) append(event.key);
  else if (event.key === '+') append('+');
  else if (event.key === '-') append('-');
  else if (event.key === '*') append('×');
  else if (event.key === '/') { event.preventDefault(); append('÷'); }
  else if (event.key === '%') append('%');
  else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); calculate(); }
  else if (event.key === 'Backspace') act('delete');
  else if (event.key === 'Escape') act('clear');
});
document.getElementById('themeBtn').addEventListener('click',() => { document.body.classList.toggle('light'); });
render();