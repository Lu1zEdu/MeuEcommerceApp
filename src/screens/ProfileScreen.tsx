import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Alert,
    Switch,
    TouchableOpacity,
    ScrollView, // Adicionado ScrollView
    SafeAreaView // Adicionado SafeAreaView
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons'; // Importar Ícones

// Usar require para a imagem default local
const defaultProfilePic = require('../../assets/avatar-default.jpg');

export default function ProfileScreen() {
    const { colors, isDarkTheme, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const user = auth.currentUser;
    const currentLanguage = i18n.language;

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Navegação para Login é tratada pelo AppNavigator
        } catch (error: any) {
            Alert.alert(t('alertErrorTitle'), t('errorLogoutFailed'));
        }
    };

    const changeLanguage = (lang: 'pt' | 'en') => {
        i18n.changeLanguage(lang);
    };

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollViewContent: {
            alignItems: 'center', // Centraliza conteúdo do scroll
            paddingVertical: 30, // Espaçamento vertical
            paddingHorizontal: 20,
        },
        profileImageContainer: { // Container para sombra/borda
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 5,
            borderRadius: 75, // Metade do tamanho da imagem
            backgroundColor: colors.card, // Fundo caso imagem falhe
        },
        profileImage: {
            width: 150, // Maior
            height: 150,
            borderRadius: 75, // Metade do tamanho
            borderWidth: 3, // Borda sutil
            borderColor: colors.primary, // Cor da borda
        },
        userName: {
            fontSize: 24, // Um pouco maior
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 5,
            textAlign: 'center',
        },
        emailText: {
            fontSize: 16,
            color: colors.textSecondary,
            marginBottom: 40, // Mais espaço antes das configurações
            textAlign: 'center',
        },
        sectionContainer: { // Container para agrupar configurações
            width: '100%', // Ocupa largura total
            maxWidth: 400, // Limite máximo para telas grandes
            backgroundColor: colors.card,
            borderRadius: 10,
            marginBottom: 20,
            paddingHorizontal: 15,
            borderWidth: 1,
            borderColor: colors.border,
        },
        settingRow: { // Linha para cada configuração
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        settingRowNoBorder: { // Para o último item da seção
            borderBottomWidth: 0,
        },
        settingLeft: { // Ícone e Texto da configuração
            flexDirection: 'row',
            alignItems: 'center',
        },
        settingIcon: {
            marginRight: 15,
        },
        settingText: {
            fontSize: 16,
            color: colors.text,
        },
        languageButtonsContainer: { // Container específico para botões de idioma
            flexDirection: 'row',
        },
        languageButton: {
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 15, // Mais arredondado
            marginLeft: 8,
            borderWidth: 1,
            borderColor: 'transparent', // Borda transparente por padrão
        },
        languageButtonActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        languageButtonInactive: {
            backgroundColor: colors.background, // Fundo sutil
            borderColor: colors.border,
        },
        languageButtonText: {
            fontSize: 14,
            fontWeight: 'bold',
        },
        languageButtonTextActive: {
            color: colors.card, // Texto branco no botão ativo
        },
        languageButtonTextInactive: {
            color: colors.textSecondary, // Texto cinza no botão inativo
        },
        logoutButton: { // Estilo específico para botão de logout
            width: '100%',
            maxWidth: 400,
            backgroundColor: colors.notification, // Vermelho
            paddingVertical: 15,
            borderRadius: 10,
            alignItems: 'center',
            marginTop: 20, // Espaço acima do botão
        },
        logoutButtonText: {
            color: '#fff', // Texto branco
            fontSize: 16,
            fontWeight: 'bold',
        },
        placeholder: {
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 30,
            textAlign: 'center',
        }
    });


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={user?.photoURL ? { uri: user.photoURL } : defaultProfilePic}
                        style={styles.profileImage}
                        defaultSource={defaultProfilePic} // Mostra enquanto carrega a URL
                    />
                </View>

                <Text style={styles.userName}>
                    {user?.displayName || t('nameNotDefined', 'Nome não definido')}
                </Text>
                <Text style={styles.emailText}>
                    {user?.email ?? t('emailNotFound', 'E-mail não encontrado')}
                </Text>

                <View style={styles.sectionContainer}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Ionicons name={isDarkTheme ? "moon" : "sunny"} size={22} color={colors.textSecondary} style={styles.settingIcon} />
                            <Text style={styles.settingText}>{t('profileDarkMode')}</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#767577", true: colors.primary }}
                            thumbColor={"#f4f3f4"} // Branco para ambos os casos
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleTheme}
                            value={isDarkTheme}
                        />
                    </View>

                    {/* Idioma */}
                    <View style={[styles.settingRow, styles.settingRowNoBorder]}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="language" size={22} color={colors.textSecondary} style={styles.settingIcon} />
                            <Text style={styles.settingText}>{t('profileLanguage')}</Text>
                        </View>
                        <View style={styles.languageButtonsContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.languageButton,
                                    currentLanguage === 'pt' ? styles.languageButtonActive : styles.languageButtonInactive
                                ]}
                                onPress={() => changeLanguage('pt')}
                                disabled={currentLanguage === 'pt'}
                            >
                                <Text style={[
                                    styles.languageButtonText,
                                    currentLanguage === 'pt' ? styles.languageButtonTextActive : styles.languageButtonTextInactive
                                ]}>
                                    {t('pt')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.languageButton,
                                    currentLanguage === 'en' ? styles.languageButtonActive : styles.languageButtonInactive
                                ]}
                                onPress={() => changeLanguage('en')}
                                disabled={currentLanguage === 'en'}
                            >
                                <Text style={[
                                    styles.languageButtonText,
                                    currentLanguage === 'en' ? styles.languageButtonTextActive : styles.languageButtonTextInactive
                                ]}>
                                    {t('en')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>{t('profileLogoutButton')}</Text>
                </TouchableOpacity>


                <Text style={styles.placeholder}>v{require('../../package.json').version}</Text>

            </ScrollView>
        </SafeAreaView>
    );
}