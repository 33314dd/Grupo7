import { create } from 'zustand';

export const useEventStore = create((set, get) => ({
  events: [],
  selectedEvent: null,
  filters: {
    category: '',
    location: '',
    date_from: '',
    date_to: '',
    price_max: null,
    search: '',
  },
  
  setEvents: (events) => set({ events }),
  
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  
  addEvent: (event) => set((state) => ({
    events: [event, ...state.events],
  })),
  
  updateEvent: (eventId, updates) => set((state) => ({
    events: state.events.map((event) =>
      event.id === eventId ? { ...event, ...updates } : event
    ),
    selectedEvent: state.selectedEvent?.id === eventId 
      ? { ...state.selectedEvent, ...updates } 
      : state.selectedEvent,
  })),
  
  removeEvent: (eventId) => set((state) => ({
    events: state.events.filter((event) => event.id !== eventId),
    selectedEvent: state.selectedEvent?.id === eventId ? null : state.selectedEvent,
  })),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),
  
  clearFilters: () => set({
    filters: {
      category: '',
      location: '',
      date_from: '',
      date_to: '',
      price_max: null,
      search: '',
    },
  }),
}));