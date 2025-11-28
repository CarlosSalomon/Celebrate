
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/slices/authSlice';

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLocalLoading] = useState(false);
    const dispatch = useDispatch();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            return Alert.alert("Error", "Todos los campos son obligatorios");
        }
        setLocalLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: name });
            await setDoc(doc(db, "users", user.uid), {
                username: name,
                email: email,
                role: 'client',
                createdAt: new Date().toISOString()
            });

            dispatch(loginSuccess({
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: name
                },
                token: await user.getIdToken()
            }));
        } catch (error) {
            console.log(error);
            Alert.alert("Error al registrar", error.message);
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Crear Cuenta</Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre Completo"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Contraseña (mín 6 caracteres)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.btn}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Registrarse</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.link}>Volver al inicio</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f7f7f794' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 30 },
    input: { backgroundColor: '#ffffffff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
    btn: { backgroundColor: '#d67171ff', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    link: { color: '#666', textAlign: 'center', marginTop: 20 }
});