/* =============================================
   STATE
   ============================================= */
const state = {
  yourName: 'Sumith',
  crushName: 'Radha',
  photos: [null, null],
  currentGallerySlide: 0,
  totalSlides: 4,
  noMoveCount: 0,
};

/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Read pre-filled input values
  state.yourName = document.getElementById('yourName').value.trim() || 'Sumith';
  state.crushName = document.getElementById('crushName').value.trim() || 'Radha';
  // Hardcoded photos are already in the HTML; mark them as loaded
  state.photos[0] = 'photo1.jpg';
  state.photos[1] = 'photo2.jpg';
  spawnAmbientHearts();
  spawnCardFloatingHearts();
  loadFromURL();
  setupNameListeners();
  setupDecisionHearts();
});

/* ─── Load names from URL params ─── */
function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const y = params.get('from');
  const c = params.get('to');
  // Use URL params if present, otherwise fall back to defaults
  if (y) { document.getElementById('yourName').value = y; state.yourName = y; }
  if (c) { document.getElementById('crushName').value = c; state.crushName = c; }
  updatePreview();
  // Set URL to always reflect current names
  const url = new URL(window.location.href);
  url.searchParams.set('from', state.yourName);
  url.searchParams.set('to', state.crushName);
  window.history.replaceState({}, '', url.toString());
}

/* ─── Name input listeners ─── */
function setupNameListeners() {
  document.getElementById('yourName').addEventListener('input', (e) => {
    state.yourName = e.target.value.trim();
    updatePreview();
  });
  document.getElementById('crushName').addEventListener('input', (e) => {
    state.crushName = e.target.value.trim();
    updatePreview();
  });
}

function updatePreview() {
  document.getElementById('previewYour').textContent = state.yourName || 'Sumith';
  document.getElementById('previewCrush').textContent = state.crushName || 'Radha';
}

/* =============================================
   SCREEN TRANSITIONS
   ============================================= */
let currentScreen = 'screen-intro';

function goToScreen(targetId) {
  const current = document.getElementById(currentScreen);
  const target = document.getElementById(targetId);
  if (!target || currentScreen === targetId) return;

  current.classList.add('exit-up');
  setTimeout(() => {
    current.classList.remove('active', 'exit-up');
    target.classList.add('active');
    currentScreen = targetId;
    onScreenEnter(targetId);
  }, 350);
}

function onScreenEnter(screenId) {
  if (screenId === 'screen-decision') {
    populateDecisionScreen();
    resetNoButton();
  }
  if (screenId === 'screen-final') {
    populateFinalScreen();
    launchConfetti();
  }
  if (screenId === 'screen-end') {
    spawnEndHearts();
  }
}

/* =============================================
   NAMES CONTINUE
   ============================================= */
function handleNamesContinue() {
  if (!state.yourName) {
    shake(document.getElementById('yourName'));
    return;
  }
  if (!state.crushName) {
    shake(document.getElementById('crushName'));
    return;
  }
  // Update URL for sharing
  const url = new URL(window.location.href);
  url.searchParams.set('from', state.yourName);
  url.searchParams.set('to', state.crushName);
  window.history.replaceState({}, '', url.toString());

  goToScreen('screen-msg1');
}

function shake(el) {
  el.style.transition = 'transform 0.08s ease';
  let count = 0;
  const dir = [6, -6, 5, -5, 3, -3, 0];
  const interval = setInterval(() => {
    el.style.transform = `translateX(${dir[count] || 0}px)`;
    count++;
    if (count >= dir.length) {
      clearInterval(interval);
      el.style.transform = '';
    }
  }, 60);
  el.focus();
}

/* =============================================
   GALLERY
   ============================================= */
function goToSlide(idx) {
  const slides = document.querySelectorAll('.gallery-slide');
  const dots = document.querySelectorAll('.gallery-dot');
  slides[state.currentGallerySlide].classList.remove('active');
  dots[state.currentGallerySlide].classList.remove('active');
  state.currentGallerySlide = (idx + state.totalSlides) % state.totalSlides;
  slides[state.currentGallerySlide].classList.add('active');
  dots[state.currentGallerySlide].classList.add('active');
}

function nextSlide() { goToSlide(state.currentGallerySlide + 1); }
function prevSlide() { goToSlide(state.currentGallerySlide - 1); }

function handlePhotoUpload(input, idx) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    state.photos[idx] = e.target.result;
    const slide = document.getElementById(`gallerySlide${idx}`);
    slide.innerHTML = `<img class="gallery-photo" src="${e.target.result}" alt="Memory ${idx + 1}" />`;
    updateFinalPhotos();
  };
  reader.readAsDataURL(file);
}

function updateFinalPhotos() {
  const left = document.getElementById('finalPhotoLeft');
  const right = document.getElementById('finalPhotoRight');
  if (state.photos[0]) left.innerHTML = `<img src="${state.photos[0]}" alt="Photo 1" style="width:100%;height:100%;object-fit:cover;" />`;
  if (state.photos[1]) right.innerHTML = `<img src="${state.photos[1]}" alt="Photo 2" style="width:100%;height:100%;object-fit:cover;" />`;
}

/* =============================================
   DECISION SCREEN
   ============================================= */
function populateDecisionScreen() {
  const sub = document.getElementById('decisionSubName');
  if (state.crushName) {
    sub.textContent = `— for you, ${state.crushName} 🌹`;
  } else {
    sub.textContent = '';
  }
}

function setupDecisionHearts() {
  const container = document.getElementById('decisionHearts');
  for (let i = 0; i < 10; i++) {
    const h = document.createElement('span');
    h.textContent = ['♡','♥','❤️'][Math.floor(Math.random() * 3)];
    h.style.cssText = `
      position:absolute;
      left:${Math.random()*100}%;
      top:${80 + Math.random()*20}%;
      font-size:${0.6 + Math.random()*0.8}rem;
      color:rgba(224,92,122,${0.15 + Math.random()*0.25});
      opacity:0;
      animation: floatUp ${4 + Math.random()*4}s ease-in ${Math.random()*5}s infinite;
    `;
    container.appendChild(h);
  }
}

/* ─── No button runaway ─── */
function resetNoButton() {
  state.noMoveCount = 0;
  const btn = document.getElementById('noBtn');
  btn.style.transform = '';
  btn.style.opacity = '1';
  btn.style.pointerEvents = 'auto';
  btn.textContent = 'Nahi \uD83D\uDE48';
}

function runAwayNo() {
  state.noMoveCount++;
  const btn = document.getElementById('noBtn');

  if (state.noMoveCount > 6) {
    // Completely hide after too many attempts
    btn.style.opacity = '0';
    btn.style.pointerEvents = 'none';
    return;
  }

  if (state.noMoveCount > 4) {
    btn.style.opacity = '0.2';
    btn.style.transform = `translate(${(Math.random()-0.5)*180}px, ${(Math.random()-0.5)*120}px) scale(0.6)`;
    btn.textContent = '...no? \uD83E\uDD7A';
    return;
  }

  // Random jump in any direction — stays inside card via clamped range
  const dx = (Math.random() - 0.5) * 260;
  const dy = (Math.random() - 0.5) * 160;
  btn.style.transform = `translate(${dx}px, ${dy}px) scale(${1 - state.noMoveCount * 0.04})`;
  btn.style.opacity = String(Math.max(0.4, 1 - state.noMoveCount * 0.12));
}

function runAwayNoClick() {
  if (state.noMoveCount <= 6) { runAwayNo(); }
}

/* ─── YES! ─── */
function handleYes() {
  const card = document.getElementById('decisionCard');
  card.classList.add('card-celebrate');
  card.addEventListener('animationend', () => card.classList.remove('card-celebrate'), { once: true });

  // Small heart burst from yes button
  const btn = document.getElementById('yesBtn');
  burstHearts(btn);

  setTimeout(() => goToScreen('screen-final'), 900);
}

function burstHearts(originEl) {
  const rect = originEl.getBoundingClientRect();
  for (let i = 0; i < 14; i++) {
    const h = document.createElement('div');
    h.textContent = ['♡','♥','✦','❤️'][Math.floor(Math.random() * 4)];
    h.style.cssText = `
      position:fixed;
      left:${rect.left + rect.width/2}px;
      top:${rect.top + rect.height/2}px;
      font-size:${0.9 + Math.random()*0.8}rem;
      color:${['#e05c7a','#c0304a','#f4a0b5','#c9a84c'][Math.floor(Math.random()*4)]};
      pointer-events:none;
      z-index:9999;
      transform:translate(-50%,-50%);
      animation: burstFly ${0.8 + Math.random()*0.6}s ease-out forwards;
      --dx:${(Math.random()-0.5)*200}px;
      --dy:${-(40 + Math.random()*160)}px;
    `;
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1500);
  }
  // Inject keyframes if not already
  if (!document.getElementById('burstStyle')) {
    const s = document.createElement('style');
    s.id = 'burstStyle';
    s.textContent = `@keyframes burstFly { 0%{opacity:1;transform:translate(-50%,-50%) scale(1);} 100%{opacity:0;transform:translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.5);} }`;
    document.head.appendChild(s);
  }
}

/* =============================================
   FINAL SCREEN
   ============================================= */
function populateFinalScreen() {
  document.getElementById('finalNameFrom').textContent = state.yourName || 'You';
  document.getElementById('finalNameTo').textContent = state.crushName || 'Them';
  const sig = document.getElementById('finalSignature');
  sig.textContent = state.yourName ? `— with all my love, ${state.yourName} ♡` : '— with all my love ♡';
  updateFinalPhotos();
}

function launchConfetti() {
  const layer = document.getElementById('confettiLayer');
  layer.innerHTML = '';
  const colors = ['#c0304a','#e05c7a','#f4a0b5','#c9a84c','#8b1a2f','#fff','#fdf0f4'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.classList.add('confetti-piece');
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      top: 0;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${5 + Math.random()*8}px;
      height: ${5 + Math.random()*8}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-delay: ${Math.random() * 1}s;
      animation-duration: ${1.8 + Math.random() * 1.5}s;
    `;
    layer.appendChild(piece);
  }
  setTimeout(() => { layer.innerHTML = ''; }, 3500);
}

/* =============================================
   END SCREEN
   ============================================= */
function spawnEndHearts() {
  const container = document.getElementById('endAmbient');
  container.innerHTML = '';
  const symbols = ['♡','♥','✦','❤'];
  for (let i = 0; i < 20; i++) {
    const h = document.createElement('span');
    h.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    h.style.cssText = `
      position:absolute;
      left:${Math.random()*100}%;
      top:${100 + Math.random()*5}%;
      font-size:${0.8 + Math.random()*1.4}rem;
      color:rgba(224,92,122,${0.1 + Math.random()*0.3});
      opacity:0;
      animation: floatUp ${5 + Math.random()*6}s ease-in ${Math.random()*6}s infinite;
    `;
    container.appendChild(h);
  }
}

/* =============================================
   AMBIENT HEARTS (global bg)
   ============================================= */
function spawnAmbientHearts() {
  const layer = document.getElementById('ambientLayer');
  const symbols = ['♡','♥','✦'];
  for (let i = 0; i < 18; i++) {
    const h = document.createElement('span');
    h.classList.add('ambient-heart');
    h.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    h.style.cssText = `
      left:${Math.random()*100}%;
      top:${90 + Math.random()*10}%;
      font-size:${0.5 + Math.random()*0.9}rem;
      animation-delay:${Math.random()*8}s;
      animation-duration:${5 + Math.random()*5}s;
      color: rgba(224,92,122,${0.2 + Math.random()*0.3});
    `;
    layer.appendChild(h);
  }
}

/* =============================================
   INTRO CARD FLOATING HEARTS
   ============================================= */
function spawnCardFloatingHearts() {
  const container = document.getElementById('floatingHeartsIntro');
  const syms = ['♡','✦','♥'];
  for (let i = 0; i < 12; i++) {
    const h = document.createElement('span');
    h.classList.add('fhc-heart');
    h.textContent = syms[Math.floor(Math.random() * syms.length)];
    h.style.cssText = `
      left:${Math.random()*90}%;
      top:${75 + Math.random()*20}%;
      animation-delay:${Math.random()*6}s;
      animation-duration:${4 + Math.random()*4}s;
    `;
    container.appendChild(h);
  }
}

/* =============================================
   REPLAY & SHARE
   ============================================= */
function replayStory() {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.classList.remove('active', 'exit-up'));
  currentScreen = 'screen-intro';
  document.getElementById('screen-intro').classList.add('active');
}

function shareStory() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: '💌 A Special Message For You',
      text: `${state.yourName} sent you something beautiful 🌹`,
      url: url,
    }).catch(() => copyToClipboard(url));
  } else {
    copyToClipboard(url);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Link copied! Share it with your crush 🌹');
  }).catch(() => {
    showToast('Copy this link: ' + text);
  });
}

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed; bottom:2rem; left:50%; transform:translateX(-50%);
    background:rgba(30,10,15,0.9); color:#fff; font-size:0.82rem;
    padding:0.7rem 1.4rem; border-radius:99px;
    backdrop-filter:blur(10px); z-index:9999;
    border:1px solid rgba(224,92,122,0.3);
    animation: toastIn 0.3s ease;
    font-family:'DM Sans',sans-serif;
    white-space:nowrap; max-width:90vw;
  `;
  if (!document.getElementById('toastStyle')) {
    const s = document.createElement('style');
    s.id = 'toastStyle';
    s.textContent = `@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`;
    document.head.appendChild(s);
  }
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* =============================================
   TOUCH SWIPE SUPPORT
   ============================================= */
let touchStartY = 0;
document.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', e => {
  const dy = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dy) < 60) return; // ignore small swipes
  // Only allow swipe on gallery screen
  if (currentScreen === 'screen-gallery') {
    if (dy > 0) nextSlide(); else prevSlide();
  }
}, { passive: true });
