import { create } from 'zustand';

export const useUiStore = create((set) => ({
  chatMessages: [{ role: 'assistant', content: 'Hi there! I am Wandr AI. How can I help you plan your next adventure?' }],
  isChatOpen: false,
  theme: 'light',
  notifications: [],

  addChatMessage: (msg) => set((state) => ({ 
    chatMessages: [...state.chatMessages, msg] 
  })),

  clearChat: () => set({ chatMessages: [{ role: 'assistant', content: 'Chat cleared. How can I help you?' }] }),
  
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  addNotification: (message, type = 'info') => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }]
    }));
    // Auto remove after 5s
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, 5000);
  },

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}));
