import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export default function TasksScreen({ navigation, route }) {

    const { eventId } = route.params || {};

    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        console.log("--- DEBUG TASKS SCREEN ---");
        console.log("Event ID recibido:", eventId);

        if (!eventId) {
            console.log("Error: No hay Event ID, cancelando carga.");
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const tasksRef = collection(db, 'tasks');

            const q = query(tasksRef, where('eventId', '==', eventId));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                console.log("🔥 Firestore respondió. Documentos encontrados:", snapshot.size);

                const tasksList = snapshot.docs.map(doc => ({
                    _id: doc.id,
                    ...doc.data()
                }));


                tasksList.sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1));

                setTasks(tasksList);
                setLoading(false);
            }, (error) => {
                console.error("❌ Error en onSnapshot:", error);
                Alert.alert("Error de Conexión", error.message);
                setLoading(false);
            });

            return () => unsubscribe();

        } catch (err) {
            console.error("❌ Error General:", err);
            setLoading(false);
        }
    }, [eventId]);

    // 2. AGREGAR TAREA
    const addTask = async () => {
        if (!newTask.trim()) return;
        if (!eventId) return Alert.alert("Error", "No se detectó el evento.");

        try {
            await addDoc(collection(db, 'tasks'), {
                title: newTask,
                isCompleted: false,
                eventId: eventId,
                createdAt: new Date().toISOString()
            });
            setNewTask('');
        } catch (error) {
            console.error("Error agregando tarea:", error);
            Alert.alert("Error", "No se pudo guardar");
        }
    };

    // 3. TOGGLE CHECK
    const toggleCheck = async (item) => {
        try {
            const taskRef = doc(db, 'tasks', item._id);
            await updateDoc(taskRef, { isCompleted: !item.isCompleted });
        } catch (error) {
            console.log("Error toggle:", error);
        }
    };

    // 4. ELIMINAR
    const handleDelete = (item) => {
        Alert.alert("Eliminar", "¿Borrar tarea?", [
            { text: "Cancelar" },
            {
                text: "Eliminar", style: 'destructive',
                onPress: async () => {
                    await deleteDoc(doc(db, 'tasks', item._id));
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.taskItem}
            onPress={() => toggleCheck(item)}
            onLongPress={() => handleDelete(item)}
        >
            <Ionicons
                name={item.isCompleted ? "checkbox" : "square-outline"}
                size={24}
                color={item.isCompleted ? "#4CAF50" : "#666"}
            />
            <Text style={[styles.taskText, item.isCompleted && styles.completedText]}>
                {item.title}
            </Text>
        </TouchableOpacity>
    );

    if (!eventId) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
                <Text style={styles.errorText}>No se seleccionó ningún evento.</Text>
                <Text style={{ color: 'gray', fontSize: 12 }}>ID es undefined</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>VOLVER ATRÁS</Text>
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
                <Text style={styles.title}>Agenda</Text>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nueva tarea..."
                    value={newTask}
                    onChangeText={setNewTask}
                />
                <TouchableOpacity style={styles.addBtn} onPress={addTask}>
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FF6B6B" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Cargando tareas...</Text>
                </View>
            ) : (
                <FlatList
                    data={tasks}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={<Text style={styles.empty}>¡Estás al día! Agrega tareas.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    title: { fontSize: 24, fontWeight: 'bold', marginLeft: 15, color: '#333' },
    inputContainer: { flexDirection: 'row', marginBottom: 20 },
    input: { flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 10, elevation: 2 },
    addBtn: { backgroundColor: '#FF6B6B', width: 50, borderRadius: 10, marginLeft: 10, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    taskItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1 },
    taskText: { marginLeft: 10, fontSize: 16, color: '#333' },
    completedText: { textDecorationLine: 'line-through', color: '#aaa' },
    empty: { textAlign: 'center', marginTop: 50, color: 'gray' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 20 },
    errorText: { fontSize: 18, color: '#666', marginTop: 10, marginBottom: 20, fontWeight: 'bold' },
    backBtn: { backgroundColor: '#333', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    backBtnText: { color: 'white', fontWeight: 'bold' }
});