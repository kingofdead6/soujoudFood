import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Instagram, Facebook, Youtube, Twitter,
  MessageCircle, Music, Linkedin,
} from "lucide-react";
import { API_BASE_URL } from '../../../api';
import logo from '../../assets/Logo.jpeg';
import bgImage from "../../assets/menu-bg.png";

const platformIcons = { /* ... same */ };

const translations = {
  ar: {
    title: "سجود فود",
    loading: "جاري تحميل القائمة اللذيذة...",
    error: "فشل تحميل القائمة. الرجاء المحاولة مرة أخرى لاحقًا.",
    tryAgain: "إعادة المحاولة",
    noItems: "لا توجد عناصر في القائمة بعد.",
    open: "مفتوح",
  },
  fr: {
    title: "Soujoud Food",
    loading: "Chargement du menu délicieux...",
    error: "Échec du chargement du menu. Veuillez réessayer plus tard.",
    tryAgain: "Réessayer",
    noItems: "Aucun élément de menu disponible pour le moment.",
    open: "Ouvert",
  }
};

const MenuPage = () => {
  const [lang, setLang] = useState('ar'); // 'ar' or 'fr'
  const t = translations[lang];

  const [menuItems, setMenuItems] = useState({});
  const [workingHours, setWorkingHours] = useState({ open: '11:00', close: '22:00' });
  const [socialLinks, setSocialLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [menuRes, hoursRes, socialRes, catRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/menu?lang=${lang}`),
          axios.get(`${API_BASE_URL}/working-times`),
          axios.get(`${API_BASE_URL}/social-media`),
          axios.get(`${API_BASE_URL}/categories?lang=${lang}`),
        ]);

        const formatTime = (time24) => {
          if (!time24) return '--:--';
          const [hour, minute] = time24.split(':');
          const h = parseInt(hour, 10);
          const ampm = h >= 12 ? (lang === 'ar' ? 'م' : 'pm') : (lang === 'ar' ? 'ص' : 'am');
          const displayHour = h % 12 || 12;
          return `${displayHour}:${minute}${ampm}`;
        };

        setWorkingHours({
          open: formatTime(hoursRes.data.open),
          close: formatTime(hoursRes.data.close),
        });

        setSocialLinks(socialRes.data);

        // Group menu items by category (already in selected language)
        const groupedItems = menuRes.data.reduce((acc, item) => {
          const category = item.category || 'Uncategorized';
          if (!acc[category]) acc[category] = [];
          acc[category].push(item);
          return acc;
        }, {});

        const sortedCategories = Object.keys(groupedItems).sort();
        setCategories(['Tous', ...sortedCategories]);
        setMenuItems(groupedItems);
        setSelectedCategory('Tous');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lang]); // Re-fetch everything when language changes

  const displayCategories = selectedCategory === 'Tous'
    ? categories.filter(cat => cat !== 'Tous')
    : [selectedCategory];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1E9D2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#CC5500] mx-auto mb-4"></div>
          <p className="text-xl text-[#2D2D2D]">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F1E9D2] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-2xl font-bold text-[#CC5500] mb-4">Oops!</p>
          <p className="text-lg text-[#2D2D2D]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-[#CC5500] text-white rounded-full hover:bg-[#B98816] transition"
          >
            {t.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})`, backgroundColor: '#F1E9D2' }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet" />

      <style jsx>{`
        body { font-family: 'IBM Plex Sans Arabic', 'Cairo', sans-serif; }
        h1, h2, h3 { font-family: 'Cairo', sans-serif; font-weight: 700; }
      `}</style>

    

      {/* Header */}
      <header className="bg-white/70 shadow-sm ">
      
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
            {/* Language Toggle */}
      <div className="text-left top-4 left-4 z-50">
        <button
          onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
          className="px-6 py-3 bg-[#CC5500] text-white rounded-full shadow-lg hover:bg-[#B98816] transition font-bold text-lg"
        >
          {lang === 'ar' ? 'Français' : 'العربية'}
        </button>
      </div>
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Logo" className="w-24 h-24 object-cover rounded-full border-4 border-[#CC5500]" />
          </div>
          <h1 className="text-4xl font-bold text-[#2D2D2D]">{t.title}</h1>
          <div className="flex items-center justify-center gap-6 mt-6 text-[#2D2D2D]">
            <span className="flex items-center gap-2 text-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.open} {workingHours.open} - {workingHours.close}
            </span>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="sticky top-0 z-20 bg-white/90 border-b shadow-md">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex overflow-x-auto gap-4 py-4 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-8 py-3 rounded-full font-semibold text-lg transition-all ${
                    selectedCategory === category
                      ? 'bg-[#CC5500] text-white shadow-lg'
                      : 'bg-gray-200 text-[#2D2D2D] hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 pb-24 w-full">
        {displayCategories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-[#2D2D2D]">{t.noItems}</p>
          </div>
        ) : (
          displayCategories.map((category) => (
            <section key={category} className="mb-16">
              {selectedCategory !== 'Tous' || displayCategories.length > 1 ? (
                <div className="flex items-center justify-start mb-6">
                  <h2 className="text-4xl font-bold text-[#2D2D2D] mr-4">{category}</h2>
                  <span className="border-t-2 border-[#B98816] w-full mt-3" />
                </div>
              ) : null}

              <div className="space-y-10">
                {menuItems[category]?.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white/90 rounded-2xl shadow-md p-4 flex items-center justify-between gap-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-[#2D2D2D]">🌟{item.name}</h3>
                      {item.description && (
                        <p className="text-lg text-[#2D2D2D] mt-2 opacity-80">{item.description}</p>
                      )}
                      <span className="text-[#B98816] font-bold text-2xl mt-2 block">
                        {Number(item.price)} DZD
                      </span>
                    </div>
                    <div className="w-32 h-32 flex shrink-0">
                      <img
                        src={item.image || "/placeholder-food.jpg"}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => (e.target.src = "/placeholder-food.jpg")}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#2D2D2D] text-white py-12 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-8 mb-10">
              {socialLinks.map((link) => {
                const Icon = platformIcons[link.platform];
                if (!Icon) return null;
                return (
                  <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer"
                     className="text-3xl hover:scale-125 hover:text-[#B98816] transition-all">
                    <Icon />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </footer>

      <style jsx>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default MenuPage;