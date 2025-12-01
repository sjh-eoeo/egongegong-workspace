'use client';

import { useCallback, useSyncExternalStore } from 'react';

// 테마 외부 저장소
const getThemeSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

const getThemeServerSnapshot = () => false;

const subscribeTheme = (callback: () => void) => {
  const observer = new MutationObserver(callback);
  if (typeof document !== 'undefined') {
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
  }
  return () => observer.disconnect();
};

// mounted 외부 저장소
const getMountedSnapshot = () => typeof window !== 'undefined';
const getMountedServerSnapshot = () => false;
const subscribeMounted = () => () => {};

// 초기화 함수 (한 번만 실행)
let themeInitialized = false;
function initializeTheme() {
  if (themeInitialized || typeof window === 'undefined') return;
  themeInitialized = true;
  
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldBeDark = saved === 'dark' || (!saved && prefersDark);
  
  if (shouldBeDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function useTheme() {
  // 컴포넌트 외부에서 초기화 (side effect 없음)
  initializeTheme();
  
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
  const mounted = useSyncExternalStore(subscribeMounted, getMountedSnapshot, getMountedServerSnapshot);

  const toggleTheme = useCallback(() => {
    const newValue = !document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
    
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return { isDark, toggleTheme, mounted };
}
