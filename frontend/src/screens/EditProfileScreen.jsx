import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { updateUserProfile } from '../redux/slices/authSlice';

export default function EditProfileScreen({ navigation }) {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [name, setName] = useState(user?.displayName || '');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!name.trim()) return Alert.alert("Error", "El nombre no puede estar vacío");

        setLoading(true);
        try {
            if (auth.currentUser) {

                await updateProfile(auth.currentUser, { displayName: name });


                if (password.length > 0) {
                    if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");
                    await updatePassword(auth.currentUser, password);
                }


                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    username: name
                });


                dispatch(updateUserProfile({
                    displayName: name
                }));

                Alert.alert("Éxito", "Perfil actualizado correctamente", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                Alert.alert("Seguridad", "Para cambiar la contraseña, por favor cierra sesión y vuelve a entrar.");
            } else {
                Alert.alert("Error", error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Editar Datos</Text>
            </View>

            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.label}>Nueva Contraseña (Opcional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Deja vacío para mantener la actual"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.saveBtnText}>GUARDAR CAMBIOS</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 10 },
    title: { fontSize: 24, fontWeight: 'bold', marginLeft: 15, color: '#333' },
    label: { fontSize: 14, marginBottom: 8, color: '#666', fontWeight: 'bold' },
    input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#eee', fontSize: 16 },
    saveBtn: { backgroundColor: '#333', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});