import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

const TRANSLATE_COOKIE_NAME = 'googtrans';
const COOKIE_EXPIRE = 'Thu, 01 Jan 1970 00:00:00 GMT';

const isLocalhost = (host: string) => {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
};

const getRootDomain = (hostname: string) => {
  const parts = hostname.split('.');
  if (parts.length <= 1) {
    return hostname;
  }

  const commonTlds = ['co.uk', 'com.au', 'org.uk', 'gov.uk', 'ac.uk'];
  const lastTwo = parts.slice(-2).join('.');
  if (commonTlds.includes(lastTwo) && parts.length > 2) {
    return parts.slice(-3).join('.');
  }

  return lastTwo;
};

const getDomainVariants = () => {
  const hostname = window.location.hostname;
  const variants = new Set<string>();
  variants.add(hostname);

  if (!isLocalhost(hostname) && hostname.includes('.')) {
    variants.add(`.${hostname}`);
    const root = getRootDomain(hostname);
    variants.add(root);
    variants.add(`.${root}`);
  }

  return Array.from(variants);
};

const writeCookie = (name: string, value: string, domain?: string) => {
  let cookie = `${name}=${value};path=/;SameSite=Lax;`;
  if (domain) cookie += `domain=${domain};`;
  if (window.location.protocol === 'https:') cookie += 'secure;';
  document.cookie = cookie;
};

const deleteCookie = (name: string, domain?: string) => {
  let cookie = `${name}=;expires=${COOKIE_EXPIRE};path=/;`;
  if (domain) cookie += `domain=${domain};`;
  document.cookie = cookie;
};

const readCookie = (name: string) => {
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
};

export const LanguageToggle = () => {
  const [language, setLanguage] = useState<'en' | 'ur'>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cookieValue = readCookie(TRANSLATE_COOKIE_NAME);
    setLanguage(cookieValue === '/en/ur' ? 'ur' : 'en');
  }, []);

  const syncTranslateCookie = (nextLanguage: 'en' | 'ur') => {
    const variants = getDomainVariants();

    if (nextLanguage === 'en') {
      deleteCookie(TRANSLATE_COOKIE_NAME);
      variants.forEach(domain => deleteCookie(TRANSLATE_COOKIE_NAME, domain));
      return;
    }

    const cookieValue = '/en/ur';
    writeCookie(TRANSLATE_COOKIE_NAME, cookieValue);
    variants.forEach(domain => writeCookie(TRANSLATE_COOKIE_NAME, cookieValue, domain));
  };

  const toggleLanguage = () => {
    const nextLanguage = language === 'en' ? 'ur' : 'en';
    syncTranslateCookie(nextLanguage);
    setLanguage(nextLanguage);
    window.location.reload();
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/70 border border-border text-xs font-bold uppercase tracking-wider transition-all hover:bg-muted/90 text-foreground"
      aria-label="Toggle Language"
      title={language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
    >
      <Globe size={16} />
      <span className="hidden sm:inline">{language === 'en' ? 'URDU' : 'ENGLISH'}</span>
    </button>
  );
};

