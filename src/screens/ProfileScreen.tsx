import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Alert,
    Switch,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    TextInput,
    ActivityIndicator,
    Platform
} from 'react-native';
import { signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultProfilePic = require('../../assets/avatar-default.jpg');
const LOCAL_AVATAR_KEY = '@MeuEcommerceApp:localAvatarUri';

export default function ProfileScreen() {
    const { colors, isDarkTheme, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const user = auth.currentUser;
    const currentLanguage = i18n.language;

    const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
    const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => {
        const loadLocalAvatar = async () => {
            try {
                const savedUri = await AsyncStorage.getItem(LOCAL_AVATAR_KEY);
                if (savedUri) {
                    setLocalAvatarUri(savedUri);
                }
            } catch (e) {
                console.error("Erro ao carregar avatar local:", e);
            } finally {
                setIsLoadingAvatar(false);
            }
        };
        loadLocalAvatar();
    }, []);

    const handleSelectImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert(t('permissionDenied', 'Permissão para acessar a galeria negada!'));
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setLocalAvatarUri(uri);
            try {
                await AsyncStorage.setItem(LOCAL_AVATAR_KEY, uri);
            } catch (e) {
                console.error("Erro ao salvar avatar local:", e);
                alert(t('errorSavingAvatar', 'Não foi possível salvar a imagem de perfil.'));
            }
        }
    };

    const handleUpdatePassword = async () => {
        if (!user || !user.email) {
            Alert.alert(t('alertErrorTitle'), t('errorUserNotFound', 'Usuário não encontrado.'));
            return;
        }
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            Alert.alert(t('alertErrorTitle'), t('errorFillAllPasswordFields', 'Preencha a senha atual e a nova senha (com confirmação).'));
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert(t('alertErrorTitle'), t('errorPasswordTooShort', 'A nova senha deve ter pelo menos 6 caracteres.'));
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert(t('alertErrorTitle'), t('errorPasswordsMismatch', 'As novas senhas não coincidem.'));
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            await updatePassword(user, newPassword);

            Alert.alert(t('alertSuccessTitle'), t('passwordUpdatedSuccess', 'Senha atualizada com sucesso!'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setShowPasswordFields(false);

        } catch (error: any) {
            console.error("Erro ao atualizar senha:", error);
            let errorMessage = t('errorUpdatingPassword', 'Erro ao atualizar a senha.');
            if (error.code === 'auth/wrong-password') {
                errorMessage = t('errorWrongCurrentPassword', 'A senha atual está incorreta.');
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = t('errorTooManyRequests', 'Muitas tentativas. Tente novamente mais tarde.');
            } else if (error.code === 'auth/weak-password') {
                errorMessage = t('errorWeakPassword', 'A nova senha é muito fraca.');
            }
            Alert.alert(t('alertErrorTitle'), errorMessage);
        } finally {
            setIsUpdatingPassword(false);
        }
    };


    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error: any) {
            Alert.alert(t('alertErrorTitle'), t('errorLogoutFailed'));
        }
    };

    const changeLanguage = (lang: 'pt' | 'en') => {
        i18n.changeLanguage(lang);
    };

    const displayImageSource = localAvatarUri
        ? { uri: localAvatarUri }
        : (user?.photoURL ? { uri: user.photoURL } : defaultProfilePic);


    const styles = StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        scrollViewContent: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20 },
        profileImageContainer: { marginBottom: 10, position: 'relative' },
        profileImageTouchable: {
            borderRadius: 75,
            overflow: 'hidden',
        },
        profileImageWrapper: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 5,
            borderRadius: 75,
            backgroundColor: colors.card,
        },
        profileImage: { width: 150, height: 150, borderRadius: 75, borderWidth: 3, borderColor: colors.primary },
        editIconContainer: {
            position: 'absolute',
            bottom: 5,
            right: 5,
            backgroundColor: colors.primary,
            borderRadius: 15,
            padding: 5,
            borderWidth: 1,
            borderColor: colors.card,
        },
        userName: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 5, textAlign: 'center' },
        emailText: { fontSize: 16, color: colors.textSecondary, marginBottom: 30, textAlign: 'center' },
        sectionContainer: { width: '100%', maxWidth: 400, backgroundColor: colors.card, borderRadius: 10, marginBottom: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: colors.border },
        settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
        settingRowTouchable: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        settingRowNoBorder: { borderBottomWidth: 0 },
        settingLeft: { flexDirection: 'row', alignItems: 'center' },
        settingIcon: { marginRight: 15, width: 24, textAlign: 'center' },
        settingText: { fontSize: 16, color: colors.text },
        languageButtonsContainer: { flexDirection: 'row' },
        languageButton: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 15, marginLeft: 8, borderWidth: 1, borderColor: 'transparent' },
        languageButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
        languageButtonInactive: { backgroundColor: colors.background, borderColor: colors.border },
        languageButtonText: { fontSize: 14, fontWeight: 'bold' },
        languageButtonTextActive: { color: colors.card },
        languageButtonTextInactive: { color: colors.textSecondary },
        passwordSection: {
            paddingTop: 15,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            marginTop: 5,
        },
        inputLabel: {
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 5,
            marginLeft: 2,
        },
        input: {
            height: 45,
            borderColor: colors.border,
            borderWidth: 1,
            marginBottom: 15,
            paddingHorizontal: 10,
            borderRadius: 8,
            fontSize: 15,
            backgroundColor: colors.background,
            color: colors.text,
        },
        updatePasswordButton: {
            backgroundColor: colors.primary,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 5,
        },
        updatePasswordButtonDisabled: {
            backgroundColor: colors.textSecondary,
        },
        updatePasswordButtonText: {
            color: colors.card,
            fontSize: 15,
            fontWeight: 'bold',
        },
        logoutButton: { width: '100%', maxWidth: 400, backgroundColor: colors.notification, paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
        logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
        versionText: { fontSize: 12, color: colors.textSecondary, marginTop: 30, textAlign: 'center' }
    });


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
                <View style={styles.profileImageContainer}>
                    <TouchableOpacity onPress={handleSelectImage} style={styles.profileImageTouchable} activeOpacity={0.8}>
                        <View style={styles.profileImageWrapper}>
                            {isLoadingAvatar ? (
                                <View style={[styles.profileImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.border }]}>
                                    <ActivityIndicator color={colors.primary} />
                                </View>
                            ) : (
                                <Image
                                    source={displayImageSource}
                                    style={styles.profileImage}
                                    onError={() => {
                                        console.warn('Falha ao carregar imagem de perfil, usando default.');
                                        setLocalAvatarUri(null);
                                        AsyncStorage.removeItem(LOCAL_AVATAR_KEY);
                                    }}
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSelectImage} style={styles.editIconContainer} activeOpacity={0.8}>
                        <Ionicons name="pencil" size={15} color={colors.card} />
                    </TouchableOpacity>
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
                            <Ionicons name={isDarkTheme ? "moon-outline" : "sunny-outline"} size={22} color={colors.textSecondary} style={styles.settingIcon} />
                            <Text style={styles.settingText}>{t('profileDarkMode')}</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#767577", true: colors.primary }}
                            thumbColor={"#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleTheme}
                            value={isDarkTheme}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="language-outline" size={22} color={colors.textSecondary} style={styles.settingIcon} />
                            <Text style={styles.settingText}>{t('profileLanguage')}</Text>
                        </View>
                        <View style={styles.languageButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.languageButton, currentLanguage === 'pt' ? styles.languageButtonActive : styles.languageButtonInactive]}
                                onPress={() => changeLanguage('pt')} disabled={currentLanguage === 'pt'} >
                                <Text style={[styles.languageButtonText, currentLanguage === 'pt' ? styles.languageButtonTextActive : styles.languageButtonTextInactive]}>{t('pt')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.languageButton, currentLanguage === 'en' ? styles.languageButtonActive : styles.languageButtonInactive]}
                                onPress={() => changeLanguage('en')} disabled={currentLanguage === 'en'} >
                                <Text style={[styles.languageButtonText, currentLanguage === 'en' ? styles.languageButtonTextActive : styles.languageButtonTextInactive]}>{t('en')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.settingRowTouchable, showPasswordFields ? {} : styles.settingRowNoBorder]}
                        onPress={() => setShowPasswordFields(!showPasswordFields)}
                        activeOpacity={0.6}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="lock-closed-outline" size={22} color={colors.textSecondary} style={styles.settingIcon} />
                            <Text style={styles.settingText}>{t('changePassword', 'Alterar Senha')}</Text>
                        </View>
                        <Ionicons name={showPasswordFields ? "chevron-up-outline" : "chevron-down-outline"} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {showPasswordFields && (
                        <View style={styles.passwordSection}>
                            <Text style={styles.inputLabel}>{t('currentPassword', 'Senha Atual')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterCurrentPassword', 'Digite sua senha atual')}
                                placeholderTextColor={colors.placeholder}
                                secureTextEntry
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                autoCapitalize="none"
                                keyboardAppearance={isDarkTheme ? 'dark' : 'light'}
                            />
                            <Text style={styles.inputLabel}>{t('newPassword', 'Nova Senha')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterNewPassword', 'Digite a nova senha (mín. 6 caracteres)')}
                                placeholderTextColor={colors.placeholder}
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                                autoCapitalize="none"
                                keyboardAppearance={isDarkTheme ? 'dark' : 'light'}
                            />
                            <Text style={styles.inputLabel}>{t('confirmNewPassword', 'Confirmar Nova Senha')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('confirmNewPasswordPlaceholder', 'Digite a nova senha novamente')}
                                placeholderTextColor={colors.placeholder}
                                secureTextEntry
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                                autoCapitalize="none"
                                keyboardAppearance={isDarkTheme ? 'dark' : 'light'}
                            />
                            <TouchableOpacity
                                style={[styles.updatePasswordButton, isUpdatingPassword && styles.updatePasswordButtonDisabled]}
                                onPress={handleUpdatePassword}
                                disabled={isUpdatingPassword}
                            >
                                {isUpdatingPassword ? (
                                    <ActivityIndicator size="small" color={colors.card} />
                                ) : (
                                    <Text style={styles.updatePasswordButtonText}>{t('updatePasswordButton', 'Atualizar Senha')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>{t('profileLogoutButton')}</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>v{require('../../package.json').version}</Text>

            </ScrollView>
        </SafeAreaView>
    );
}