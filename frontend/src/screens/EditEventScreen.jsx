import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert, ScrollView, View, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import MyInput from '../components/MyInput';
import MyButton from '../components/MyButton';

export default function EditEventScreen({ navigation, route }) {
    const { eventId } = route.params;

    const [name, setName] = useState('');
    const [eventType, setEventType] = useState('Boda');
    const [budget, setBudget] = useState('');
    const [guestCount, setGuestCount] = useState('');
    const [date, setDate] = useState(new Date());

    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);


    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const docRef = doc(db, 'events', eventId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.name);
                    setEventType(data.eventType);
                    setBudget(data.budget.toString());
                    setGuestCount(data.guestCount.toString());
                    setDate(new Date(data.date));
                } else {
                    Alert.alert("Error", "El evento no existe");
                    navigation.goBack();
                }
            } catch (error) {
                console.error("Error cargando evento:", error);
                Alert.alert("Error", "No se pudieron cargar los datos");
            } finally {
                setLoading(false);
            }
        };

        fetchEventData();
    }, [eventId]);


    const handleUpdate = async () => {
        if (!name || !budget) {
            return Alert.alert("Faltan datos", "Nombre y presupuesto son obligatorios.");
        }

        setSaving(true);
        try {
            const eventRef = doc(db, 'events', eventId);

            await updateDoc(eventRef, {
                name,
                eventType,
                date: date.toISOString(),
                budget: Number(budget),
                guestCount: Number(guestCount)
            });

            Alert.alert("¡Éxito!", "Evento actualizado correctamente.");
            navigation.goBack();

        } catch (error) {
            console.error("Error actualizando:", error);
            Alert.alert("Error", "No se pudo actualizar el evento.");
        } finally {
            setSaving(false);
        }
    };

    const eventTypes = ['Boda', 'Cumpleaños 15', 'Fiesta', 'Corporativo', 'Otro'];

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FF6B6B" />
                <Text style={{ marginTop: 10, color: '#666' }}>Cargando datos...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Editar Evento ✏️</Text>
            </View>

            <MyInput
                label="Nombre del Evento"
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
                    onChange={(e, d) => { setShowPicker(false); if (d) setDate(d); }}
                />
            )}

            <MyInput
                label="Presupuesto ($)"
                keyboardType="numeric"
                value={budget}
                onChangeText={setBudget}
            />

            <MyInput
                label="Cantidad de Invitados"
                keyboardType="numeric"
                value={guestCount}
                onChangeText={setGuestCount}
            />

            <MyButton
                title="GUARDAR CAMBIOS"
                onPress={handleUpdate}
                loading={saving}
            />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    title: { fontSize: 24, fontWeight: 'bold', marginLeft: 15, color: '#333' },
    label: { marginBottom: 8, fontWeight: 'bold', color: '#555', fontSize: 14, textTransform: 'uppercase' },

    typeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
    typeBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 10, marginBottom: 10, backgroundColor: '#fff' },
    typeBtnSelected: { backgroundColor: '#333', borderColor: '#333' },
    typeText: { color: '#666', fontSize: 14 },
    typeTextSelected: { color: 'white', fontWeight: 'bold' },

    dateBtn: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#f9f9f9', borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
    dateText: { fontSize: 16, color: '#333' },
});