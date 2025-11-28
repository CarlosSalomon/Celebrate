import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- FIRESTORE IMPORTS ---
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    onSnapshot, 
    doc, 
    deleteDoc, 
    updateDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';
// -------------------------

export default function GuestListScreen({ navigation, route }) {
    const { eventId } = route.params || {}; 
    const [guests, setGuests] = useState([]);
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(true);

    // 1. ESCUCHAR INVITADOS EN TIEMPO REAL
    useEffect(() => { 
        if (!eventId) {
            setLoading(false);
            return;
        }

        // Creamos la referencia a la colección 'guests'
        const guestsRef = collection(db, 'guests');
        
        // Query: Traer solo los invitados de ESTE evento
        const q = query(guestsRef, where('eventId', '==', eventId));

        // Suscripción
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const guestsList = snapshot.docs.map(doc => ({
                _id: doc.id, // Mapeamos el ID de firestore
                ...doc.data()
            }));
            setGuests(guestsList);
            setLoading(false);
        }, (error) => {
            console.log("Error leyendo invitados:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [eventId]);

    // 2. AGREGAR INVITADO (Create)
    const addGuest = async () => {
        if (!newName.trim()) return;
        
        try {
            await addDoc(collection(db, 'guests'), {
                name: newName,
                eventId: eventId, // Vinculamos al evento actual
                status: 'Pendiente',
                createdAt: new Date().toISOString()
            });
            setNewName(''); // Limpiamos el input
        } catch (error) {
            Alert.alert("Error", "No se pudo agregar al invitado");
            console.log(error);
        }
    };

    // 3. CAMBIAR ESTADO (Update)
    const toggleStatus = async (item) => {
        const nextStatus = item.status === 'Pendiente' ? 'Confirmado' 
                         : item.status === 'Confirmado' ? 'Rechazado' 
                         : 'Pendiente';

        try {
            // Referencia al documento específico
            const guestRef = doc(db, 'guests', item._id);
            await updateDoc(guestRef, { status: nextStatus });
        } catch (error) { 
            console.log("Error actualizando status:", error); 
            Alert.alert("Error", "No se pudo actualizar el estado");
        }
    };

    // 4. ELIMINAR INVITADO (Delete)
    const deleteGuest = (id) => {
        Alert.alert("Eliminar", "¿Borrar a este invitado?", [
            { text: "Cancelar" },
            { 
                text: "Eliminar", style: 'destructive', 
                onPress: async () => {
                    try {
                        await deleteDoc(doc(db, 'guests', id));
                    } catch (error) {
                        Alert.alert("Error", "No se pudo eliminar");
                    }
                }
            }
        ]);
    };

    // Colores según estado
    const getStatusColor = (status) => {
        if (status === 'Confirmado') return '#4CAF50'; // Verde
        if (status === 'Rechazado') return '#F44336';  // Rojo
        return '#FFC107';                              // Amarillo
    };

    const countConfirmed = guests.filter(g => g.status === 'Confirmado').length;

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity style={styles.info} onPress={() => toggleStatus(item)}>
                <View style={[styles.dot, { backgroundColor: getStatusColor(item.status) }]} />
                <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteGuest(item._id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#999" />
            </TouchableOpacity>
        </View>
    );

    if (!eventId) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="people-outline" size={60} color="#FF6B6B" />
                <Text style={styles.errorText}>No se encontró la lista de invitados.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>VOLVER</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Invitados</Text>
            </View>

            <View style={styles.summary}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>{guests.length}</Text>
                    <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={styles.divider}/>
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNum, {color: '#4CAF50'}]}>{countConfirmed}</Text>
                    <Text style={styles.summaryLabel}>Confirmados</Text>
                </View>
            </View>

            <View style={styles.inputRow}>
                <TextInput 
                    style={styles.input} 
                    placeholder="Nuevo invitado..." 
                    value={newName}
                    onChangeText={setNewName}
                />
                <TouchableOpacity style={styles.addBtn} onPress={addGuest}>
                    <Ionicons name="person-add" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator color="#FF6B6B"/> : (
                <FlatList
                    data={guests}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    title: { fontSize: 22, fontWeight: 'bold', marginLeft: 15, color: '#333' },
    summary: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2 },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryNum: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    summaryLabel: { fontSize: 12, color: 'gray', textTransform: 'uppercase' },
    divider: { width: 1, backgroundColor: '#eee' },
    inputRow: { flexDirection: 'row', marginBottom: 20 },
    input: { flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 10, elevation: 1 },
    addBtn: { backgroundColor: '#333', width: 50, borderRadius: 10, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
    card: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center', justifyContent: 'space-between', elevation: 1 },
    info: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 15 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    status: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    deleteBtn: { padding: 5 },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
    errorText: { fontSize: 18, color: '#666', marginTop: 10, marginBottom: 20 },
    backBtn: { backgroundColor: '#333', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    backBtnText: { color: 'white', fontWeight: 'bold' }
});