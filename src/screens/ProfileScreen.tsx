import React from 'react';
import { View, Text, StyleSheet, Button, Image, Alert, Switch, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const defaultProfilePic = 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=User';

export default function ProfileScreen() {
    const { colors, isDarkTheme, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const user = auth.currentUser;
    const currentLanguage = i18n.language;

    const handleLogout = async () => {
        try { await signOut(auth); } catch (error: any) { Alert.alert(t('alertErrorTitle'), t('errorLogoutFailed')); }
    };

    const changeLanguage = (lang: 'pt' | 'en') => {
        i18n.changeLanguage(lang);
    };

    const styles = StyleSheet.create({
        container: { flex: 1, alignItems: 'center', paddingTop: 40, backgroundColor: colors.background, paddingHorizontal: 20 },
        profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, backgroundColor: colors.border },
        userName: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
        emailText: { fontSize: 16, color: colors.textSecondary, marginBottom: 40 },
        buttonContainer: { width: '80%', marginBottom: 20 },
        themeToggleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '80%', marginTop: 20, marginBottom: 10, paddingVertical: 10, paddingHorizontal: 15, backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
        themeToggleText: { fontSize: 16, color: colors.text },
        languageContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '80%',
            marginBottom: 20,
            paddingVertical: 10,
            paddingHorizontal: 15,
            backgroundColor: colors.card,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
        },
        languageLabel: {
            fontSize: 16,
            color: colors.text,
            marginRight: 10,
        },
        languageButtons: {
            flexDirection: 'row',
        },
        languageButton: {
            paddingVertical: 5,
            paddingHorizontal: 12,
            borderRadius: 5,
            marginLeft: 10,
        },
        languageButtonText: {
            fontSize: 14,
            fontWeight: 'bold',
        },
        placeholder: { fontSize: 16, color: colors.textSecondary, marginTop: 10 }
    });


    return (
        <View style={styles.container}>
            <Image source={{ uri: user?.photoURL || defaultProfilePic }} style={styles.profileImage} />
            <Text style={styles.userName}> {user?.displayName || 'Nome não definido'} </Text>
            <Text style={styles.emailText}> {t('profileLoggedInAs')} {user?.email ?? 'E-mail não encontrado'} </Text>

            {/* Toggle Tema */}
            <View style={styles.themeToggleContainer}>
                <Text style={styles.themeToggleText}>{t('profileDarkMode')}</Text>
                <Switch trackColor={{ false: "#767577", true: "#81b0ff" }} thumbColor={isDarkTheme ? colors.primary : "#f4f3f4"} ios_backgroundColor="#3e3e3e" onValueChange={toggleTheme} value={isDarkTheme} />
            </View>

            {/* Seletor de Idioma */}
            <View style={styles.languageContainer}>
                <Text style={styles.languageLabel}>{t('profileLanguage')}</Text>
                <View style={styles.languageButtons}>
                    <TouchableOpacity
                        style={[
                            styles.languageButton,
                            { backgroundColor: currentLanguage === 'pt' ? colors.primary : colors.border } // Destaque para o idioma ativo
                        ]}
                        onPress={() => changeLanguage('pt')}
                        disabled={currentLanguage === 'pt'} // Desativa se já for PT
                    >
                        <Text style={[styles.languageButtonText, { color: currentLanguage === 'pt' ? colors.card : colors.textSecondary }]}>
                            {t('pt')} {/* Mostra "Português" */}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.languageButton,
                            { backgroundColor: currentLanguage === 'en' ? colors.primary : colors.border }
                        ]}
                        onPress={() => changeLanguage('en')}
                        disabled={currentLanguage === 'en'}
                    >
                        <Text style={[styles.languageButtonText, { color: currentLanguage === 'en' ? colors.card : colors.textSecondary }]}>
                            {t('en')} {/* Mostra "English" */}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <Button title={t('profileLogoutButton')} onPress={handleLogout} color={colors.notification} />
            </View>

            <Text style={styles.placeholder}>Mais opções em breve...</Text>
        </View>
    );
}