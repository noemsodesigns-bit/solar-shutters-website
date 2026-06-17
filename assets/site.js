// mobile menu
const t=document.getElementById('toggle'),m=document.getElementById('menu');
t&&t.addEventListener('click',()=>m.classList.toggle('open'));
m&&m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>m.classList.remove('open')));
// nav shadow
const nav=document.getElementById('nav');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>20));
// reveal on scroll
const io=new IntersectionObserver((es)=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
