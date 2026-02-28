import React from 'react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  theme?: 'light' | 'dark';
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'la', name: 'Latina', flag: '🇻🇦' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  selectedLanguage, 
  onLanguageChange, 
  theme = 'light' 
}) => {
  const isDark = theme === 'dark';
  
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>
      <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
        Language:
      </span>
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className={`text-xs px-2 py-1 rounded border ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:ring-1 focus:ring-sky-500`}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
