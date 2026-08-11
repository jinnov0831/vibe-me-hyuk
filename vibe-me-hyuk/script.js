document.querySelector('#contactBtn')
document.querySelector('.card')
document.querySelector('h1')
document.querySelector('.links a')

const btn = document.querySelector('#contactBtn');
const title = document.querySelector('h1');

btn.addEventListener('click', () => {
    title.textContent = '반갑습니다!';
});
