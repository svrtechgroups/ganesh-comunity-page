'use client';

import { createContext, useContext } from 'react';

export interface AdminSidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const AdminSidebarContext = createContext<AdminSidebarContextType>({
  sidebarOpen: true,
  setSidebarOpen: () => {},
  toggleSidebar: () => {},
});

export const useAdminSidebar = () => useContext(AdminSidebarContext);

export interface AdminGlobalEventContextType {
  globalEventId: string;
  setGlobalEventId: (id: string) => void;
}

export const AdminGlobalEventContext = createContext<AdminGlobalEventContextType>({
  globalEventId: 'all',
  setGlobalEventId: () => {},
});

export const useAdminGlobalEvent = () => useContext(AdminGlobalEventContext);
