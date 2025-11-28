import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function NotificationsScreen({ navigation }) {
    const { user } = useSelector(state => state.auth);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid)
        );


        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                _id: doc.id,
                ...doc.data()
            }));


            list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setNotifications(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleRead = async (item) => {
        if (item.isRead) return;

        try {

            const notifRef = doc(db, 'notifications', item._id);
            await updateDoc(notifRef, { isRead: true });
        } catch (error) {
            console.log("Error marcando como leído:", error);
        }
    };

    const getIcon = (type) => {
        if (type === 'success') return 'checkmark-circle';
        if (type === 'warning') return 'alert-circle';
        return 'information-circle';
    };

    const getColor = (type) => {
        if (type === 'success') return '#4CAF50';
        if (type === 'warning') return '#FFC107';
        return '#2196F3';
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, !item.isRead && styles.unreadCard]}
            onPress={() => handleRead(item)}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={getIcon(item.type)} size={30} color={getColor(item.type)} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, !item.isRead && styles.boldTitle]}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.date}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                </Text>
            </View>
            {!item.isRead && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.screenTitle}>Notificaciones</Text>
            </View>

            {loading ? <ActivityIndicator color="#FF6B6B" style={{ marginTop: 20 }} /> : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="notifications-off-outline" size={50} color="#ccc" />
                            <Text style={styles.emptyText}>No tienes notificaciones nuevas</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    screenTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 15, color: '#333' },

    card: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1, alignItems: 'center' },
    unreadCard: { backgroundColor: '#e3f2fd', borderLeftWidth: 4, borderLeftColor: '#2196F3' },

    iconContainer: { marginRight: 15 },
    textContainer: { flex: 1 },

    title: { fontSize: 16, color: '#333', marginBottom: 2 },
    boldTitle: { fontWeight: 'bold', color: '#000' },
    message: { fontSize: 14, color: '#666' },
    date: { fontSize: 10, color: '#999', marginTop: 5, textAlign: 'right' },

    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2196F3', marginLeft: 5 },

    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: 'gray', marginTop: 10, fontSize: 16 }
});