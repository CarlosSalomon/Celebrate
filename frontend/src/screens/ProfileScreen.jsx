import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// --- REDUX & FIREBASE IMPORTS ---
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateUserProfile } from '../redux/slices/authSlice'; // <--- Importamos updateUserProfile
import { auth, db } from '../config/firebase';
import { signOut, updateProfile } from 'firebase/auth'; // <--- Importamos updateProfile
import { doc, updateDoc } from 'firebase/firestore';    // <--- Importamos Firestore

export default function ProfileScreen({ navigation }) {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [image, setImage] = useState(null);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            dispatch(logout());
        } catch (error) {
            console.log("Error saliendo:", error);
        }
    };

    const pickImage = async (useCamera = false) => {
        try {
            let result;
            if (useCamera) {
                await ImagePicker.requestCameraPermissionsAsync();
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'], // Actualizado para versiones nuevas de expo
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.5, // Bajamos calidad para que no pese tanto
                });
            } else {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.5,
                });
            }

            if (!result.canceled) {
                const newUri = result.assets[0].uri;
                setImage(newUri); // Actualizar estado local visualmente

                // --- GUARDAR CAMBIOS ---
                if (auth.currentUser) {
                    // 1. Actualizar en Firebase Auth (Perfil del usuario)
                    // Nota: Esto guarda la ruta local del celular. Para producción real se usaría Firebase Storage.
                    await updateProfile(auth.currentUser, { photoURL: newUri });

                    // 2. Actualizar en Firestore (Base de datos)
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, { photoURL: newUri });

                    // 3. Actualizar en Redux (Para que se vea en toda la app sin recargar)
                    dispatch(updateUserProfile({ photoURL: newUri }));
                    
                    Alert.alert("Foto Actualizada", "Tu foto de perfil se ha guardado correctamente.");
                }
            }
        } catch (error) {
            console.log("Error seleccionando imagen:", error);
            Alert.alert("Error", "No se pudo actualizar la foto.");
        }
    };

    const showOptions = () => {
        Alert.alert(
            "Foto de Perfil",
            "Selecciona una opción",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Tomar Foto 📷", onPress: () => pickImage(true) },
                { text: "Abrir Galería 🖼️", onPress: () => pickImage(false) },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Mi Perfil</Text>
            </View>

            <View style={styles.profileSection}>
                <TouchableOpacity onPress={showOptions}>
                    <View style={styles.avatarContainer}>
                        {/* Prioridad: 1. Imagen recién seleccionada, 2. Foto de Redux/Firebase, 3. Placeholder */}
                        <Image
                            source={
                                image 
                                ? { uri: image } 
                                : (user?.photoURL ? { uri: user.photoURL } : { uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' })
                            }
                            style={styles.avatar}
                        />
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={20} color="white" />
                        </View>
                    </View>
                </TouchableOpacity>

                <Text style={styles.name}>{user?.displayName || "Usuario"}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.infoCard}>
                <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                    <View style={styles.row}>
                        <Ionicons name="person-outline" size={24} color="#666" />
                        <Text style={styles.rowText}>Editar Datos Personales</Text>
                        <Ionicons name="chevron-forward" size={24} color="#ccc" />
                    </View>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                    <View style={styles.row}>
                        <Ionicons name="notifications-outline" size={24} color="#666" />
                        <Text style={styles.rowText}>Notificaciones</Text>
                        <Ionicons name="chevron-forward" size={24} color="#ccc" />
                    </View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 10 },
    title: { fontSize: 24, fontWeight: 'bold', marginLeft: 15, color: '#333' },
    profileSection: { alignItems: 'center', marginBottom: 30 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#FF6B6B' },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#333', padding: 8, borderRadius: 20 },
    name: { fontSize: 22, fontWeight: 'bold', marginTop: 15, color: '#333' },
    email: { fontSize: 16, color: 'gray', marginTop: 5 },
    infoCard: { backgroundColor: 'white', borderRadius: 15, padding: 10, elevation: 2, marginBottom: 30 },
    row: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    rowText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#333' },
    divider: { height: 1, backgroundColor: '#eee', marginLeft: 50 },
    logoutBtn: { backgroundColor: '#ffecec', padding: 15, borderRadius: 10, alignItems: 'center' },
    logoutText: { color: 'red', fontWeight: 'bold', fontSize: 16 }
});