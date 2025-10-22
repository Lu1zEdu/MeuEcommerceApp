import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { lightColors, darkColors, ThemeColors } from '../theme/colors';

type ThemeMode = 'light' | 'dark';

interface ThemeContextData {
    theme: ThemeMode;
    colors: ThemeColors;
    toggleTheme: () => void;
    isDarkTheme: boolean;
}

const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const systemTheme = useColorScheme() ?? 'light';
    const [theme, setTheme] = useState<ThemeMode>(systemTheme);

    useEffect(() => {
        setTheme(systemTheme);
    }, [systemTheme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const colors = theme === 'light' ? lightColors : darkColors;
    const isDarkTheme = theme === 'dark';

    const contextValue: ThemeContextData = {
        theme,
        colors,
        toggleTheme,
        isDarkTheme,
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook customizado para usar o contexto do tema
export const useTheme = (): ThemeContextData => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
    }
    return context;
};