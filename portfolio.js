/* Decorative ETL lineage. The foreground diagram carries the accessible explanation. */
(() => {
  const canvas = document.getElementById('dagCanvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const theme = matchMedia('(prefers-color-scheme: dark)');
  let width, height, colors, nodes = [], edges = [], frame = 0;
  const stages = [
    [['source.erp', 'order_id · updated_at'], ['source.events', 'event_id · payload']],
    [['bronze.orders', 'CDC · append-only'], ['bronze.events', 'Auto Loader · schema']],
    [['silver.orders', 'dedupe · quality checks'], ['silver.activity', 'join · normalize']],
    [['gold.revenue', 'aggregate · Delta'], ['gold.features', 'curated · optimize']],
    [['serve.analytics', 'BI · business metrics'], ['serve.intelligence', 'embeddings · RAG']]
  ];
  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement);
    colors = Object.fromEntries(['bg', 'border', 'text-dim', 'teal', 'orange'].map(k => [k, css.getPropertyValue('--' + k).trim()]));
    nodes = []; edges = [];
    const mobile = width < 720;
    stages.forEach((stage, col) => stage.forEach(([label, detail], row) => {
      const node = {label, detail, x: mobile ? (row ? width - 147 : 12) : col * (width + 110) / 4 - 130, y: mobile ? 90 + col * (height - 150) / 5 : 135 + row * height * .55 + Math.sin(col * 1.8) * 55, w: mobile ? 125 : 157, h: 58};
      nodes.push(node);
      if(col) edges.push([nodes[(col - 1) * 2 + row], node]);
      if(col === 2) edges.push([nodes[2], node]);
    }));
    draw(performance.now());
  }
  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    const mobile = width < 720;
    edges.forEach(([a,b], i) => {
      const x1 = mobile ? a.x + a.w / 2 : a.x + a.w, y1 = mobile ? a.y + a.h : a.y + a.h / 2;
      const x2 = mobile ? b.x + b.w / 2 : b.x, y2 = mobile ? b.y : b.y + b.h / 2;
      const c1x = mobile ? x1 : (x1+x2)/2, c1y = mobile ? (y1+y2)/2 : y1;
      const c2x = mobile ? x2 : (x1+x2)/2, c2y = mobile ? (y1+y2)/2 : y2;
      ctx.strokeStyle = colors.border; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.bezierCurveTo(c1x,c1y,c2x,c2y,x2,y2); ctx.stroke();
      if (!motion.matches) {
        const t = (time / 8500 + i * .137) % 1, u = 1-t;
        const x = u*u*u*x1 + 3*u*u*t*c1x + 3*u*t*t*c2x + t*t*t*x2;
        const y = u*u*u*y1 + 3*u*u*t*c1y + 3*u*t*t*c2y + t*t*t*y2;
        ctx.fillStyle = i % 4 ? colors.teal : colors.orange;ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();
      }
    });
    nodes.forEach(n => {
      ctx.fillStyle = colors.bg;ctx.strokeStyle = colors.border;ctx.beginPath();ctx.roundRect(n.x,n.y,n.w,n.h,5);ctx.fill();ctx.stroke();
      ctx.fillStyle = colors['text-dim'];ctx.font = '10px Consolas, monospace';ctx.fillText(n.label,n.x+10,n.y+21);
      ctx.globalAlpha = .7;ctx.font = '8px Consolas, monospace';ctx.fillText(n.detail,n.x+10,n.y+40);ctx.globalAlpha = 1;
    });
  }
  function tick(time){draw(time);frame=requestAnimationFrame(tick);}
  function sync(){cancelAnimationFrame(frame);resize();if(!motion.matches&&!document.hidden)frame=requestAnimationFrame(tick);}
  addEventListener('resize',sync);theme.addEventListener('change',sync);motion.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
})();

(() => {
  const button = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.nav-center');
  function close(){button.setAttribute('aria-expanded','false');menu.classList.remove('is-open');}
  button.addEventListener('click',() => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded',String(open));menu.classList.toggle('is-open',open);
  });
  menu.addEventListener('click',e => {if(e.target.closest('a'))close();});
  document.addEventListener('keydown',e => {if(e.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){close();button.focus();}});
  document.addEventListener('click',e => {if(!e.target.closest('nav'))close();});
  matchMedia('(min-width: 721px)').addEventListener('change',close);
  const links = [...menu.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('section[id]')];
  const bar = document.getElementById('scrollProgress');
  function update(){
    const total=document.documentElement.scrollHeight-innerHeight;
    bar.style.width=(total>0?scrollY/total*100:0)+'%';
    let current='';sections.forEach(s=>{if(s.getBoundingClientRect().top<=160)current=s.id;});
    links.forEach(a=>{const active=a.hash==='#'+current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  }
  addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
  // Pause native SVG motion too when the reader prefers reduced motion or the tab is hidden.
  const svg=document.querySelector('.pipeline-svg');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  function syncMotion(){if(reduce.matches||document.hidden)svg.pauseAnimations();else svg.unpauseAnimations();}
  reduce.addEventListener('change',syncMotion);document.addEventListener('visibilitychange',syncMotion);syncMotion();
})();
