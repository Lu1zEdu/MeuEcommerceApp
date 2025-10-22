export interface ThemeColors {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    notification: string;
    placeholder: string;
    icon: string;
}

export const lightColors: ThemeColors = {
    background: '#f0f2f5',
    card: '#ffffff',
    text: '#1c1e21',
    textSecondary: '#65676b',
    border: '#dce0e6',
    primary: '#007bff',
    notification: '#dc3545',
    placeholder: '#90949c',
    icon: '#65676b',
};

export const darkColors: ThemeColors = {
    background: '#18191a',
    card: '#242526',
    text: '#e4e6eb',
    textSecondary: '#b0b3b8',
    border: '#3a3b3c',
    primary: '#2d88ff',
    notification: '#e5484d',
    placeholder: '#8a8d91',
    icon: '#b0b3b8',
};