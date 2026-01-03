/**
 * Noor Quran Engine - High End Build
 * Developer: Fatehin Alam
 */

const API = "https://api.alquran.cloud/v1";
const state = {
    surahs: [],
    ayahs: [],
    currentSurah: null,
    audio: new Audio(),
    isPlaying: false,
    activeIndex: 0
};

// Initial Load
window.onload = async () => {
    await fetchSurahs();
    loadSurah(1); // Auto-load Fatiha
};

async function fetchSurahs() {
    const res = await fetch(`${API}/surah`);
    const data = await res.json();
    state.surahs = data.data;
    renderSidebar(state.surahs);
}

function renderSidebar(list) {
    const sidebar = document.getElementById('surahSidebar');
    sidebar.innerHTML = list.map(s => `
        <div onclick="loadSurah(${s.number})" id="s-${s.number}" class="surah-item p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between group">
            <div class="flex items-center gap-4">
                <span class="text-xs font-bold text-slate-300 group-hover:text-emerald-500">${s.number}</span>
                <div>
                    <h4 class="text-sm font-bold text-slate-700">${s.englishName}</h4>
                    <p class="text-[10px] text-slate-400 uppercase tracking-tighter">${s.englishNameTranslation}</p>
                </div>
            </div>
            <div class="text-right">
                <div class="arabic text-sm text-emerald-700 font-bold">${s.name}</div>
                <div class="text-[9px] text-slate-400">${s.numberOfAyahs} Ayahs</div>
            </div>
        </div>
    `).join('');
}

async function loadSurah(num) {
    // UI Feedback
    document.querySelectorAll('.surah-item').forEach(el => el.classList.remove('surah-card-active'));
    document.getElementById(`s-${num}`)?.classList.add('surah-card-active');
    
    const ayahsBox = document.getElementById('ayahList');
    const headerBox = document.getElementById('surahHeader');
    
    ayahsBox.innerHTML = `<div class="py-20 text-center text-slate-400">Loading Surah Data...</div>`;

    try {
        const [arRes, enRes, bnRes] = await Promise.all([
            fetch(`${API}/surah/${num}/quran-uthmani`),
            fetch(`${API}/surah/${num}/en.asad`),
            fetch(`${API}/surah/${num}/bn.bengali`)
        ]);

        const ar = await arRes.json();
        const en = await enRes.json();
        const bn = await bnRes.json();

        state.currentSurah = ar.data;
        state.ayahs = ar.data.ayahs.map((a, i) => ({
            ...a,
            en: en.data.ayahs[i].text,
            bn: bn.data.ayahs[i].text
        }));

        renderHeader(ar.data);
        renderAyahs();
        document.getElementById('mainContainer').scrollTop = 0;
    } catch (err) {
        ayahsBox.innerHTML = `<div class="text-red-500">Error loading data.</div>`;
    }
}

function renderHeader(s) {
    const box = document.getElementById('surahHeader');
    box.innerHTML = `
        <div class="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
            <div class="relative z-10 text-center">
                <h2 class="text-5xl font-bold arabic mb-2">${s.name}</h2>
                <h3 class="text-2xl font-bold mb-1">${s.englishName}</h3>
                <p class="text-emerald-100 text-sm uppercase tracking-widest border-t border-emerald-500/30 pt-2 inline-block">
                    ${s.revelationType} • ${s.numberOfAyahs} Verses
                </p>
            </div>
            <div class="absolute -right-10 -bottom-10 text-9xl text-white/5 font-bold arabic">${s.name}</div>
        </div>
    `;
}

function renderAyahs() {
    const box = document.getElementById('ayahList');
    box.innerHTML = state.ayahs.map((a, i) => `
        <div class="ayah-card bg-white p-6 rounded-2xl">
            <div class="flex justify-between items-center mb-6">
                <span class="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">AYAH ${a.numberInSurah}</span>
                <div class="flex gap-4">
                    <button onclick="playAudio(${i})" class="text-emerald-600 hover:scale-110 transition">▶ Play</button>
                    <button class="text-slate-300 hover:text-yellow-500">★</button>
                </div>
            </div>
            <p class="arabic text-3xl text-right mb-8 leading-loose font-bold text-slate-800">${a.text}</p>
            <p class="text-slate-600 text-sm mb-4 leading-relaxed"><span class="font-bold text-slate-300 mr-2">EN</span>${a.en}</p>
            <p class="bangla text-emerald-800 text-sm leading-relaxed"><span class="font-bold text-emerald-200 mr-2">BN</span>${a.bn}</p>
        </div>
    `).join('');
}

function playAudio(index) {
    state.activeIndex = index;
    const ayah = state.ayahs[index];
    
    document.getElementById('audioBar').classList.remove('translate-y-full');
    document.getElementById('p-surah').innerText = state.currentSurah.englishName;
    document.getElementById('p-ayah').innerText = `Ayah ${ayah.numberInSurah}`;

    state.audio.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
    state.audio.play();
    state.isPlaying = true;
    document.getElementById('playIcon').innerText = "⏸";

    state.audio.onended = () => changeAyah(1);
}

function togglePlay() {
    if (state.isPlaying) {
        state.audio.pause();
        document.getElementById('playIcon').innerText = "▶";
    } else {
        state.audio.play();
        document.getElementById('playIcon').innerText = "⏸";
    }
    state.isPlaying = !state.isPlaying;
}

function changeAyah(dir) {
    const next = state.activeIndex + dir;
    if (next >= 0 && next < state.ayahs.length) playAudio(next);
}

// Search Feature
document.getElementById('surahSearch').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = state.surahs.filter(s => 
        s.englishName.toLowerCase().includes(val) || 
        s.number.toString() === val
    );
    renderSidebar(filtered);
});
