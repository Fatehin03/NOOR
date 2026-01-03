const API="https://api.alquran.cloud/v1"
const state={surahs:[],ayahs:[],surah:null,audio:new Audio(),index:0,playing:false}

init()

async function init(){
 const s=await fetch(API+"/surah").then(r=>r.json())
 state.surahs=s.data
 renderSurahs(s.data)
 const saved=JSON.parse(localStorage.getItem("noor_last"))
 saved?loadSurah(saved.surah,saved.ayah):loadSurah(1)
 search.oninput=searchAll
 playBtn.onclick=togglePlay
}

function renderSurahs(list){
 surahList.innerHTML=list.map(s=>`
 <div onclick="loadSurah(${s.number})" id="s-${s.number}" class="p-4 border-b cursor-pointer hover:bg-slate-50">
 <div class="flex justify-between">
 <div><div class="text-sm font-bold">${s.englishName}</div>
 <div class="text-[10px] text-slate-400">${s.englishNameTranslation}</div></div>
 <div class="arabic text-emerald-700">${s.name}</div>
 </div></div>`).join("")
}

async function loadSurah(n,startAyah=1){
 document.querySelectorAll("[id^=s-]").forEach(e=>e.classList.remove("active"))
 document.getElementById("s-"+n)?.classList.add("active")
 ayahList.innerHTML="Loading..."
 const [ar,en,bn]=await Promise.all([
 fetch(`${API}/surah/${n}/quran-uthmani`).then(r=>r.json()),
 fetch(`${API}/surah/${n}/en.asad`).then(r=>r.json()),
 fetch(`${API}/surah/${n}/bn.bengali`).then(r=>r.json())
 ])
 state.surah=ar.data
 state.ayahs=ar.data.ayahs.map((a,i)=>({...a,en:en.data.ayahs[i].text,bn:bn.data.ayahs[i].text}))
 surahHeader.innerHTML=`
 <div class="bg-gradient-to-br from-emerald-600 to-emerald-900 text-white rounded-3xl p-8 text-center">
 <h2 class="arabic text-4xl">${ar.data.name}</h2>
 <p class="text-xl">${ar.data.englishName}</p>
 <p class="text-xs">${ar.data.revelationType} • ${ar.data.numberOfAyahs} Ayahs</p>
 </div>`
 renderAyahs()
 playAyah(startAyah-1)
}

function renderAyahs(){
 ayahList.innerHTML=state.ayahs.map((a,i)=>`
 <div class="bg-white p-6 rounded-2xl shadow">
 <div class="flex justify-between mb-2">
 <span class="text-xs text-emerald-600">${a.numberInSurah}</span>
 <div class="flex gap-3 text-xs">
 <button onclick="playAyah(${i})">PLAY</button>
 <button onclick="bookmark(${i})">★</button>
 </div></div>
 <p class="arabic text-3xl text-right mb-4">${a.text}</p>
 <p class="text-sm mb-2">${a.en}</p>
 <p class="bangla text-emerald-800">${a.bn}</p>
 </div>`).join("")
}

function playAyah(i){
 state.index=i
 player.classList.remove("translate-y-full")
 pSurah.innerText=state.surah.englishName
 pAyah.innerText="Ayah "+state.ayahs[i].numberInSurah
 const r=reciter.value
 state.audio.src=`https://cdn.islamic.network/quran/audio/128/${r}/${state.ayahs[i].number}.mp3`
 state.audio.play()
 state.playing=true
 playBtn.innerText="⏸"
 localStorage.setItem("noor_last",JSON.stringify({surah:state.surah.number,ayah:i+1}))
 state.audio.onended=nextAyah
}

function togglePlay(){
 if(!state.audio.src)return
 state.playing?state.audio.pause():state.audio.play()
 state.playing=!state.playing
 playBtn.innerText=state.playing?"⏸":"▶"
}

function nextAyah(){ if(state.index<state.ayahs.length-1) playAyah(state.index+1) }
function prevAyah(){ if(state.index>0) playAyah(state.index-1) }
function closePlayer(){ state.audio.pause();player.classList.add("translate-y-full") }

function bookmark(i){
 localStorage.setItem("noor_bookmark",JSON.stringify({
 surah:state.surah.number,ayah:i+1}))
 alert("Bookmarked")
}

function searchAll(e){
 const q=e.target.value.toLowerCase()
 ayahList.innerHTML=state.ayahs.filter(a=>
 a.text.includes(q)||a.en.toLowerCase().includes(q)||a.bn.includes(q))
 .map(a=>`<div class="bg-white p-4 rounded">${a.text}</div>`).join("")
                                      }
