import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert, ScrollView, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

// --- REDUX & FIREBASE ---
import { useSelector } from 'react-redux';
import { collection, addDoc } from 'firebase/firestore'; 
import { db } from '../config/firebase';

// --- COMPONENTES REUTILIZABLES ---
import MyInput from '../components/MyInput';
import MyButton from '../components/MyButton';

export default function CreateEventScreen({ navigation }) {
    const { user } = useSelector((state) => state.auth);

    const [name, setName] = useState('');
    const [eventType, setEventType] = useState('Boda'); 
    const [budget, setBudget] = useState('');
    const [guestCount, setGuestCount] = useState('');
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name || !budget) {
            return Alert.alert("Faltan datos", "Nombre y presupuesto son obligatorios.");
        }

        setLoading(true);
        try {
            const newEvent = {
                userId: user.uid,
                name,
                eventType,
                date: date.toISOString(),
                budget: Number(budget),
                guestCount: Number(guestCount),
                createdAt: new Date().toISOString(),
                status: { dj: false, catering: false, decoration: false, venue: false, photography: false },
                hiredVendors: []
            };

            await addDoc(collection(db, "events"), newEvent);

            Alert.alert("¡Éxito!", "Evento creado correctamente.");
            navigation.navigate('Home');

        } catch (error) {
            console.log("Error creando evento:", error);
            Alert.alert("Error", "No se pudo crear el evento.");
        } finally {
            setLoading(false);
        }
    };

    const eventTypes = ['Boda', 'Cumpleaños 15', 'Fiesta', 'Corporativo', 'Otro'];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{marginBottom: 10}}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.title}>Nuevo Evento ✨</Text>

            
            <MyInput 
                label="Nombre del Evento"
                placeholder="Ej: Boda de Ana y Juan"
                value={name}
                onChangeText={setName}
            />
            
            <Text style={styles.label}>Tipo de Evento</Text>
            <View style={styles.typeContainer}>
                {eventTypes.map((type) => (
                    <TouchableOpacity 
                        key={type} 
                        style={[styles.typeBtn, eventType === type && styles.typeBtnSelected]} 
                        onPress={() => setEventType(type)}
                    >
                        <Text style={[styles.typeText, eventType === type && styles.typeTextSelected]}>
                            {type}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Fecha del Evento</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateBtn}>
                <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker 
                    value={date} 
                    mode="date" 
                    onChange={(e, d) => { setShowPicker(false); if(d) setDate(d); }} 
                />
            )}

            <MyInput 
                label="Presupuesto ($)"
                placeholder="0"
                keyboardType="numeric"
                value={budget}
                onChangeText={setBudget}
            />

            <MyInput 
                label="Cantidad de Invitados"
                placeholder="0"
                keyboardType="numeric"
                value={guestCount}
                onChangeText={setGuestCount}
            />

            
            <MyButton 
                title="CREAR EVENTO" 
                onPress={handleCreate} 
                loading={loading} 
            />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    label: { marginBottom: 8, fontWeight: 'bold', color: '#555', fontSize: 14, textTransform: 'uppercase' },
    typeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
    typeBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 10, marginBottom: 10, backgroundColor: '#fff' },
    typeBtnSelected: { backgroundColor: '#333', borderColor: '#333' },
    typeText: { color: '#666', fontSize: 14 },
    typeTextSelected: { color: 'white', fontWeight: 'bold' },
    dateBtn: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#f9f9f9', borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
    dateText: { fontSize: 16, color: '#333' },
});