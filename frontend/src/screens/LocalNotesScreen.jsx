import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { initDB, addNoteLocal, getNotesLocal, deleteNoteLocal } from '../services/sqlite';
import MyButton from '../components/MyButton';
import MyInput from '../components/MyInput';

export default function LocalNotesScreen({ navigation, route }) {
    const { eventId } = route.params;
    const [notes, setNotes] = useState([]);
    const [text, setText] = useState('');


    useEffect(() => {
        try {
            initDB();
            loadNotes();
        } catch (e) {
            console.error("Error SQLite:", e);
        }
    }, []);

    const loadNotes = () => {
        const data = getNotesLocal(eventId);
        setNotes(data);
    };

    const handleSave = () => {
        if (!text.trim()) return;

        addNoteLocal(eventId, text);
        setText('');
        loadNotes();
    };

    const handleDelete = (id) => {
        Alert.alert("Eliminar", "¿Borrar esta nota privada?", [
            { text: "Cancelar" },
            {
                text: "Eliminar",
                style: 'destructive',
                onPress: () => {
                    deleteNoteLocal(id);
                    loadNotes();
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.noteText}>{item.content}</Text>
                <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Notas Privadas (Offline)</Text>
            </View>

            <View style={styles.inputContainer}>
                <MyInput
                    placeholder="Escribe una idea secreta..."
                    value={text}
                    onChangeText={setText}
                    multiline
                />
                <MyButton title="GUARDAR" onPress={handleSave} />
            </View>

            <FlatList
                data={notes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.empty}>No hay notas guardadas en el dispositivo.</Text>}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    title: { fontSize: 20, fontWeight: 'bold', marginLeft: 15, color: '#333' },
    inputContainer: { marginBottom: 20 },
    card: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center', elevation: 2 },
    noteText: { fontSize: 16, color: '#333', marginBottom: 5 },
    dateText: { fontSize: 12, color: '#999' },
    empty: { textAlign: 'center', color: '#aaa', marginTop: 30 }
});