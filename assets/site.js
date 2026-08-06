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
// lightbox for the Realisaties gallery
(function(){
  const links=document.querySelectorAll('.gallery a');
  if(!links.length) return;
  const box=document.createElement('div');
  box.className='lightbox';
  box.innerHTML='<button class="lb-close" aria-label="Sluiten">&times;</button>'+
    '<button class="lb-prev" aria-label="Vorige">&#10094;</button>'+
    '<img alt=""><button class="lb-next" aria-label="Volgende">&#10095;</button>'+
    '<div class="lb-cap"></div>';
  document.body.appendChild(box);
  const img=box.querySelector('img'), cap=box.querySelector('.lb-cap');
  let i=0;
  const imgs=[...links].map(a=>a.querySelector('img')).filter(Boolean);
  function show(n){
    i=(n+imgs.length)%imgs.length;
    img.src=imgs[i].src; img.alt=imgs[i].alt||'';
    cap.textContent=imgs[i].alt||'';
  }
  function open(n){ show(n); box.classList.add('on'); document.body.style.overflow='hidden'; }
  function close(){ box.classList.remove('on'); document.body.style.overflow=''; }
  links.forEach((a,n)=>a.addEventListener('click',e=>{e.preventDefault();open(n);}));
  box.querySelector('.lb-close').addEventListener('click',close);
  box.querySelector('.lb-prev').addEventListener('click',e=>{e.stopPropagation();show(i-1);});
  box.querySelector('.lb-next').addEventListener('click',e=>{e.stopPropagation();show(i+1);});
  box.addEventListener('click',e=>{if(e.target===box)close();});
  addEventListener('keydown',e=>{
    if(!box.classList.contains('on'))return;
    if(e.key==='Escape')close();
    if(e.key==='ArrowLeft')show(i-1);
    if(e.key==='ArrowRight')show(i+1);
  });
})();
