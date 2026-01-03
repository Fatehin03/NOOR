/**
 * NOOR QURAN ENGINE
 * Developed by Fatehin Alam (Fatehin03)
 */

const CONFIG = {
    API: "https://api.alquran.cloud/v1",
    EDITIONS: {
        AR: "quran-uthmani",
        EN: "en.asad",
        BN: "bn.bengali"
    }
};

const state = {
    surahs: [],
    currentAyahs: [],
    audio: new Audio(),
    isPlaying: false,
    activeAyahIndex: 0
};

// 1. Initial Load
document.addEventListener('DOMContentLoaded', async () => {
    await fetchSurahs();
    loadSurah(1); // Default to Fatiha
});

// 2. Fetch Surah List for Sidebar
async function fetchSurahs() {
    try {
        const response = await fetch(`${CONFIG.API}/surah`);
        const data = await response.json();
        state.surahs = data.data;
        renderSidebar();
    } catch (err) {
        console.error("Sidebar Error:", err);
    }
}

function renderSidebar() {
    const sidebar = document.getElementById('surahList');
    sidebar.innerHTML = state.surahs.map(s => `
        <div onclick="loadSurah(${s.number})" class="p-4 border-b border-slate-50 hover:bg-emerald-50 cursor-pointer transition flex items-center gap-4 group">
            <span class="text-xs font-bold text-slate-300 group-hover:text-emerald-500">${s.number}</span>
            <div>
                <h4 class="text-sm font-bold text-slate-700">${s.englishName}</h4>
                <p class="text-[10px] text-slate-400 uppercase tracking-tighter">${s.name} • ${s.numberOfAyahs} Ayahs</p>
            </div>
        </div>
    `).join('');
}

// 3. Main Data Fetcher (Parallel Async)
async function loadSurah(num) {
    const container = document.getElementById('contentArea');
    container.innerHTML = `<div class="py-20 text-center"><div class="loading-spin w-12 h-12 border-4 border-slate-200 rounded-full mx-auto"></div><p class="mt-4 text-slate-400 animate-pulse">Synchronizing Ayahs...</p></div>`;
    
    try {
        // Fetch Arabic, English, and Bangla simultaneously
        const [ar, en, bn] = await Promise.all([
            fetch(`${CONFIG.API}/surah/${num}/${CONFIG.EDITIONS.AR}`).then(r => r.json()),
            fetch(`${CONFIG.API}/surah/${num}/${CONFIG.EDITIONS.EN}`).then(r => r.json()),
            fetch(`${CONFIG.API}/surah/${num}/${CONFIG.EDITIONS.BN}`).then(r => r.json())
        ]);

        state.currentAyahs = ar.data.ayahs.map((a, i) => ({
            ...a,
            en: en.data.ayahs[i].text,
            bn: bn.data.ayahs[i].text,
            surahName: ar.data.englishName
        }));

        renderContent(ar.data);
        document.getElementById('mainScroll').scrollTop = 0;
    } catch (err) {
        container.innerHTML = `<div class="p-10 text-red-500 text-center">Connection Failed. Please try again.</div>`;
    }
}

// 4. Content Renderer
function renderContent(meta) {
    const container = document.getElementById('contentArea');
    container.innerHTML = `
        <div class="text-center py-10">
            <h2 class="text-5xl font-bold text-emerald-900 arabic mb-4">${meta.name}</h2>
            <p class="text-slate-400 uppercase tracking-[0.3em] text-xs font-bold">${meta.englishName} • ${meta.englishNameTranslation}</p>
        </div>
    `;

    state.currentAyahs.forEach((ayah, i) => {
        const card = document.createElement('div');
        card.className = "ayah-card bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300";
        card.innerHTML = `
            <div class="flex justify-between items-center mb-8">
                <span class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">${ayah.numberInSurah}</span>
                <button onclick="playAudio(${i})" class="text-slate-300 hover:text-emerald-500 transition">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
            </div>
            <p class="arabic text-3xl md:text-4xl text-right text-slate-800 mb-10 leading-relaxed font-bold">${ayah.text}</p>
            <div class="space-y-4 border-t border-slate-50 pt-8">
                <p class="text-slate-600 leading-relaxed text-sm md:text-base"><strong class="text-[10px] text-slate-300 mr-2 uppercase">EN</strong>${ayah.en}</p>
                <p class="bangla text-emerald-800 leading-relaxed text-base md:text-lg"><strong class="text-[10px] text-emerald-200 mr-2 uppercase">BN</strong>${ayah.bn}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// 5. Audio Control System
function playAudio(index) {
    state.activeAyahIndex = index;
    const ayah = state.currentAyahs[index];
    
    // Alafasy Recitation Stream
    state.audio.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
    state.audio.play();
    state.isPlaying = true;

    // UI Updates
    document.getElementById('player').classList.remove('translate-y-full');
    document.getElementById('playerSurahName').innerText = ayah.surahName;
    document.getElementById('playerAyahNum').innerText = `Ayah ${ayah.numberInSurah}`;
    
    state.audio.onended = () => {
        if (state.activeAyahIndex < state.currentAyahs.length - 1) {
            playAudio(state.activeAyahIndex + 1);
        }
    };
}

function changeAyah(dir) {
    const next = state.activeAyahIndex + dir;
    if (next >= 0 && next < state.currentAyahs.length) {
        playAudio(next);
    }
}

// Search Logic (Surah Filter)
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const sidebarItems = document.querySelectorAll('#surahList > div');
    
    sidebarItems.forEach((item, index) => {
        const name = state.surahs[index].englishName.toLowerCase();
        item.style.display = name.includes(query) ? 'flex' : 'none';
    });
});
