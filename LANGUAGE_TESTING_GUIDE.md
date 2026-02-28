# 🌍 Language & Chatbot Integration Testing Guide

## 🎯 **Testing Objective**
Memastikan integrasi bahasa dengan chatbot berjalan sempurna untuk 15 bahasa yang didukung.

## 📋 **Supported Languages**
1. 🇺🇸 **English** (en)
2. 🇮🇩 **Indonesia** (id) 
3. 🇲🇾 **Malay** (ms)
4. 🇮🇳 **Hindi** (hi)
5. 🇹🇭 **Thai** (th)
6. 🇨🇳 **Chinese** (zh)
7. 🇯🇵 **Japanese** (ja)
8. 🇰🇷 **Korean** (ko)
9. 🇸🇦 **Arabic** (ar)
10. 🇷🇺 **Russian** (ru)
11. 🇫🇷 **French** (fr)
12. 🇩🇪 **German** (de)
13. 🇻🇦 **Latin** (la)
14. 🇪🇸 **Spanish** (es)
15. 🇮🇱 **Hebrew** (he)

---

## 🧪 **Testing Scenarios**

### **1. Language Selector Testing**
Untuk setiap bahasa, pastikan:
- [ ] Language selector menampilkan flag dan nama bahasa yang benar
- [ ] Saat dipilih, FAQ berubah ke bahasa tersebut
- [ ] Greeting message berubah ke bahasa tersebut
- [ ] Chat interface tetap responsif

### **2. FAQ Options Testing**
Test setiap FAQ dalam semua bahasa:

#### **English (en):**
- [ ] "What are top 5 destinations in Indonesia?"
- [ ] "How to travel Indonesia on a budget?"
- [ ] "Best hotels and resorts in Bali?"
- [ ] "Must-try Indonesian foods?"
- [ ] "When is best time to visit Indonesia?"
- [ ] "Do I need a visa for Indonesia?"
- [ ] "Transportation options in Indonesia?"
- [ ] "Cultural etiquette for tourists?"

#### **Indonesia (id):**
- [ ] "Apa saja 5 destinasi terbaik di Indonesia?"
- [ ] "Bagaimana cara traveling Indonesia hemat?"
- [ ] "Hotel dan resort terbaik di Bali?"
- [ ] "Makanan khas Indonesia wajib coba?"
- [ ] "Kapan waktu terbaik ke Indonesia?"
- [ ] "Apakah butuh visa ke Indonesia?"
- [ ] "Opsi transportasi di Indonesia?"
- [ ] "Etika budaya untuk wisatawan?"

#### **Hebrew (he):**
- [ ] "מהם 5 היעדים המובילים באינדונזיה?"
- [ ] "איך לטייל באינדונזיה עם תקציב נמוך?"
- [ ] "בתי מלון ואתרי נופש הטובים ביותר בבאלי?"
- [ ] "מנות אינדונזיות שחובה לנסות?"
- [ ] "מתי הזמן הטוב ביותר לבקר באינדונזיה?"
- [ ] "האם אני צריך ויזה לאינדונזיה?"
- [ ] "אפשרויות תחבורה באינדונזיה?"
- [ ] "נימוס תרבותי לתיירים?"

*(Lanjutkan untuk 12 bahasa lainnya)*

### **3. AI Response Testing**
Untuk setiap bahasa, pastikan:
- [ ] AI merespons dalam bahasa yang sama
- [ ] Konten jawaban relevan dengan pertanyaan
- [ ] Format jawaban rapi dan mudah dibaca
- [ ] Follow-up questions muncul dalam bahasa yang sama
- [ ] Emoji dan formatting konsisten

### **4. Custom Question Testing**
Test pertanyaan custom dalam berbagai bahasa:

#### **English:**
- [ ] "Tell me about beaches in Bali"
- [ ] "What's the best time to visit Jakarta?"
- [ ] "How much does a trip to Indonesia cost?"

#### **Indonesia:**
- [ ] "Ceritakan tentang pantai di Bali"
- [ ] "Kapan waktu terbaik ke Jakarta?"
- [ ] "Berapa biaya trip ke Indonesia?"

#### **Hebrew:**
- [ ] "ספר לי על החופים בבאלי"
- [ ] "מתי הזמן הטוב ביותר לבקר בג'קרטה?"
- [ ] "כמה עולה טיול לאינדונזיה?"

---

## 🔧 **Technical Testing**

### **API Integration:**
- [ ] Language parameter terkirim ke backend
- [ ] Backend menerima language parameter
- [ ] Gemini AI menerima language preference
- [ ] Response dikembalikan dalam bahasa yang benar

### **Error Handling:**
- [ ] Invalid language code ditangani dengan baik
- [ ] Network error menampilkan pesan yang tepat
- [ ] Empty response ditangani dengan fallback
- [ ] Loading state berfungsi dengan benar

### **Performance:**
- [ ] Response time < 3 detik untuk FAQ
- [ ] Response time < 5 detik untuk custom questions
- [ ] Language switching berjalan smooth
- [ ] Memory usage tetap stabil

---

## 📊 **Expected Results**

### **FAQ Response Format:**
```
🌴 **Top 5 Destinations in Indonesia:**

1. **Bali** - Beaches, temples, and vibrant culture
2. **Yogyakarta** - Cultural heart with temples and palaces
3. **Raja Ampat** - World-class diving diving paradise
4. **Komodo Island** - Dragons and pristine nature
5. **Lombok** - Beautiful beaches and less crowded

Each destination offers unique experiences. Which one interests you most?
```

### **Greeting Response Format:**
```
👋 Welcome to Travello Assistant! I'm here to help with your Indonesia travel needs. Ask me anything about destinations, budget, accommodations, food, or cultural tips!
```

---

## 🎯 **Success Criteria**

### **Language Integration:**
- [ ] Semua 15 bahasa berfungsi sempurna
- [ ] Language selector responsive dan user-friendly
- [ ] FAQ options berubah dinamis
- [ ] AI responses dalam bahasa yang benar

### **Content Quality:**
- [ ] Jawaban informatif dan akurat
- [ ] Format konsisten dengan emoji
- [ ] Follow-up questions relevan
- [ ] Multi-language support sempurna

### **User Experience:**
- [ ] Interface smooth dan responsif
- [ ] Loading states jelas
- [ ] Error handling user-friendly
- [ ] Mobile compatibility terjamin

---

## 🚀 **Testing Instructions**

1. **Buka browser**: `http://127.0.0.1:55431/`
2. **Navigasi ke AI Chatbot**
3. **Test setiap bahasa** satu per satu
4. **Document hasil** dengan checklist di atas
5. **Report issues** jika ditemukan

## 📝 **Notes**
- Focus pada integrasi bahasa vs AI response
- Pastikan semua 15 bahasa tested
- Perhatikan consistency antara FAQ dan AI responses
- Test edge cases dan error scenarios

**Happy Testing! 🌍✈️**
