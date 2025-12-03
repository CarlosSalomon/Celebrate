import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { setEvents, setEventsLoading } from '../redux/slices/eventSlice';



export default function HomeScreen({ navigation }) {

    const { user, isOffline } = useSelector((state) => state.auth);
    const { events, loading } = useSelector((state) => state.events);
    const dispatch = useDispatch();


    useEffect(() => {
        if (!user?.uid) return;


        if (isOffline) {
            dispatch(setEvents([{
                _id: 'evento_local_1',
                name: 'Borrador Local (Sin Internet)',
                date: new Date().toISOString(),
                userId: 'local_user'
            }]));
            return;
        }

        dispatch(setEventsLoading());


        const eventsRef = collection(db, "events");


        const q = query(eventsRef, where("userId", "==", user.uid));


        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedEvents = snapshot.docs.map(doc => ({
                _id: doc.id,
                ...doc.data()
            }));


            loadedEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

            dispatch(setEvents(loadedEvents));
        }, (error) => {
            console.error("Error fetching events:", error);

        });


        return () => unsubscribe();
    }, [user, isOffline, dispatch]);

    const renderEventCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.eventName}>{item.name}</Text>
                    <Text style={styles.eventDate}>
                        {item.date ? new Date(item.date).toLocaleDateString() : 'Sin fecha'}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('EditEvent', { eventId: item._id })}>
                    <Ionicons name="settings-outline" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* --- BOTONES DE ACCIÓN --- */}
            <View style={styles.actions}>
                {/* 1. Invitados */}
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('GuestList', { eventId: item._id })}
                >
                    <Ionicons name="people" size={18} color="#FF6B6B" />
                    <Text style={styles.actionText}>Invitados</Text>
                </TouchableOpacity>

                {/* 2. Agenda */}
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('Tasks', { eventId: item._id })}
                >
                    <Ionicons name="list" size={18} color="#FF6B6B" />
                    <Text style={styles.actionText}>Agenda</Text>
                </TouchableOpacity>

                {/* 3. Gastos */}
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('EventBudget', { eventId: item._id })}
                >
                    <Ionicons name="wallet-outline" size={18} color="#FF6B6B" />
                    <Text style={styles.actionText}>Gastos</Text>
                </TouchableOpacity>

                {/* 4. Notas (SQLite) */}
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('LocalNotes', { eventId: item._id })}
                >
                    <Ionicons name="document-lock-outline" size={18} color="#FF6B6B" />
                    <Text style={styles.actionText}>Notas</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>



                    <Text style={styles.greeting}>
                        Hola, {user?.displayName ? user.displayName.split(' ')[0] : 'Usuario'} 👋
                    </Text>
                    <Text style={styles.subGreeting}>Tus Eventos</Text>
                </View>


                <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ marginTop: 10 }}>
                    <Ionicons name="person-circle-outline" size={45} color="#333" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FF6B6B" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={events}
                    keyExtractor={(item) => item._id}
                    renderItem={renderEventCard}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>No tienes eventos creados.</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateEvent')}>
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, marginTop: 15 },


    headerLogo: { width: 100, height: 80, resizeMode: 'contain', marginBottom: 5 },

    greeting: { fontSize: 26, fontWeight: 'bold', color: '#333' },
    subGreeting: { fontSize: 16, color: '#666' },
    card: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 20, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    eventName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    eventDate: { fontSize: 14, color: '#888', marginTop: 4 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    actions: { flexDirection: 'row', justifyContent: 'space-between' },
    actionBtn: { flexDirection: 'column', alignItems: 'center', padding: 5, flex: 1 },
    actionText: { marginTop: 5, color: '#FF6B6B', fontWeight: 'bold', fontSize: 10 },
    fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#333', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#666', marginTop: 20 }
});