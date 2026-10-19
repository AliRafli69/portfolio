const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow='<span aria-hidden="true">↗</span>';
const icons={arrow:'M6 18 18 6M6 6h12v12',close:'m6 6 12 12M18 6 6 18',plus:'M12 5v14M5 12h14',minus:'M5 12h14',previous:'m15 6-6 6 6 6',next:'m9 6 6 6-6 6'};
const icon=name=>`<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name]}"/></svg>`;
const status=$('#global-status');
let content={projects:[],experiences:[],gear:[]},media={};
const loadJSON=async path=>{const response=await fetch(new URL(path,document.baseURI));if(!response.ok)throw Error('Could not load '+path);return response.json();};
try{[content,media]=await Promise.all([loadJSON('assets/portfolio-content.json'),loadJSON('assets/media-map.json')]);}catch{status.textContent='Some details could not load. Refresh the page to try again.';}

function updateMedia(root=document){
 $$('img',root).forEach(img=>{img.onerror=()=>{img.onerror=null;const figure=img.closest('figure');if(figure)figure.hidden=true;else img.hidden=true;};});
}
updateMedia();
document.documentElement.dataset.mediaReady='true';
function mediaFigure(key,className=''){
 const m=media[key];if(!m?.items?.length)return '';
 return `<div class="media-gallery ${className}">${m.items.map((item,index)=>`<figure class="gallery-item">${item.type==='video'?`<video controls preload="metadata" playsinline poster="${escapeHTML(item.poster)}" aria-label="${escapeHTML(item.title)}"><source src="${escapeHTML(item.src)}" type="video/mp4">Your browser does not support this video.</video>`:`<button class="image-open" type="button" data-image="${escapeHTML(key)}" data-index="${index}" aria-label="Enlarge ${escapeHTML(item.title)}"><img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.title)}" width="${item.width}" height="${item.height}"><span class="image-zoom" aria-hidden="true">${icon('arrow')}</span></button>`}<figcaption>${escapeHTML(item.caption)}</figcaption></figure>`).join('')}</div>`;
}

const menu=$('#menu-toggle'),mobileNav=$('#mobile-nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');mobileNav.hidden=true;menu.innerHTML='Menu <span aria-hidden="true">+</span>';}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));mobileNav.hidden=open;menu.innerHTML=(open?'Menu':'Close')+' <span aria-hidden="true">'+(open?'+':'−')+'</span>';});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();$$('.cv-download').forEach(d=>d.open=false);}});
document.addEventListener('click',e=>{$$('.cv-download[open]').forEach(d=>{if(!d.contains(e.target))d.open=false;});});
matchMedia('(min-width:64rem)').addEventListener('change',e=>{if(e.matches)closeMenu();});

const dialog=$('#detail-dialog'),dialogContent=$('#detail-content'),dialogLabel=$('#dialog-label');
let restoreFocus=null,activeProject=null,returnStory=null,currentGallery=null,returnGallery=null,viewerKey=null;
function showDialog(label,markup,{remember=true}={}){
 if(remember&&!dialog.open)restoreFocus=document.activeElement;
 dialogLabel.textContent=label;dialogContent.innerHTML=markup;updateMedia(dialogContent);
 if(!dialog.open)dialog.showModal();dialog.scrollTop=0;document.body.style.overflowY='hidden';$('#detail-close').focus({preventScroll:true});
}
function renderProject(id){
 const p=content.projects.find(p=>p.id===id);if(!p)return false;
 const sections=[['The idea',p.motivation],['My contribution',p.contribution],['The approach',p.approach],['Where it stands',p.outcome],['What I’m learning',p.reflection]];
 showDialog('Project notes',`<article class="story"><header class="story-header"><span class="meta">${escapeHTML(p.category)} · ${escapeHTML(p.date)} · ${escapeHTML(p.status)}</span><h2 id="detail-title" tabindex="-1">${escapeHTML(p.title)}</h2><p>${escapeHTML(p.summary)}</p><p class="story-role">My part: ${escapeHTML(p.role)}</p></header>${mediaFigure(p.media,'story-figure')}<div class="story-copy">${sections.map(([h,t])=>`<section><h3>${escapeHTML(h)}</h3><p>${escapeHTML(t)}</p>${h==='The approach'&&p.flow?`<ol class="workflow" aria-label="Project workflow">${p.flow.map(s=>`<li>${escapeHTML(s)}</li>`).join('')}</ol>`:''}</section>`).join('')}</div><div class="story-tags" aria-label="Tools and topics">${p.tools.map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div><div class="story-links">${p.links.map(([text,url])=>`<a class="button" href="${escapeHTML(url)}" ${url.startsWith('http')?'target="_blank" rel="noopener noreferrer"':''}>${escapeHTML(text)} ${arrow}</a>`).join('')}${p.id==='mordred'?'':`<a class="text-link" href="projects.html?project=${p.id}" data-copy-project="${p.id}">Copy project link ${arrow}</a>`}</div>${p.sourceNote?`<p class="story-note">${escapeHTML(p.sourceNote)}</p>`:''}<p class="feedback" role="status" aria-live="polite"></p></article>`);
 activeProject=id;return true;
}
function openProject(id,push=true){if(!renderProject(id))return;if(push){const url=new URL(location.href);url.searchParams.set('project',id);history.pushState({project:id},'',url);}returnStory=null;currentGallery=null;returnGallery=null;}
function openGallery(key){const m=media[key];if(!m)return;activeProject=null;currentGallery=key;showDialog('Photo album',`<div class="lightbox"><h2 id="detail-title">${escapeHTML(m.title)}</h2>${mediaFigure(key)}</div>`);}
function openImage(key,index){
 const m=media[key],item=m?.items[index];if(!item||item.type!=='image')return;
 viewerKey=key;const indices=m.items.map((v,i)=>v.type==='image'?i:-1).filter(i=>i>=0);const position=indices.indexOf(index);
 showDialog('Image viewer',`<div class="lightbox single-image"><h2 id="detail-title">${escapeHTML(item.title)}</h2>${indices.length>1?`<div class="viewer-controls"><button class="viewer-button" type="button" data-view-index="${indices[(position-1+indices.length)%indices.length]}" aria-label="Previous image">${icon('previous')}</button><span class="small muted">${position+1} / ${indices.length}</span><button class="viewer-button" type="button" data-view-index="${indices[(position+1)%indices.length]}" aria-label="Next image">${icon('next')}</button></div>`:''}<figure class="media"><img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.title)}" width="${item.width}" height="${item.height}"><figcaption>${escapeHTML(item.caption)}</figcaption></figure>${returnStory||returnGallery?'<button class="text-link" data-back-story type="button">← '+(returnStory?'Back to project':'Back to album')+'</button>':''}</div>`);
}
function clearProjectURL(){const url=new URL(location.href);if(url.searchParams.has('project')){url.searchParams.delete('project');history.replaceState({},'',url);}}
function closeDialog(){
 if(returnStory){const id=returnStory;returnStory=null;renderProject(id);return;}
 if(returnGallery){const key=returnGallery;returnGallery=null;openGallery(key);return;}
 activeProject=null;currentGallery=null;dialog.close();clearProjectURL();
}
$('#detail-close').addEventListener('click',closeDialog);
dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
dialog.addEventListener('close',()=>{$$('video',dialog).forEach(v=>v.pause());document.body.style.overflowY='';if(restoreFocus?.isConnected)restoreFocus.focus({preventScroll:true});});
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();});
addEventListener('popstate',()=>{const id=new URL(location.href).searchParams.get('project');if(id)openProject(id,false);else{activeProject=null;returnStory=null;if(dialog.open)dialog.close();}});

document.addEventListener('click',async e=>{
 const project=e.target.closest('[data-project]');if(project){if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();openProject(project.dataset.project);return;}
 const copyLink=e.target.closest('[data-copy-project]');if(copyLink){e.preventDefault();const url=new URL('projects.html',location.href);url.searchParams.set('project',copyLink.dataset.copyProject);const feedback=$('.feedback',copyLink.closest('.story'));try{await navigator.clipboard.writeText(url.href);feedback.textContent='Project link copied.';}catch{feedback.textContent='Copy is unavailable. Use the address in your browser.';}return;}
 const gear=e.target.closest('[data-gear]');if(gear){const g=content.gear.find(g=>g.id===gear.dataset.gear);if(!g)return;activeProject=null;returnStory=null;currentGallery=null;returnGallery=null;const source=media[g.id];showDialog('My music setup',`<div class="lightbox"><p class="meta">${escapeHTML(g.type)}</p><h2 id="detail-title">${escapeHTML(g.title)}</h2>${mediaFigure(g.id)}<p>${escapeHTML(g.description)}</p>${source?.sourceUrl?`<a class="text-link" href="${escapeHTML(source.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.credit)} ${arrow}</a>`:''}</div>`);return;}
 const album=e.target.closest('[data-gallery]');if(album){returnStory=null;returnGallery=null;openGallery(album.dataset.gallery);return;}
 const image=e.target.closest('[data-image]');if(image){returnStory=activeProject;returnGallery=currentGallery;currentGallery=null;openImage(image.dataset.image,Number(image.dataset.index||0));return;}
 const view=e.target.closest('[data-view-index]');if(view){openImage(viewerKey,Number(view.dataset.viewIndex));return;}
 if(e.target.closest('[data-back-story]'))closeDialog();
});

let projectFilter='all';
function filterProjects(){
 const query=($('#project-search')?.value||'').trim().toLowerCase();let count=0;
 $$('.project-row').forEach(row=>{row.hidden=(projectFilter!=='all'&&row.dataset.projectCategory!==projectFilter)||(query&&!row.dataset.search.includes(query));if(!row.hidden)count++;});
 $$('.project-group').forEach(group=>group.hidden=!$('.project-row:not([hidden])',group));
 if($('#project-count'))$('#project-count').textContent=`${count} project${count===1?'':'s'}`;
 if($('#project-empty'))$('#project-empty').hidden=count>0;
}
$$('[data-project-filter]').forEach(b=>b.addEventListener('click',()=>{projectFilter=b.dataset.projectFilter;$$('[data-project-filter]').forEach(other=>other.setAttribute('aria-pressed',String(other===b)));filterProjects();}));
$('#project-search')?.addEventListener('input',filterProjects);

const experienceToggle=$('#expand-experiences');
function updateExperienceToggle(){const visible=$$('.experience-row:not([hidden]) .experience-detail');const open=visible.length>0&&visible.every(d=>d.open);if(experienceToggle){experienceToggle.setAttribute('aria-expanded',String(open));experienceToggle.innerHTML=(open?'Collapse all':'Expand all')+' <span aria-hidden="true">'+(open?'−':'+')+'</span>';}}
experienceToggle?.addEventListener('click',()=>{const open=experienceToggle.getAttribute('aria-expanded')!=='true';$$('.experience-row:not([hidden]) .experience-detail').forEach(d=>d.open=open);updateExperienceToggle();});
$$('.experience-detail').forEach(d=>d.addEventListener('toggle',()=>{$('.disclosure-mark',d).innerHTML=icon(d.open?'minus':'plus');if(!d.open)$$('video',d).forEach(v=>v.pause());updateExperienceToggle();}));
$$('.music-album').forEach(d=>d.addEventListener('toggle',()=>{if(!d.open)$$('video',d).forEach(v=>v.pause());}));
$$('[data-experience-filter]').forEach(b=>b.addEventListener('click',()=>{const filter=b.dataset.experienceFilter;$$('[data-experience-filter]').forEach(other=>other.setAttribute('aria-pressed',String(other===b)));let count=0;$$('.experience-row').forEach(row=>{row.hidden=filter!=='all'&&row.dataset.experienceCategory!==filter;if(!row.hidden)count++;});$('#experience-count').textContent=`${count} experience${count===1?'':'s'}`;updateExperienceToggle();}));

$$('.copy-email').forEach(button=>button.addEventListener('click',async()=>{const feedback=$('.feedback',button.parentElement);button.dataset.state='loading';button.setAttribute('aria-busy','true');try{await navigator.clipboard.writeText('rafliali337@gmail.com');button.textContent='Copied';button.dataset.state='success';feedback.textContent='';}catch{button.dataset.state='error';feedback.textContent='Copy is unavailable. Select the email address above.';}finally{button.removeAttribute('aria-busy');setTimeout(()=>{button.textContent='Copy email';delete button.dataset.state;},2200);}}));

let audio,master;
const volume=$('#bass-volume'),volumeOutput=$('#volume-value');
volume?.addEventListener('input',()=>{volumeOutput.value=volume.value+'%';volumeOutput.textContent=volume.value+'%';if(master&&audio)master.gain.setTargetAtTime(Number(volume.value)/100,audio.currentTime,.025);});
$$('.bass-string').forEach(button=>button.addEventListener('click',async()=>{
 const feedback=$('.sound-feedback');
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Unsupported');
  if(!audio){audio=new Audio();master=audio.createGain();master.gain.value=Number(volume?.value||35)/100;master.connect(audio.destination);}await audio.resume();
  const now=audio.currentTime;for(const [harmonic,level] of [[1,.38],[2,.18],[3,.07]]){const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='sine';oscillator.frequency.value=Number(button.dataset.hz)*harmonic;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(level,now+.012);gain.gain.exponentialRampToValueAtTime(.001,now+1.1);oscillator.connect(gain);gain.connect(master);oscillator.start(now);oscillator.stop(now+1.15);}
  button.classList.remove('playing');void button.offsetWidth;button.classList.add('playing');setTimeout(()=>button.classList.remove('playing'),450);feedback.textContent=`Playing ${button.dataset.note} · synthesized bass note.`;
 }catch{feedback.textContent='Audio is unavailable in this browser. You can still explore the rest of my music setup.';}
}));

const initialProject=new URL(location.href).searchParams.get('project');
if(initialProject&&!openProject(initialProject,false)){status.textContent='That project could not be found. Browse the project list instead.';clearProjectURL();}
