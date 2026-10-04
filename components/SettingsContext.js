"use client";
import { createContext, useContext } from 'react';
import { DEFAULT_SETTINGS } from '../lib/settings';
export const SettingsContext = createContext(DEFAULT_SETTINGS);
export const useSettings = () => useContext(SettingsContext);
