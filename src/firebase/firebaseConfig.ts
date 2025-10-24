import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, onSnapshot, serverTimestamp, Timestamp, limit, documentId, orderBy } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { getReactNativePersistence } = require('firebase/auth') as any

const firebaseConfig = {
    apiKey: "AIzaSyAbLBp70xCGbPM2KhzUWn5AbAwE94S4ZEU",
    authDomain: "meuecommerceapptrabalho.firebaseapp.com",
    projectId: "meuecommerceapptrabalho",
    storageBucket: "meuecommerceapptrabalho.firebasestorage.app",
    messagingSenderId: "476709802773",
    appId: "1:476709802773:web:d596d914918cf3e694cf1c",
    measurementId: "G-MWWKV93K43"
};


const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

const db = initializeFirestore(app, { experimentalForceLongPolling: true });

export {
    auth,
    db,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    limit,
    documentId,
    onSnapshot,
    serverTimestamp,
    orderBy,
    Timestamp
};