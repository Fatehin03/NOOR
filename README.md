# ☪️ Noor: Interactive Digital Quran Engine

**Noor** is a high-performance, client-side web application developed by **Fatehin Alam**. It provides a seamless, distraction-free environment for reading and listening to the Holy Quran, featuring real-time synchronization between Arabic, English, and Bangla translations.

![Status](https://img.shields.io/badge/status-active-success)
![Focus](https://img.shields.io/badge/focus-Multilingual_UX-emerald)
![Engineer](https://img.shields.io/badge/System_Architect-Fatehin_Alam-white)

---

## 🚀 Key Features

- **Triple-Translation Sync:** Uses parallel asynchronous fetching to align Uthmani Arabic, English (Asad), and Bangla (Bengali) datasets by verse index.
- **Smart Audio Player:** Integrated streaming recitation by Mishary Rashid Alafasy with auto-next functionality and state management.
- **DeepSearch Navigation:** A custom client-side filtering system allowing users to jump to any of the 114 Surahs instantly.
- **Responsive Typography:** Optimized font-stacking for Arabic (`Amiri`) and Bangla (`Noto Sans Bengali`) to ensure maximum readability.
- **Zero-Backend Architecture:** Operates entirely as a static web app, utilizing REST APIs for real-time data delivery.



## 🛠️ Technical Stack

- **Logic:** Asynchronous JavaScript (ES6+), `Promise.all` for parallel API execution.
- **Styling:** Tailwind CSS (Utility-first architecture).
- **Data Source:** AlQuran Cloud REST API.
- **Typography:** Google Fonts API integration for non-Latin script rendering.

## ⚙️ How it Works

The engine utilizes a **Parallel Fetching Pattern**. When a user selects a Surah, the application initiates three simultaneous requests:
1. `AR_EDITION`: The Uthmani script.
2. `EN_EDITION`: English meanings.
3. `BN_EDITION`: Bangla translation.

The data is then mapped into a unified `state` object, ensuring that every Ayah card rendered contains perfectly synchronized translations without page reloads.

## 📦 Getting Started

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Fatehin03/noor-quran.git](https://github.com/Fatehin03/noor-quran.git)
