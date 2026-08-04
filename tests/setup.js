/**
 * @file tests/setup.js
 * @description Configuração global para os testes Jest
 * Mock de APIs do browser que não existem no jsdom
 */

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock navigator.mediaDevices (Camera API)
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
    enumerateDevices: jest.fn().mockResolvedValue([]),
  },
  writable: true,
});

// Mock navigator.share (Web Share API)
Object.defineProperty(global.navigator, 'share', {
  value: jest.fn().mockResolvedValue(undefined),
  writable: true,
});

// Mock navigator.clipboard
Object.defineProperty(global.navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
  writable: true,
});

// Silenciar console.warn e console.log durante testes (manter error visível)
global.console.warn = jest.fn();
global.console.log = jest.fn();

// Limpar localStorage antes de cada teste
beforeEach(() => {
  localStorageMock.clear();
  sessionStorageMock.clear();
});
