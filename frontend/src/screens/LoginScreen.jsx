import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useDispatch } from 'react-redux';
import { setLoading, loginSuccess, loginFailure } from '../redux/slices/authSlice';

const appLogo = require('../../assets/images/icon.png');

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localLoading, setLocalLoading] = useState(false);

    const dispatch = useDispatch();

    const handleLogin = async () => {
        if (email === '' || password === '') {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        setLocalLoading(true);
        dispatch(setLoading(true));

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            dispatch(loginSuccess({
                user: {
                    uid: user.uid,
                    email: user.email,
                },
                token: await user.getIdToken()
            }));

        } catch (error) {
            console.log(error);
            let msg = 'Error al iniciar sesión';
            if (error.code === 'auth/invalid-email') msg = 'Email inválido';
            if (error.code === 'auth/user-not-found') msg = 'Usuario no encontrado';
            if (error.code === 'auth/wrong-password') msg = 'Contraseña incorrecta';
            if (error.code === 'auth/invalid-credential') msg = 'Credenciales incorrectas';

            Alert.alert('Error', msg);
            dispatch(loginFailure(msg));
        } finally {
            setLocalLoading(false);
            dispatch(setLoading(false));
        }
    };

    return (
        <View style={styles.container}>


            <Image source={appLogo} style={styles.logo} />




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
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.btn}
                onPress={handleLogin}
                disabled={localLoading}
            >
                {localLoading ? <ActivityIndicator color="#ffffffff" /> : <Text style={styles.btnText}>Ingresar</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#ffffffff' },


    logo: {
        width: 300,
        height: 300,
        alignSelf: 'center',
        marginBottom: 20,
        resizeMode: 'contain'
    },

    title: { fontSize: 32, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
    subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 30 },
    input: { backgroundColor: '#ffffffff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
    btn: { backgroundColor: '#d81010ff', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    link: { color: '#FF6B6B', textAlign: 'center', marginTop: 20 }
});