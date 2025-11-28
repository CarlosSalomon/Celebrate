import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    arrayUnion,
    addDoc
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export default function VendorListScreen({ route, navigation }) {
    const { category, eventId } = route.params;
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const vendorsRef = collection(db, 'vendors');

                const q = query(vendorsRef, where('category', '==', category));

                const querySnapshot = await getDocs(q);
                const vendorsList = querySnapshot.docs.map(doc => ({
                    _id: doc.id,
                    ...doc.data()
                }));

                setVendors(vendorsList);
            } catch (error) {
                console.log("Error cargando proveedores:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVendors();
    }, [category]);


    const handleHire = async (vendor) => {
        Alert.alert(
            "Confirmar Contratación",
            `¿Quieres contratar a ${vendor.name} por $${vendor.price}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "SÍ, CONTRATAR",
                    onPress: async () => {
                        try {
                            const eventRef = doc(db, 'events', eventId);


                            const catMap = {
                                'DJ': 'status.dj',
                                'Catering': 'status.catering',
                                'Decoración': 'status.decoration',
                                'Salón': 'status.venue',
                                'Fotografía': 'status.photography'
                            };
                            const statusField = catMap[vendor.category];
                            await updateDoc(eventRef, {
                                hiredVendors: arrayUnion({
                                    vendorId: vendor._id,
                                    name: vendor.name,
                                    category: vendor.category,
                                    price: vendor.price
                                }),
                                [statusField]: true
                            });

                            if (auth.currentUser) {
                                await addDoc(collection(db, 'notifications'), {
                                    userId: auth.currentUser.uid,
                                    title: '¡Contratación Exitosa!',
                                    message: `Has contratado a ${vendor.name} para tu evento.`,
                                    type: 'success',
                                    isRead: false,
                                    createdAt: new Date().toISOString()
                                });
                            }


                            Alert.alert("¡Excelente!", "Proveedor agregado a tu presupuesto.");

                            navigation.navigate('EventBudget', { eventId });

                        } catch (error) {
                            Alert.alert("Error", "No se pudo contratar.");
                            console.log("Error hiring:", error);
                        }
                    }
                }
            ]
        );
    };

    const renderVendor = ({ item }) => (
        <View style={styles.card}>

            {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
            ) : (
                <View style={[styles.image, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="image-outline" size={50} color="#fff" />
                </View>
            )}

            <View style={styles.info}>
                <View style={styles.row}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating || 5}</Text>
                    </View>
                </View>
                <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.price}>Desde ${item.price?.toLocaleString()}</Text>

                <TouchableOpacity style={styles.hireBtn} onPress={() => handleHire(item)}>
                    <Text style={styles.hireText}>Contratar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>{category}</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FF6B6B" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={vendors}
                    renderItem={renderVendor}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={{ color: 'gray' }}>No hay proveedores disponibles en esta categoría.</Text>
                            <Text style={{ fontSize: 10, color: '#ccc', marginTop: 10 }}>(Agégalos en Firebase Console)</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    title: { fontSize: 20, fontWeight: 'bold', marginLeft: 15, color: '#333' },
    card: { backgroundColor: 'white', borderRadius: 15, marginBottom: 15, overflow: 'hidden', elevation: 3 },
    image: { width: '100%', height: 150, backgroundColor: '#eee' },
    info: { padding: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    ratingBadge: { flexDirection: 'row', backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, alignItems: 'center' },
    ratingText: { color: 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
    desc: { color: 'gray', fontSize: 14, marginBottom: 10 },
    price: { fontSize: 16, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 10 },
    hireBtn: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center' },
    hireText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    empty: { alignItems: 'center', marginTop: 50 }
});