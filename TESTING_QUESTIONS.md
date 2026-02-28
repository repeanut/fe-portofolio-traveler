# Chatbot Testing Questions

## 🧪 **Testing Scenarios**

### **1. Basic Functionality Testing**

#### **Greeting Detection**
- `Hello`
- `Hi`
- `Halo`
- `Hai`
- `Hola`
- `Ciao`
- `Shalom`
- `Konnichiwa`
- `Nihao`
- `Annyeonghaseyo`
- `Privet`

#### **Basic Questions**
- `What services do you offer?`
- `How can you help me?`
- `What can I ask you about?`
- `Tell me about yourself`

---

### **2. Category-Based Testing**

#### **🏝️ Destinations**
- `What are the top destinations in Indonesia?`
- `Tell me about Bali`
- `What can I do in Yogyakarta?`
- `Is Komodo Island worth visiting?`
- `Best places to visit in Indonesia`
- `Popular tourist destinations`
- `Hidden gems in Indonesia`
- `Beach destinations`
- `Cultural sites to visit`

#### **🏨 Accommodation**
- `Where can I stay in Bali?`
- `Best hotels in Indonesia`
- `Budget accommodation options`
- `Luxury resorts in Indonesia`
- `How to book hotels?`
- `Guesthouse recommendations`
- `Hostels for backpackers`
- `Villa rentals`
- `Hotel prices in Indonesia`

#### **🚗 Transportation**
- `How to get around Indonesia?`
- `Domestic flights in Indonesia`
- `Train travel options`
- `Bus transportation`
- `Airport transfers`
- `Scooter rental tips`
- `Gojek and Grab usage`
- `Ferry schedules`
- `Transportation costs`

#### **🍜 Food & Cuisine**
- `What Indonesian food should I try?`
- `Best local dishes`
- `Street food recommendations`
- `Halal food options`
- `Vegetarian food in Indonesia`
- `Popular restaurants`
- `Must-try dishes`
- `Local specialties`
- `Food safety tips`

#### **🎭 Culture & Etiquette**
- `Cultural etiquette in Indonesia`
- `What should I wear to temples?`
- `Local customs to respect`
- `Religious sites etiquette`
- `Traditional culture`
- `Language tips`
- `Greeting customs`
- `Gift-giving etiquette`
- `Photography rules`

#### **💰 Practical Information**
- `Visa requirements for Indonesia`
- `Budget for Indonesia trip`
- `Best time to visit Indonesia`
- `Weather in Indonesia`
- `Currency and money`
- `Internet and connectivity`
- `Safety tips`
- `Health and vaccinations`
- `Travel insurance`

#### **🎯 Activities**
- `What activities can I do in Bali?`
- `Diving and snorkeling spots`
- `Hiking and trekking`
- `Surfing locations`
- `Cultural activities`
- `Adventure sports`
- `Wildlife tours`
- `Photography spots`
- `Nightlife options`

---

### **3. Multi-Language Testing**

#### **🇮🇩 Indonesian**
- `Halo, apa kabar?`
- `Destinasi terbaik di Indonesia?`
- `Berapa budget untuk liburan?`
- `Makanan khas Indonesia?`
- `Etika budaya untuk turis?`
- `Persyaratan visa Indonesia?`
- `Transportasi di Indonesia?`
- `Cuaca di Indonesia?`

#### **🇪🇸 Spanish**
- `¿Cuáles son los mejores destinos?`
- `¿Cómo puedo viajar con presupuesto limitado?`
- `¿Qué comida debo probar?`
- `¿Necesito visa para Indonesia?`
- `¿Cuál es la mejor época para visitar?`

#### **🇮🇹 Italian**
- `Quali sono le destinazioni migliori?`
- `Come viaggiare con un budget limitato?`
- `Cibo da provare in Indonesia?`
- `Ho bisogno di un visto per l'Indonesia?`
- `Qual è il periodo migliore per visitare?`

#### **🇮🇱 Hebrew**
- `מהם היעדים הטובים ביותר?`
- `איך לנסוע בתקציב מוגבל?`
- `איזור מהמלצות לנסות?`
- `האם אני צריך ויזה לאינדונזיה?`
- `מתי הזמן הטוב ביותר לבקר?`

#### **🇯🇵 Japanese**
- `インドネシアのトップの目的地は？`
- `予算制限で旅行する方法は？`
- `インドネシア料理は何？`
- `インドネシアにビザは必要ですか？`
- `訪問するのに最適な時期は？`

#### **🇨🇳 Chinese**
- `印度尼西亚的最佳目的地？`
- `如何在预算有限的情况下旅行？`
- `该尝试什么印度尼西亚食物？`
- `印度尼西亚需要签证吗？`
- `访问的最佳时间？`

#### **🇰🇷 Korean**
- `인도네시아의 최고 목적지?`
- `예산 제한으로 여행하는 방법?`
- `어떤 인도네시아 음식을 시도해야 하나요?`
- `인도네시아에 비자가 필요한가요?`
- `방문하기 최적의 시기?`

#### **🇷🇺 Russian**
- `Какие лучшие направления в Индонезии?`
- `Как путешествовать с ограниченным бюджетом?`
- `Какую индонезийскую еду попробовать?`
- `Нужна ли виза в Индонезию?`
- `Когда лучшее время для посещения?`

---

### **4. Edge Cases & Error Handling**

#### **Complex Questions**
- `I want to visit Bali for 7 days with $500 budget, what can I do?`
- `Plan a trip to Indonesia for 2 weeks focusing on culture and food`
- `Compare Bali vs Lombok for honeymoon destination`
- `Best itinerary for family with kids in Indonesia`
- `Solo female traveler safety tips in Indonesia`

#### **Unclear Questions**
- `asdfghjkl`
- `123456789`
- `????????`
- `Help me`
- `I don't know`
- `random text`

#### **Out of Scope Questions**
- `What's the weather in New York?`
- `Tell me about European history`
- `How to cook Italian pasta?`
- `Stock market predictions`
- `Sports scores`

---

### **5. Context & Follow-up Testing**

#### **Multi-turn Conversations**
1. `What are the best destinations?`
   *Follow-up:* `Tell me more about Bali`
   *Follow-up:* `What about accommodation there?`
   *Follow-up:* `How much does it cost?`

2. `I'm interested in diving`
   *Follow-up:* `Where are the best spots?`
   *Follow-up:* `What equipment do I need?`
   *Follow-up:* `How much does it cost?`

3. `Visiting in December`
   *Follow-up:* `What's the weather like?`
   *Follow-up:* `What should I pack?`
   *Follow-up:* `Are there any festivals?`

---

### **6. Suggestion Testing**

#### **Click Suggestions**
- Test clicking all suggestion buttons
- Verify suggestions are context-relevant
- Check if suggestions trigger appropriate responses
- Test suggestion language consistency

#### **Follow-up Questions**
- Verify follow-up questions appear
- Test follow-up question relevance
- Check if follow-up questions are clickable
- Verify language consistency

---

### **7. Performance Testing**

#### **Response Time**
- Test typing indicator timing
- Verify response delay based on message length
- Test with very long messages
- Test with very short messages

#### **Error Scenarios**
- Test when database is down
- Test network connectivity issues
- Test with corrupted data
- Test concurrent requests

---

### **8. UI/UX Testing**

#### **Visual Elements**
- Message display formatting
- Typing indicator animation
- Suggestion button styling
- Dark/light theme compatibility
- Mobile responsiveness

#### **Interactions**
- Message sending
- Suggestion clicking
- Chat clearing
- Language switching
- Mode switching (AI/CS)

---

### **9. Database Testing**

#### **Data Storage**
- Verify messages are saved to database
- Check session tracking
- Verify user information storage
- Test analytics data collection

#### **Data Retrieval**
- Test chat history loading
- Verify session listing
- Test message retrieval
- Check analytics data

---

## 📝 **Testing Checklist**

### **Basic Functionality**
- [ ] Greetings detected correctly
- [ ] Basic questions answered
- [ ] Error responses appropriate
- [ ] Fallback responses working

### **Category Detection**
- [ ] Destinations category working
- [ ] Accommodation category working
- [ ] Transportation category working
- [ ] Food category working
- [ ] Culture category working
- [ ] Practical category working
- [ ] Activities category working

### **Multi-Language Support**
- [ ] All 9 languages working
- [ ] Language detection accurate
- [ ] Suggestions in correct language
- [ ] Follow-up questions in correct language

### **Advanced Features**
- [ ] Context awareness working
- [ ] Relevance scoring functional
- [ ] Conversation history utilized
- [ ] Smart response selection

### **UI/UX**
- [ ] Typing indicator working
- [ ] Suggestions clickable
- [ ] Dark mode compatible
- [ ] Mobile responsive
- [ ] Smooth animations

### **Database Integration**
- [ ] Messages saving correctly
- [ ] Sessions tracked properly
- [ ] Analytics collected
- [ ] Error handling graceful

### **Performance**
- [ ] Response times acceptable
- [ ] No memory leaks
- [ ] Concurrent requests handled
- [ ] Database queries optimized

---

## 🎯 **Priority Testing Order**

1. **High Priority**: Basic functionality, English language, category detection
2. **Medium Priority**: Multi-language support, suggestions, follow-up questions
3. **Low Priority**: Edge cases, performance optimization, analytics

Test thoroughly and document any issues found! 🚀