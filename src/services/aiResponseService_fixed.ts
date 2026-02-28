export interface AIResponse {
  content: string;
  suggestions?: string[];
  followUpQuestions?: string[];
}

export interface LanguageResponses {
  [key: string]: {
    greetings: string[];
    fallbacks: string[];
    unknown: string;
    error: string;
    categories: {
      destinations: AIResponse[];
      accommodation: AIResponse[];
      transportation: AIResponse[];
      food: AIResponse[];
      culture: AIResponse[];
      practical: AIResponse[];
      activities: AIResponse[];
    };
  };
}

const aiResponses: LanguageResponses = {
  en: {
    greetings: [
      "Hello! Welcome to Travello Assistant. I'm ready to help with your tourism information!",
      "Hi there! I'm your travel companion. How can I assist you today?",
      "Welcome! I'm here to help you explore Indonesia. What would you like to know?"
    ],
    fallbacks: [
      "I'm not sure I understand. Could you rephrase that?",
      "Let me help you better. Could you provide more details?",
      "I'd be happy to help! Could you tell me more specifically what you're looking for?"
    ],
    unknown: "I don't have information about that. Try asking about destinations, accommodation, transportation, food, culture, or practical travel tips.",
    error: "Sorry, I'm having trouble responding right now. Please try again later.",
    categories: {
      destinations: [
        {
          content: "Indonesia's top 5 destinations include:\n1. Bali - The Island of Gods with beautiful beaches and temples\n2. Yogyakarta - Cultural heart with Borobudur and Prambanan temples\n3. Komodo Island - Home to the famous Komodo dragons\n4. Raja Ampat - Ultimate diving paradise with pristine coral reefs\n5. Lombok - Beautiful beaches and the famous Gili Islands",
          suggestions: ["Tell me more about Bali", "What about Yogyakarta?", "Best time to visit Indonesia?"]
        },
        {
          content: "Bali offers amazing experiences:\n• Beaches: Kuta, Seminyak, Nusa Dua, Uluwatu\n• Culture: Ubud, temples, traditional dances\n• Nature: Rice terraces, volcanoes, waterfalls\n• Activities: Surfing, diving, yoga retreats",
          suggestions: ["Hotels in Bali", "Best beaches in Bali", "Cultural sites in Ubud"]
        },
        {
          content: "Yogyakarta is Indonesia's cultural capital:\n• Temples: Borobudur (largest Buddhist temple), Prambanan\n• Culture: Batik workshops, wayang kulit performances\n• Food: Gudeg, bakpia, local street food\n• Shopping: Malioboro street for souvenirs",
          suggestions: ["How to get to Borobudur?", "Best time to visit temples", "Traditional food to try"]
        }
      ],
      accommodation: [
        {
          content: "Best hotels and resorts in Bali:\n• Luxury: The Mulia, Four Seasons, St. Regis\n• Mid-range: The Seminyak Beach Resort, Padma Resort\n• Budget: Hostels in Canggu, guesthouses in Ubud\n• Unique: Overwater bungalows, jungle retreats",
          suggestions: ["Budget accommodation in Bali", "Luxury resorts", "Best areas to stay"]
        },
        {
          content: "Accommodation options across Indonesia:\n• Hotels: 5-star to budget chains\n• Villas: Private pools, great for groups\n• Guesthouses: Local experience, affordable\n• Hostels: Budget-friendly, social atmosphere\n• Homestays: Authentic local experience",
          suggestions: ["How to book accommodation?", "Average hotel prices", "Best booking platforms"]
        }
      ],
      transportation: [
        {
          content: "Transportation in Indonesia:\n• Flights: Garuda Indonesia, Lion Air, AirAsia for inter-island travel\n• Trains: Java island has good rail network\n• Buses: Comfortable for long distances\n• Ride-hailing: Gojek, Grab available in cities\n• Rental: Scooters, cars available for tourists",
          suggestions: ["How to get from Bali to Jakarta?", "Domestic flights guide", "Scooter rental tips"]
        },
        {
          content: "Getting around Indonesia:\n• Domestic flights connect major islands efficiently\n• Java has excellent train network (executive class recommended)\n• Gojek/Grab for short distances in cities\n• Traditional transport: Becak (cycle rickshaw), ojek (motorcycle taxi)\n• Ferries connect islands (Pelni cruise ships)",
          suggestions: ["Train travel in Java", "Ferry schedules", "Airport transfer options"]
        }
      ],
      food: [
        {
          content: "Must-try Indonesian foods:\n• Nasi Goreng (Fried Rice) - National dish\n• Satay - Grilled meat skewers with peanut sauce\n• Rendang - Spicy beef curry from Padang\n• Gado-gado - Vegetable salad with peanut sauce\n• Soto - Traditional soup with various regional variations",
          suggestions: ["Where to try authentic food?", "Street food guide", "Dietary restrictions"]
        },
        {
          content: "Indonesian culinary highlights:\n• Regional specialties: Padang food, Javanese cuisine, Balinese dishes\n• Street food: Nasi campur, bakso, martabak\n• Fine dining: Modern Indonesian cuisine in Jakarta/Bali\n• Dietary: Many vegetarian options, halal food widely available",
          suggestions: ["Best food cities", "Food safety tips", "Cooking classes"]
        }
      ],
      culture: [
        {
          content: "Cultural etiquette for tourists:\n• Dress modestly when visiting temples (cover shoulders and knees)\n• Remove shoes before entering homes and temples\n• Use right hand for giving/receiving things\n• Learn basic phrases: 'Terima kasih' (thank you), 'Permisi' (excuse me)\n• Respect religious customs and prayer times",
          suggestions: ["Temple visit guidelines", "Basic Indonesian phrases", "Religious customs"]
        },
        {
          content: "Indonesian culture and traditions:\n• Diversity: 300+ ethnic groups, 700+ languages\n• Religion: Predominantly Muslim, with Hindu, Christian, Buddhist minorities\n• Arts: Wayang kulit (shadow puppets), batik, traditional dances\n• Festivals: Nyepi (Bali), Waisak, Eid celebrations",
          suggestions: ["Traditional arts and crafts", "Cultural festivals calendar", "Religious tolerance"]
        }
      ],
      practical: [
        {
          content: "Visa requirements for Indonesia:\n• Visa-free: 169 countries for 30 days (extendable once)\n• Visa on Arrival: Available for 72 countries at major airports\n• e-Visa: Can be applied online before travel\n• Required: Passport valid 6+ months, return ticket\n• Extension: Can be extended at immigration offices",
          suggestions: ["Which countries need visa?", "How to extend visa?", "e-Visa application process"]
        },
        {
          content: "Best time to visit Indonesia:\n• Dry season (April-October): Best for most activities\n• Wet season (November-March): Fewer crowds, lower prices\n• Regional variations: Different climates across islands\n• Peak season: June-August (school holidays)\n• Shoulder season: April-May, September-October (ideal balance)",
          suggestions: ["Weather by region", "Festival calendar", "Budget travel seasons"]
        },
        {
          content: "Budget travel in Indonesia:\n• Accommodation: $5-15/night (hostels), $20-50 (mid-range hotels)\n• Food: $2-5 per meal (local), $10-20 (tourist restaurants)\n• Transport: Domestic flights $30-100, trains $5-50\n• Activities: Temple entries $1-5, diving $50-100 per day\n• Daily budget: $25-50 (budget), $50-100 (mid-range)",
          suggestions: ["Money-saving tips", "Free activities", "Budget destinations"]
        }
      ],
      activities: [
        {
          content: "Popular activities in Indonesia:\n• Diving & Snorkeling: Raja Ampat, Komodo, Bunaken, Gili Islands\n• Surfing: Bali, Lombok, Mentawai Islands\n• Hiking: Mount Bromo, Rinjani, Kerinci\n• Cultural tours: Temple visits, traditional villages\n• Wildlife: Orangutans in Borneo, Komodo dragons, bird watching",
          suggestions: ["Best diving spots", "Surfing for beginners", "Trekking guides"]
        },
        {
          content: "Adventure activities:\n• Volcano climbing: Bromo sunrise, Rinjani trek, Ijen blue fire\n• Water sports: Jet skiing, parasailing, white water rafting\n• Cultural experiences: Batik workshops, cooking classes, dance performances\n• Relaxation: Yoga retreats in Bali, spa treatments, beach lounging",
          suggestions: ["Adventure safety tips", "Best time for trekking", "Wellness retreats"]
        }
      ]
    }
  },
  id: {
    greetings: [
      "Halo! Selamat datang di Travello Assistant. Saya siap membantu informasi pariwisata Anda!",
      "Hai! Saya adalah companion perjalanan Anda. Bagaimana saya bisa membantu hari ini?",
      "Selamat datang! Saya di sini untuk membantu Anda menjelajahi Indonesia. Apa yang ingin Anda ketahui?"
    ],
    fallbacks: [
      "Saya tidak yakin saya mengerti. Bisakah Anda mengulanginya dengan cara lain?",
      "Biarkan saya membantu Anda lebih baik. Bisakah Anda memberikan detail lebih banyak?",
      "Saya dengan senang hati membantu! Bisakah Anda memberi tahu saya lebih spesifik apa yang Anda cari?"
    ],
    unknown: "Saya tidak memiliki informasi tentang itu. Coba tanyakan tentang destinasi, akomodasi, transportasi, makanan, budaya, atau tips perjalanan praktis.",
    error: "Maaf, saya sedang kesulitan merespons sekarang. Silakan coba lagi nanti.",
    categories: {
      destinations: [
        {
          content: "5 destinasi teratas Indonesia:\n1. Bali - Pulau Dewata dengan pantai dan candi indah\n2. Yogyakarta - Jantung budaya dengan candi Borobudur dan Prambanan\n3. Pulau Komodo - Rumah naga Komodo yang terkenal\n4. Raja Ampat - Surga diving dengan terumbu karang pristine\n5. Lombok - Pantai indah dan Kepulauan Gili yang terkenal",
          suggestions: ["Ceritakan lebih banyak tentang Bali", "Bagaimana dengan Yogyakarta?", "Waktu terbaik mengunjungi Indonesia?"]
        },
        {
          content: "Bali menawarkan pengalaman luar biasa:\n• Pantai: Kuta, Seminyak, Nusa Dua, Uluwatu\n• Budaya: Ubud, candi, tarian tradisional\n• Alam: Teras sawah, gunung berapi, air terjun\n• Aktivitas: Surfing, diving, retreat yoga",
          suggestions: ["Hotel di Bali", "Pantai terbaik di Bali", "Situs budaya di Ubud"]
        }
      ],
      accommodation: [
        {
          content: "Hotel dan resort terbaik di Bali:\n• Mewah: The Mulia, Four Seasons, St. Regis\n• Menengah: The Seminyak Beach Resort, Padma Resort\n• Budget: Hostel di Canggu, guesthouse di Ubud\n• Unik: Bungalow di atas air, retreat hutan",
          suggestions: ["Akomodasi budget di Bali", "Resort mewah", "Area terbaik untuk menginap"]
        }
      ],
      transportation: [
        {
          content: "Transportasi di Indonesia:\n• Penerbangan: Garuda Indonesia, Lion Air, AirAsia untuk travel antar pulau\n• Kereta: Jaringan kereta api bagus di Pulau Jawa\n• Bus: Nyaman untuk jarak jauh\n• Ride-hailing: Gojek, Grab tersedia di kota\n• Sewa: Skuter, mobil tersedia untuk turis",
          suggestions: ["Cara dari Bali ke Jakarta?", "Panduan penerbangan domestik", "Tips sewa skuter"]
        }
      ],
      food: [
        {
          content: "Makanan Indonesia wajib coba:\n• Nasi Goreng - Hidangan nasional\n• Satay - Tusukan daging bakar dengan saus kacang\n• Rendang - Kari daging pedas dari Padang\n• Gado-gado - Salad sayur dengan saus kacang\n• Soto - Sup tradisional dengan variasi regional",
          suggestions: ["Dimana mencoba makanan autentik?", "Panduan street food", "Restriksi diet"]
        }
      ],
      culture: [
        {
          content: "Etika budaya untuk turis:\n• Berpakaian sopan saat mengunjungi candi (tutup bahu dan lutut)\n• Lepas sepatu sebelum masuk rumah dan candi\n• Gunakan tangan kanan untuk memberi/menerima\n• Pelajari frase dasar: 'Terima kasih', 'Permisi'\n• Hormati adat istiadat religius dan waktu sholat",
          suggestions: ["Panduan kunjungan candi", "Frase bahasa Indonesia dasar", "Adat religius"]
        }
      ],
      practical: [
        {
          content: "Persyaratan visa untuk Indonesia:\n• Bebas visa: 169 negara untuk 30 hari (dapat diperpanjang sekali)\n• Visa on Arrival: Tersedia untuk 72 negara di bandara utama\n• e-Visa: Dapat diapply online sebelum travel\n• Diperlukan: Paspor valid 6+ bulan, tiket return\n• Perpanjangan: Dapat diperpanjang di kantor imigrasi",
          suggestions: ["Negara mana yang perlu visa?", "Cara perpanjang visa?", "Proses aplikasi e-Visa"]
        },
        {
          content: "Waktu terbaik mengunjungi Indonesia:\n• Musim kering (April-Oktober): Terbaik untuk sebagian aktivitas\n• Musim hujan (November-Maret): Lebih sedikit kerumunan, harga lebih rendah\n• Variasi regional: Iklim berbeda di seluruh pulau\n• Musim puncak: Juni-Agustus (liburan sekolah)\n• Musim peralihan: April-Mei, September-Oktober (keseimbangan ideal)",
          suggestions: ["Cuaca per region", "Kalender festival", "Musim travel budget"]
        }
      ],
      activities: [
        {
          content: "Aktivitas populer di Indonesia:\n• Diving & Snorkeling: Raja Ampat, Komodo, Bunaken, Gili Islands\n• Surfing: Bali, Lombok, Mentawai Islands\n• Hiking: Gunung Bromo, Rinjani, Kerinci\n• Tur budaya: Kunjungan candi, desa tradisional\n• Wildlife: Orangutan di Kalimantan, naga Komodo, bird watching",
          suggestions: ["Spot diving terbaik", "Surfing untuk pemula", "Panduan trekking"]
        }
      ]
    }
  },
  es: {
    greetings: [
      "¡Hola! Bienvenido a Travello Assistant. Estoy listo para ayudarte con información turística!",
      "¡Hola! Soy tu compañero de viajes. ¿Cómo puedo asistirte hoy?",
      "¡Bienvenido! Estoy aquí para ayudarte a explorar Indonesia. ¿Qué te gustaría saber?"
    ],
    fallbacks: [
      "No estoy seguro de entender. ¿Podrías reformular eso?",
      "Déjame ayudarte mejor. ¿Podrías proporcionar más detalles?",
      "¡Estaré encantado de ayudar! ¿Podrías decirme más específicamente qué buscas?"
    ],
    unknown: "No tengo información sobre eso. Intenta preguntar sobre destinos, alojamiento, transporte, comida, cultura, o consejos prácticos de viaje.",
    error: "Lo siento, estoy teniendo problemas para responder ahora mismo. Por favor, inténtalo más tarde.",
    categories: {
      destinations: [
        {
          content: "Las 5 mejores destinations de Indonesia incluyen:\n1. Bali - La Isla de los Dioses con hermosas playas y templos\n2. Yogyakarta - Corazón cultural con templos Borobudur y Prambanan\n3. Isla Komodo - Hogar de los famosos dragones de Komodo\n4. Raja Ampat - Paraíso definitivo de buceo con arrecifes de coral prístinos\n5. Lombok - Hermosas playas y las famosas Islas Gili",
          suggestions: ["Cuéntame más sobre Bali", "¿Qué tal Yogyakarta?", "¿Cuándo es el mejor momento para visitar Indonesia?"]
        }
      ],
      accommodation: [
        {
          content: "Los mejores hoteles y resorts en Bali:\n• Lujo: The Mulia, Four Seasons, St. Regis\n• Rango medio: The Seminyak Beach Resort, Padma Resort\n• Económico: Hostels en Canggu, guesthouses en Ubud\n• Único: Bungalows sobre el agua, retiros de selva",
          suggestions: ["Alojamiento económico en Bali", "Resorts de lujo", "Mejores áreas para alojarse"]
        }
      ],
      transportation: [
        {
          content: "Transporte en Indonesia:\n• Vuelos: Garuda Indonesia, Lion Air, AirAsia para viajes interinsulares\n• Trenes: La isla de Java tiene buena red ferroviaria\n• Buses: Cómodos para largas distancias\n• Ride-hailing: Gojek, Grab disponibles en ciudades\n• Alquiler: Scooters, coches disponibles para turistas",
          suggestions: ["¿Cómo llegar de Bali a Yakarta?", "Guía de vuelos domésticos", "Consejos para alquiler de scooters"]
        }
      ],
      food: [
        {
          content: "Comidas indonesias que debes probar:\n• Nasi Goreng (Arroz Frito) - Plato nacional\n• Satay - Brochetas de carne a la parrilla con salsa de maní\n• Rendang - Curry de carne picante de Padang\n• Gado-gado - Ensalada de verduras con salsa de maní\n• Soto - Sopa tradicional con variaciones regionales",
          suggestions: ["¿Dónde probar comida auténtica?", "Guía de comida callejera", "Restricciones dietéticas"]
        }
      ],
      culture: [
        {
          content: "Etiqueta cultural para turistas:\n• Vístete modestamente al visitar templos (cubre hombros y rodillas)\n• Quita los zapatos antes de entrar a casas y templos\n• Usa la mano derecha para dar/recibir cosas\n• Aprende frases básicas: 'Terima kasih' (gracias), 'Permisi' (con permiso)\n• Respeta las costumbres religiosas y los tiempos de oración",
          suggestions: ["Directrices para visitar templos", "Frases básicas en indonesio", "Costumbres religiosas"]
        }
      ],
      practical: [
        {
          content: "Requisitos de visa para Indonesia:\n• Sin visa: 169 países por 30 días (extensible una vez)\n• Visa a la llegada: Disponible para 72 países en aeropuertos principales\n• e-Visa: Se puede solicitar en línea antes de viajar\n• Requerido: Pasaporte válido 6+ meses, billete de retorno\n• Extensión: Se puede extender en oficinas de inmigración",
          suggestions: ["¿Qué países necesitan visa?", "¿Cómo extender la visa?", "Proceso de solicitud de e-Visa"]
        }
      ],
      activities: [
        {
          content: "Actividades populares en Indonesia:\n• Buceo y Snorkel: Raja Ampat, Komodo, Bunaken, Islas Gili\n• Surf: Bali, Lombok, Islas Mentawai\n• Senderismo: Monte Bromo, Rinjani, Kerinci\n• Tours culturales: Visitas a templos, aldeas tradicionales\n• Vida silvestre: Orangutanes en Borneo, dragones de Komodo, observación de aves",
          suggestions: ["Mejores lugares de buceo", "Surf para principiantes", "Guías de senderismo"]
        }
      ]
    }
  },
  it: {
    greetings: [
      "Ciao! Benvenuto in Travello Assistant. Sono pronto ad aiutarti con informazioni turistiche!",
      "Salve! Sono il tuo compagno di viaggi. Come posso assisterti oggi?",
      "Benvenuto! Sono qui per aiutarti a esplorare l'Indonesia. Cosa vorresti sapere?"
    ],
    fallbacks: [
      "Non sono sicuro di capire. Potresti riformulare?",
      "Lasciami aiutarti meglio. Puoi fornire più dettagli?",
      "Sarò felice di aiutare! Puoi dirmi più specificamente cosa stai cercando?"
    ],
    unknown: "Non ho informazioni su quello. Prova a chiedere di destinazioni, alloggi, trasporti, cibo, cultura, o consigli pratici di viaggio.",
    error: "Mi dispiace, sto avendo difficoltà a rispondere ora. Per favore riprova più tardi.",
    categories: {
      destinations: [
        {
          content: "Le 5 migliori destinazioni dell'Indonesia includono:\n1. Bali - L'Isola degli Dei con splendide spiagge e templi\n2. Yogyakarta - Cuore culturale con templi Borobudur e Prambanan\n3. Isola di Komodo - Casa dei famosi draghi di Komodo\n4. Raja Ampat - Paradiso assoluto delle immersioni con barriere coralline intatte\n5. Lombok - Splendide spiagge e le famose Isole Gili",
          suggestions: ["Dimmi di più su Bali", "Che ne dici di Yogyakarta?", "Quando è il momento migliore per visitare l'Indonesia?"]
        }
      ],
      accommodation: [
        {
          content: "I migliori hotel e resort a Bali:\n• Lusso: The Mulia, Four Seasons, St. Regis\n• Fascia media: The Seminyak Beach Resort, Padma Resort\n• Economico: Ostelli a Canggu, guesthouse a Ubud\n• Unico: Bungalow sull'acqua, ritiri nella giungla",
          suggestions: ["Alloggio economico a Bali", "Resort di lusso", "Migliori zone dove soggiornare"]
        }
      ],
      transportation: [
        {
          content: "Trasporti in Indonesia:\n• Voli: Garuda Indonesia, Lion Air, AirAsia per viaggi interisulari\n• Treni: L'isola di Java ha buona rete ferroviaria\n• Autobus: Comodi per lunghe distanze\n• Ride-hailing: Gojek, Grab disponibili nelle città\n• Noleggio: Scooter, auto disponibili per turisti",
          suggestions: ["Come arrivare da Bali a Giacarta?", "Guida ai voli domestici", "Consigli per noleggio scooter"]
        }
      ],
      food: [
        {
          content: "Cibi indonesiani da provare:\n• Nasi Goreng - Piatto nazionale\n• Satay - Spiedini di carne alla griglia con salsa di arachidi\n• Rendang - Curry di carne piccante di Padang\n• Gado-gado - Insalata di verdure con salsa di arachidi\n• Soto - Zuppa tradizionale con variazioni regionali",
          suggestions: ["Dove provare cibo autentico?", "Guida allo street food", "Restrizioni dietetiche"]
        }
      ],
      culture: [
        {
          content: "Etichetta culturale per turisti:\n• Vestiti modestamente quando visiti i templi (copri spalle e ginocchia)\n• Togli le scarpe prima di entrare in case e templi\n• Usa la mano destra per dare/ricevere cose\n• Impara frasi di base: 'Terima kasih' (grazie), 'Permisi' (scusa)\n• Rispetta i costumi religiosi e i tempi di preghiera",
          suggestions: ["Linee guida per visitare templi", "Frasi di base in indonesiano", "Costumi religiosi"]
        }
      ],
      practical: [
        {
          content: "Requisiti di visto per l'Indonesia:\n• Senza visto: 169 paesi per 30 giorni (estendibile una volta)\n• Visto all'arrivo: Disponibile per 72 paesi negli aeroporti principali\n• e-Visa: Può essere richiesto online prima di viaggiare\n• Richiesto: Passaporto valido 6+ mesi, biglietto di ritorno\n• Estensione: Può essere esteso negli uffici di immigrazione",
          suggestions: ["Quali paesi bisogno visto?", "Come estendere il visto?", "Processo di richiesta e-Visa"]
        }
      ],
      activities: [
        {
          content: "Attività popolari in Indonesia:\n• Immersione e Snorkel: Raja Ampat, Komodo, Bunaken, Isole Gili\n• Surf: Bali, Lombok, Isole Mentawai\n• Escursionismo: Monte Bromo, Rinjani, Kerinci\n• Tour culturali: Visite ai templi, villaggi tradizionali\n• Fauna selvatica: Oranghi nel Borneo, draghi di Komodo, bird watching",
          suggestions: ["Migliori posti per immersione", "Surf per principianti", "Guide escursioni"]
        }
      ]
    }
  },
  hb: {
    greetings: [
      "שלום! ברוכים למסייע טראבלו. אני מוכן לעזור לךךם במידע תיירות!",
      "היי! אני השותף שלך למסע. איך אני יכול לעזור לך היום?",
      "ברוכים! אני כאן כדי לעזור לך לגלות את אינדונזיה. מה תרצה לדעת?"
    ],
    fallbacks: [
      "אני לא בטוח שאני מבין. האם תוכל לנסח מחדש?",
      "תן לי לעזור לך טוב יותר. האם תוכל לספק פרטים נוספים?",
      "אשמח לעזור! האם תוכל לספר לי יותר באופן ספציפי מה אתה מחפש?"
    ],
    unknown: "אין לי מידע על זה. נסה לשאול על יעדים, לינה, תחבורה, אוכל, תרבות, או טיפים מעשיים לנסיעה.",
    error: "מצטער, אני נתקל בקשיים בהגבה כרגע. אנא נסה שוב מאוחר יותר.",
    categories: {
      destinations: [
        {
          content: "5 היעדים המובילים באינדונזיה כוללים:\n1. באלי - האי האלים עם חופים יפים ומקדשים\n2. יוגיאקרטה - לב תרבותי עם מקדשי בורובודור ופרמבנן\n3. אי קומודו - ביתם של דרקוני קומודו המפורסמים\n4. רג'ה אמפאט - גן עדן אולטימטיבי לצלילה עם שוניות אלמוגים פריסטיניות\n5. לומבוק - חופים יפים ואיי גילי המפורסמים",
          suggestions: ["ספר לי עוד על באלי", "מה דעתך על יוגיאקרטה?", "מתי הזמן הטוב ביותר לבקר באינדונזיה?"]
        }
      ],
      accommodation: [
        {
          content: "מלונות ואתרי נופש מובילים בבאלי:\n• יוקרה: The Mulia, Four Seasons, St. Regis\n• בינוני: The Seminyak Beach Resort, Padma Resort\n• תקציבי: Hostels בקאנגו, guesthouses באובוד\n• ייחודי: Bungalows מעל המים, retreats בג'ונגל",
          suggestions: ["אירוח תקציבי בבאלי", "אתרי נופש יוקרתיים", "אזורים מובילים ללינה"]
        }
      ],
      transportation: [
        {
          content: "תחבורה באינדונזיה:\n• טיסות: Garuda Indonesia, Lion Air, AirAsia לנסיעות בין איים\n• רכבות: לאי ג'אווה יש רשת מסילות טובה\n• אוטובוסים: נוחים למרחקים ארוכים\n• Ride-hailing: Gojek, Grab זמינים בערים\n• השכרה: סקוטרים, מכוניות זמינים לתיירים",
          suggestions: ["איך להגיע מבאלי לג'קרטה?", "מדריך טיסות פנימיות", "טיפים להשכרת סקוטר"]
        }
      ],
      food: [
        {
          content: "מאכלים אינדונזיים שחובה לנסות:\n• נאסי גורנג (אורז מטוגן) - מנה לאומית\n• סטיי - שיפודי בשר על הגריל עם רוטב בוטנים\n• רנדנג - קארי בשר חריף מפדנג\n• גאדו-גאדו - סלט ירקות עם רוטב בוטנים\n• סוטו - מרק מסורתי עם וריאציות אזוריות",
          suggestions: ["איפה לנסות אוכל אותנטי?", "מדריך אוכל רחוב", "הגבלות תזונתיות"]
        }
      ],
      culture: [
        {
          content: "אטיקה תרבותית לתיירים:\n• התלבש בצניעות בעת ביקור במקדשים (כסה כתפיים וברכיים)\n• הסר נעליים לפני כניסה לבתים ומקדשים\n• השתמש ביד ימין למתן/קבלת דברים\n• למד ביטויים בסיסיים: 'Terima kasih' (תודה), 'Permisi' (סליחה)\n• כבד מנהגים דתיים וזמני תפילה",
          suggestions: ["הנחיות ביקור במקדשים", "ביטויים בסיסיים באינדונזית", "מנהגים דתיים"]
        }
      ],
      practical: [
        {
          content: "דרישות ויזה לאינדונזיה:\n• ללא ויזה: 169 מדינות ל-30 ימים (ניתן להארכה פעם אחת)\n• ויזה בהגעה: זמינה ל-72 מדינות בשדות תעופה מרכזיים\n• e-Visa: ניתן לבקש מקוון לפני נסיעה\n• נדרש: דרכון תקף 6+ חודשים, כרטיס חזרה\n• הארכה: ניתן להאריך במשרדי הגירה",
          suggestions: ["אילו מדינות צריכות ויזה?", "איך להאריך ויזה?", "תהליך בקשת e-Visa"]
        }
      ],
      activities: [
        {
          content: "פעילויות פופולריות באינדונזיה:\n• צלילה וסנורקל: רג'ה אמפאט, קומודו, בונאקן, איי גילי\n• גלישה: באלי, לומבוק, איי מנטאוואי\n• טרקים: הר ברומו, רינג'אני, קרינצ'י\n• סיורים תרבותיים: ביקורים במקדשים, כפרים מסורתיים\n• חיות בר: אורנגאוטנים בבורנאו, דרקוני קומודו, צפרות ציפורים",
          suggestions: ["מקומות הצלילה הטובים ביותר", "גלישה למתחילים", "מדריכי טרקים"]
        }
      ]
    }
  },
  jp: {
    greetings: [
      "こんにちは！Travelloアシスタントへようこそ。観光情報のお手伝いをする準備ができました！",
      "こんにちは！私はあなたの旅行パートナーです。今日どのようにお手伝いしましょうか？",
      "ようこそ！インドネシアを探索するお手伝いをします。何を知りたいですか？"
    ],
    fallbacks: [
      "よく理解できません。言い換えていただけますか？",
      "もっと良くお手伝いさせてください。詳細を教えていただけますか？",
      "お手伝いできて嬉しいです！具体的に何をお探しですか？"
    ],
    unknown: "それについては情報がありません。目的地、宿泊施設、交通、食事、文化、または実用的な旅行のヒントについて質問してみてください。",
    error: "申し訳ありませんが、今すぐ応答するのに問題があります。後でもう一度お試しください。",
    categories: {
      destinations: [
        {
          content: "インドネシアのトップ5の目的地には以下が含まれます：\n1. バリ - 美しいビーチと寺院がある神々の島\n2. ヨギャカルタ - ボロブドゥールとプランバナン寺院がある文化の中心地\n3. コモド島 - 有名なコモドドラゴンの故郷\n4. ラジャアンパット - プリスティンな珊瑚礁がある究極のダイビングパラダイス\n5. ロンボク - 美しいビーチと有名なギリ諸島",
          suggestions: ["バリについてもっと教えて", "ヨギャカルタはどう？", "インドネシアを訪れるのに最適な時期は？"]
        }
      ],
      accommodation: [
        {
          content: "バリの最高のホテルとリゾート：\n• 豪華：The Mulia, Four Seasons, St. Regis\n• 中程度：The Seminyak Beach Resort, Padma Resort\n• 予算：Cangguのホステル、Ubudのゲストハウス\n• ユニーク：水上平房、ジャングルリトリート",
          suggestions: ["バリの予算宿泊", "ラグジュリーリゾート", "最適の宿泊エリア"]
        }
      ],
      transportation: [
        {
          content: "インドネシアの交通機関：\n• 航空：Garuda Indonesia, Lion Air, AirAsiaで島間移動\n• 鉄道：ジャワ島は優れた鉄道網を持つ\n• バス：長距離で快適\n• ライドハイリング：Gojek, Grabが都市で利用可能\n• レンタル：スカーター、車が観光客に利用可能",
          suggestions: ["バリからジャカルタまで？", "国内航空ガイド", "スカーターレンタルのヒント"]
        }
      ],
      food: [
        {
          content: "必食のインドネシア料理：\n• ナシゴレン（炒飯）- 国民料理\n• サテ - ピーナッツソース付き串焼き肉\n• レンダン - パダンのスパイシービーフカレー\n• ガドガド - ピーナッツソース付き野菜サラダ\n• ソト - 地域ごとの伝統的なスープ",
          suggestions: ["本物の食事はどこで？", "ストリートフードガイド", "食事制限"]
        }
      ],
      culture: [
        {
          content: "観光客のための文化的エチケット：\n• 寺院を訪れるときは控えめに服装（肩と膝を覆う）\n• 家や寺院に入る前に靴を脱ぐ\n• 物を渡す/受け取るときは右手を使う\n• 基本的なフレーズを学ぶ：'Terima kasih'（ありがとう）、'Permisi'（すみません）\n• 宗教的習慣と祈りの時間を尊重する",
          suggestions: ["寺院訪問のガイドライン", "基本的なインドネシア語フレーズ", "宗教的習慣"]
        }
      ],
      practical: [
        {
          content: "インドネシアのビザ要件：\n• ビザ免除：169カ国、30日間（1回延長可能）\n• 到着時ビザ：72カ国、主要空港で利用可能\n• e-Visa：旅行前にオンラインで申請可能\n• 要件：6ヶ月以上有効なパスポート、復路航空券\n• 延期：入国管理事務所で延長可能",
          suggestions: ["どの国がビザ必要？", "ビザを延長する方法？", "e-Visa申請プロセス"]
        }
      ],
      activities: [
        {
          content: "インドネシアの人気アクティビティ：\n• ダイビング＆シュノーケル：ラジャアンパット、コモド、ブナケン、ギリ諸島\n• サーフ：バリ、ロンボク、 Mentawai諸島\n• ハイキング：ブロモ山、リンジャニ、ケリンチ\n• 文化ツアー：寺院訪問、伝統的な村\n• 野生生物：ボルネオのオランウータン、コモドドラゴン、バードウォッチング",
          suggestions: ["最高のダイビングスポット", "サーフィング初心者", "トレッキングガイド"]
        }
      ]
    }
  },
  ch: {
    greetings: [
      "你好！欢迎来到Travello助手。我准备好帮助您的旅游信息！",
      "你好！我是您的旅行伴侣。今天我该如何帮助您？",
      "欢迎！我在这里帮助您探索印度尼西亚。您想知道什么？"
    ],
    fallbacks: [
      "我不确定我理解。您能重新表述吗？",
      "让我更好地帮助您。您能提供更多细节吗？",
      "我很乐意帮助！您能更具体地告诉我您在寻找什么吗？"
    ],
    unknown: "我没有关于那个的信息。试着询问目的地、住宿、交通、食物、文化或实用的旅行提示。",
    error: "抱歉，我现在无法回应。请稍后再试。",
    categories: {
      destinations: [
        {
          content: "印度尼西亚前5大目的地包括：\n1. 巴厘岛 - 拥有美丽海滩和寺庙的神之岛\n2. 日惹 - 拥有婆罗浮屠和普兰巴南寺庙的文化中心\n3. 科莫多岛 - 著名科莫多龙的家园\n4. 四王群岛 - 拥有原始珊瑚礁的终极潜水天堂\n5. 龙目岛 - 美丽的海滩和著名的吉利群岛",
          suggestions: ["告诉我更多关于巴厘岛", "日惹怎么样？", "访问印度尼西亚的最佳时间？"]
        }
      ],
      accommodation: [
        {
          content: "巴厘岛最佳酒店和度假村：\n• 豪华：The Mulia, Four Seasons, St. Regis\n• 中档：The Seminyak Beach Resort, Padma Resort\n• 经济：Canggu的青年旅社，Ubud的民宿\n• 独特：水上平房，丛林度假村",
          suggestions: ["巴厘岛经济住宿", "豪华度假村", "最佳住宿区域"]
        }
      ],
      transportation: [
        {
          content: "印度尼西亚交通：\n• 航班：Garuda Indonesia, Lion Air, AirAsia用于岛屿间旅行\n• 火车：爪哇岛有良好的铁路网络\n• 巴士：长途舒适\n• 网约车：Gojek, Grab在城市中可用\n• 租赁：为游客提供摩托车和汽车",
          suggestions: ["如何从巴厘岛到雅加达？", "国内航班指南", "摩托车租赁技巧"]
        }
      ],
      food: [
        {
          content: "必尝的印度尼西亚美食：\n• 印尼炒饭 - 国菜\n• 沙爹 - 配花生酱的烤肉串\n• 仁当 - 巴东辣牛肉咖喱\n• 加多加多 - 配花生酱的蔬菜沙拉\n• 索托 - 具有地区变化的传统汤",
          suggestions: ["在哪里品尝正宗美食？", "街头美食指南", "饮食限制"]
        }
      ],
      culture: [
        {
          content: "游客文化礼仪：\n• 参观寺庙时穿着得体（遮盖肩膀和膝盖）\n• 进入房屋和寺庙前脱鞋\n• 用右手给予/接收物品\n• 学习基本短语：'Terima kasih'（谢谢），'Permisi'（打扰了）\n• 尊重宗教习俗和祈祷时间",
          suggestions: ["寺庙参观指南", "基本印尼语短语", "宗教习俗"]
        }
      ],
      practical: [
        {
          content: "印度尼西亚签证要求：\n• 免签证：169个国家30天（可延长一次）\n• 落地签证：72个国家主要机场可用\n• e-Visa：可在旅行前在线申请\n• 要求：护照有效期6个月以上，返程机票\n• 延期：可在移民局延长",
          suggestions: ["哪些国家需要签证？", "如何延长签证？", "e-Visa申请流程"]
        }
      ],
      activities: [
        {
          content: "印度尼西亚热门活动：\n• 潜水和浮潜：四王群岛，科莫多，布纳肯，吉利群岛\n• 冲浪：巴厘岛，龙目岛，明打威群岛\n• 徒步：布罗莫山，林贾尼，克里奇\n• 文化游览：寺庙参观，传统村庄\n• 野生动物：婆罗洲猩猩，科莫多龙，观鸟",
          suggestions: ["最佳潜水地点", "初学者冲浪", "徒步指南"]
        }
      ]
    }
  },
  kr: {
    greetings: [
      "안녕하세요! Travello 어시스턴트에 오신 것을 환영합니다. 관광 정보를 도와드릴 준비가 되었습니다!",
      "안녕하세요! 저는 당신의 여행 동반자입니다. 오늘 어떻게 도와드릴까요?",
      "환영합니다! 저는 인도네시아를 탐험하는 데 도움을 드립니다. 무엇을 알고 싶으신가요?"
    ],
    fallbacks: [
      "잘 이해하지 못했습니다. 다시 말씨해주시겠어요?",
      "더 잘 도와드리게 해주세요. 더 자세한 정보를 주시겠어요?",
      "도와드리게 기쁩니다! 구체적으로 무엇을 찾고 계신지 말씨해주시겠어요?"
    ],
    unknown: "그에 대한 정보가 없습니다. 목적지, 숙소, 교통, 음식, 문화 또는 실용적인 여행 팁에 대해 질문해 보세요.",
    error: "죄송합니다. 지금 응답하는 데 문제가 있습니다. 나중에 다시 시도해 주세요.",
    categories: {
      destinations: [
        {
          content: "인도네시아 상위 5개 목적지는 다음과 같습니다：\n1. 발리 - 아름다운 해변과 사원이 있는 신들의 섬\n2. 요그야카르타 - 보로부두르와 프람바난 사원이 있는 문화의 중심\n3. 코모도 섬 - 유명한 코모도 도마뱀의 고향\n4. 라자 암팟 - 원산 산호초가 있는 궁극의 다이빙 천국\n5. 롬복 - 아름다운 해변과 유명한 길리 섬들",
          suggestions: ["발리에 대해 더 알려주세요", "요그야카르타는 어때요?", "인도네시아를 방문하기 최적의 시기는?"]
        }
      ],
      accommodation: [
        {
          content: "발리 최고의 호텔과 리조트：\n• 럭셔리: The Mulia, Four Seasons, St. Regis\n• 중급: The Seminyak Beach Resort, Padma Resort\n• 예산: Canggu의 호스텔, Ubud의 게스트하우스\n• 독특: 수상 평房, 정글 리트리트",
          suggestions: ["발리 예산 숙소", "럭셔리 리조트", "최적의 숙박 지역"]
        }
      ],
      transportation: [
        {
          content: "인도네시아 교통：\n• 항공: Garuda Indonesia, Lion Air, AirAsia로 섬 간 이동\n• 철도: 자와 섬은 우수한 철도망 보유\n• 버스: 장거리 이동에 편안\n• 라이드 하일링: Gojek, Grab이 도시에서 이용 가능\n• 렌탈: 관광객을 위한 스쿠터, 자동차 이용 가능",
          suggestions: ["발리에서 자카르타까지?", "국내 항공 안내", "스쿠터 렌탈 팁"]
        }
      ],
      food: [
        {
          content: "꼭 먹어봐야 할 인도네시아 음식：\n• 나시 고르eng (볶음밥) - 국민 음식\n• 사테 - 땅콩소스와 함께 구운 고기\n• 렌당 - 파당의 매운 쇠고기 카레\n• 가도가도 - 땅콩소스와 함께 채소 샐러드\n• 소토 - 지역별 변화가 있는 전통 수프",
          suggestions: ["진짜 음식은 어디서?", "길거리 음식 안내", "식이 제한"]
        }
      ],
      culture: [
        {
          content: "관광객을 위한 문화 에티켓：\n• 사원 방문 시 절제 있는 복장 (어깨와 무릎 덮기)\n• 집과 사원에 들어가기 전 신발 벗기\n• 물건을 주고받을 때 오른손 사용\n• 기본 구문 학습: 'Terima kasih' (감사), 'Permisi' (실례)\n• 종교적 관습과 기도 시간 존중",
          suggestions: ["사원 방문 가이드라인", "기본 인도네시아어 구문", "종교적 관습"]
        }
      ],
      practical: [
        {
          content: "인도네시아 비자 요건：\n• 비자 면제: 169개국 30일 (1회 연장 가능)\n• 도착 비자: 72개국 주요 공항에서 이용 가능\n• e-비자: 여행 전 온라인으로 신청 가능\n• 요구: 6개월 이상 유효한 여권, 복극 항공권\n• 연장: 이민국에서 연장 가능",
          suggestions: ["어떤 국가가 비자 필요?", "비자를 연장하는 방법?", "e-비자 신청 과정"]
        }
      ],
      activities: [
        {
          content: "인도네시아 인기 활동：\n• 다이빙과 스노클링: 라자 암팟, 코모도, 부나켄, 길리 섬\n• 서핑: 발리, 롬복, 멘타와이 섬\n• 하이킹: 브로모 산, 린자니, 켄린치\n• 문화 투어: 사원 방문, 전통 마을\n• 야생 동물: 보르네오 오랑우탄, 코모도 도마뱀, 조류 관찰",
          suggestions: ["최고의 다이빙 장소", "초보자 서핑", "트레킹 가이드"]
        }
      ]
    }
  },
  ru: {
    greetings: [
      "Здравствуйте! Добро пожаловать в Travello Assistant. Я готов помочь с информацией о туризме!",
      "Привет! Я ваш спутник по путешествиям. Как я могу помочь вам сегодня?",
      "Добро пожаловать! Я здесь, чтобы помочь вам исследовать Индонезию. Что вы хотели бы узнать?"
    ],
    fallbacks: [
      "Я не уверен, что понимаю. Не могли бы вы перефразировать это?",
      "Позвольте мне помочь вам лучше. Можете ли вы предоставить больше деталей?",
      "Я буду рад помочь! Можете ли вы сказать мне более конкретно, что вы ищете?"
    ],
    unknown: "У меня нет информации об этом. Попробуйте спросить о направлениях, размещении, транспорте, еде, культуре или практических советах по путешествиям.",
    error: "Извините, у меня сейчас проблемы с ответом. Пожалуйста, попробуйте позже.",
    categories: {
      destinations: [
        {
          content: "Топ-5 направлений Индонезии включают:\n1. Бали - Остров Богов с красивыми пляжами и храмами\n2. Джокьякарта - Культурное сердце с храмами Боробудур и Прамбанан\n3. Остров Комодо - Дом знаменитых драконов Комодо\n4. Раджа Ампат - Ультимативное райское место для дайвинга с нетронутыми коралловыми рифами\n5. Ломбок - Красивые пляжи и знаменитые острова Гили",
          suggestions: ["Расскажите больше о Бали", "А что насчет Джокьякарты?", "Когда лучшее время для посещения Индонезии?"]
        }
      ],
      accommodation: [
        {
          content: "Лучшие отели и курорты на Бали:\n• Люкс: The Mulia, Four Seasons, St. Regis\n• Средний класс: The Seminyak Beach Resort, Padma Resort\n• Бюджет: Хостелы в Чангу, гостевые дома в Убуде\n• Уникальное: Бунгало над водой, ретриты в джунглях",
          suggestions: ["Бюджетное размещение на Бали", "Роскошные курорты", "Лучшие районы для проживания"]
        }
      ],
      transportation: [
        {
          content: "Транспорт в Индонезии:\n• Авиаперелеты: Garuda Indonesia, Lion Air, AirAsia для межостровных поездок\n• Поезда: Остров Ява имеет хорошую железнодорожную сеть\n• Автобусы: Комфортные для дальних расстояний\n• Вызов такси: Gojek, Grab доступны в городах\n• Аренда: Скутеры, автомобили доступны для туристов",
          suggestions: ["Как добраться из Бали в Джакарту?", "Руководство по внутренним авиаперелетам", "Советы по аренде скутера"]
        }
      ],
      food: [
        {
          content: "Обязательные индонезийские блюда:\n• Наси Горенг (Жареный рис) - Национальное блюдо\n• Сате - Шампуры из мяса на гриле с арахисовым соусом\n• Ренданг - Острый говяжий карри из Паданга\n• Гадо-гадо - Овощной салат с арахисовым соусом\n• Сото - Традиционный суп с региональными вариациями",
          suggestions: ["Где попробовать аутентичную еду?", "Гид по уличной еде", "Диетические ограничения"]
        }
      ],
      culture: [
        {
          content: "Культурный этикет для туристов:\n• Одевайтесь скромно при посещении храмов (покрывайте плечи и колени)\n• Снимайте обувь перед входом в дома и храмы\n• Используйте правую руку для передачи/получения вещей\n• Изучите базовые фразы: 'Terima kasih' (спасибо), 'Permisi' (извините)\n• Уважайте религиозные обычаи и время молитвы",
          suggestions: ["Руководство по посещению храмов", "Базовые индонезийские фразы", "Религиозные обычаи"]
        }
      ],
      practical: [
        {
          content: "Требования к визе для Индонезии:\n• Без визы: 169 стран на 30 дней (можно продлить один раз)\n• Виза по прибытии: Доступна для 72 стран в крупных аэропортах\n• e-Виза: Можно подать онлайн перед путешествием\n• Требуется: Действительный паспорт 6+ месяцев, обратный билет\n• Продление: Можно продлить в офисах иммиграции",
          suggestions: ["Каким странам нужна виза?", "Как продлить визу?", "Процесс подачи e-Визы"]
        }
      ],
      activities: [
        {
          content: "Популярные занятия в Индонезии:\n• Дайвинг и снорклинг: Раджа Ампат, Комодо, Бунакен, острова Гили\n• Серфинг: Бали, Ломбок, острова Ментаваи\n• Хайкинг: гора Бромо, Ринджани, Керинчи\n• Культурные туры: Посещение храмов, традиционные деревни\n• Дикая природа: Орангутаны на Борнео, драконы Комодо, наблюдение за птицами",
          suggestions: ["Лучшие места для дайвинга", "Серфинг для начинающих", "Гиды по хайкингу"]
        }
      ]
    }
  }
};

class AIResponseService {
  private currentLanguage = 'en';
  private conversationHistory: string[] = [];

  setLanguage(language: string) {
    this.currentLanguage = language;
  }

  getLanguage(): string {
    return this.currentLanguage;
  }

  private getResponses() {
    return aiResponses[this.currentLanguage] || aiResponses.en;
  }

  private addToHistory(message: string) {
    this.conversationHistory.push(message);
    // Keep only last 10 messages for context
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }
  }

  private getKeywords(text: string): string[] {
    const keywords = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    return keywords;
  }

  private matchCategory(keywords: string[]): string | null {
    const categoryKeywords = {
      destinations: ['destination', 'place', 'visit', 'bali', 'yogyakarta', 'jakarta', 'komodo', 'raja', 'ampat', 'lombok', 'pulau', 'island'],
      accommodation: ['hotel', 'resort', 'stay', 'accommodation', 'guesthouse', 'hostel', 'villa', 'room', 'booking'],
      transportation: ['transport', 'transportation', 'flight', 'train', 'bus', 'car', 'scooter', 'gojek', 'grab', 'airport'],
      food: ['food', 'eat', 'restaurant', 'cuisine', 'dish', 'meal', 'nasi', 'satay', 'rendang', 'makanan'],
      culture: ['culture', 'tradition', 'etiquette', 'custom', 'religion', 'temple', 'candi', 'budaya'],
      practical: ['visa', 'budget', 'cost', 'price', 'money', 'weather', 'season', 'time', 'best', 'when', 'how'],
      activities: ['activity', 'do', 'activity', 'surfing', 'diving', 'hiking', 'trek', 'tour', 'adventure']
    };

    for (const [category, categoryKeywordList] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => categoryKeywordList.includes(keyword))) {
        return category;
      }
    }

    return null;
  }

  getGreeting(): AIResponse {
    const responses = this.getResponses();
    const greetings = responses.greetings;
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    return {
      content: randomGreeting,
      suggestions: [
        "What are the top destinations?",
        "How to travel on budget?",
        "Best time to visit?"
      ]
    };
  }

  generateResponse(userMessage: string): AIResponse {
    this.addToHistory(userMessage);
    const keywords = this.getKeywords(userMessage);
    const category = this.matchCategory(keywords);
    const responses = this.getResponses();

    // Check for greetings
    if (keywords.some(k => ['hello', 'hi', 'halo', 'hai', 'hola', 'ciao', 'shalom', 'konnichi', 'nihao', 'annyeonghaseyo', 'privet'].includes(k))) {
      return this.getGreeting();
    }

    // Category-based response
    if (category && responses.categories[category as keyof typeof responses.categories]) {
      const categoryResponses = responses.categories[category as keyof typeof responses.categories];
      const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
      
      return {
        ...randomResponse,
        followUpQuestions: [
          "Is there anything specific you'd like to know?",
          "Would you like more detailed information?",
          "Do you have other questions about this topic?"
        ]
      };
    }

    // Fallback responses
    const fallbacks = responses.fallbacks;
    const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    
    return {
      content: randomFallback,
      suggestions: [
        "Tell me about destinations",
        "Ask about accommodation",
        "Transportation options",
        "Food recommendations",
        "Cultural information",
        "Practical travel tips"
      ]
    };
  }

  getUnknownResponse(): AIResponse {
    const responses = this.getResponses();
    return {
      content: responses.unknown,
      suggestions: [
        "Popular destinations",
        "Travel budget tips",
        "Best time to visit",
        "Visa requirements"
      ]
    };
  }

  getErrorResponse(): AIResponse {
    const responses = this.getResponses();
    return {
      content: responses.error,
      suggestions: [
        "Try again",
        "Ask something else",
        "Contact support"
      ]
    };
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getConversationHistory(): string[] {
    return [...this.conversationHistory];
  }
}

export const aiResponseService = new AIResponseService();
export default aiResponseService;