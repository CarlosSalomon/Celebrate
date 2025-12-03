import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';


export default function EventBudgetScreen({ navigation, route }) {
    const { eventId } = route.params;
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!eventId) return;
        setLoading(true);

        const eventRef = doc(db, 'events', eventId);


        const unsubscribe = onSnapshot(eventRef, (docSnap) => {
            if (docSnap.exists()) {
                setEvent({ _id: docSnap.id, ...docSnap.data() });
            } else {
                Alert.alert("Error", "El evento no existe");
                navigation.goBack();
            }
            setLoading(false);
        }, (error) => {
            console.error("Error cargando presupuesto:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [eventId]);


    const handleDeleteService = (serviceItem) => {
        Alert.alert(
            "Cancelar Contrato",
            `¿Eliminar a ${serviceItem.name}?`,
            [
                { text: "No", style: "cancel" },
                {
                    text: "Sí, Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const eventRef = doc(db, 'events', eventId);

                            const currentVendors = event.hiredVendors || [];
                            const updatedVendors = currentVendors.filter(
                                v => v.name !== serviceItem.name || v.price !== serviceItem.price
                            );

                            await updateDoc(eventRef, {
                                hiredVendors: updatedVendors
                            });
                        } catch (error) {
                            Alert.alert("Error", "No se pudo eliminar el servicio.");
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B6B" /></View>;
    if (!event) return <View style={styles.center}><Text>Cargando datos...</Text></View>;


    const totalBudget = event.budget || 0;
    const hiredList = event.hiredVendors || [];
    const totalSpent = hiredList.reduce((acc, item) => acc + item.price, 0);
    const remaining = totalBudget - totalSpent;
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const renderService = ({ item }) => (
        <View style={styles.serviceCard}>
            <View style={styles.iconBox}>
                <Ionicons name="briefcase" size={24} color="#555" />
            </View>
            <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.serviceCategory}>{item.category}</Text>
            </View>
            <View style={styles.priceInfo}>
                <Text style={styles.servicePrice}>- ${item.price.toLocaleString()}</Text>
                <TouchableOpacity onPress={() => handleDeleteService(item)}>
                    <Ionicons name="trash-outline" size={20} color="#FF6B6B" style={{ marginTop: 5, alignSelf: 'flex-end' }} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Gastos & Contratos</Text>
            </View>


            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Presupuesto Total</Text>
                <Text style={styles.budgetAmount}>${totalBudget.toLocaleString()}</Text>

                <View style={styles.progressBarBg}>
                    <View style={[
                        styles.progressBarFill,
                        {
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: remaining < 0 ? '#FF6B6B' : '#4ECDC4'
                        }
                    ]} />
                </View>

                <View style={styles.statsRow}>
                    <View>
                        <Text style={styles.statLabel}>Gastado</Text>
                        <Text style={styles.statValue}>${totalSpent.toLocaleString()}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.statLabel}>Disponible</Text>
                        <Text style={[styles.statValue, { color: remaining < 0 ? '#FF6B6B' : 'white' }]}>
                            ${remaining.toLocaleString()}
                        </Text>
                    </View>
                </View>
            </View>


            <View style={styles.listHeader}>
                <Text style={styles.subtitle}>Servicios Contratados</Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('Vendors', { eventId })}
                >
                    <Text style={styles.addButtonText}>+ Contratar</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={hiredList}
                renderItem={renderService}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No has contratado servicios aún.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    title: { fontSize: 22, fontWeight: 'bold', marginLeft: 15, color: '#333' },

    summaryCard: { backgroundColor: '#333', borderRadius: 20, padding: 25, marginBottom: 30, elevation: 5 },
    summaryTitle: { color: '#ccc', fontSize: 14, textTransform: 'uppercase', marginBottom: 5 },
    budgetAmount: { color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
    progressBarBg: { height: 8, backgroundColor: '#555', borderRadius: 4, marginBottom: 20, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statLabel: { color: '#ccc', fontSize: 12 },
    statValue: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 2 },

    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    subtitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    addButton: { backgroundColor: '#FF6B6B', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

    serviceCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center', elevation: 2 },
    iconBox: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    serviceInfo: { flex: 1 },
    serviceName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    serviceCategory: { fontSize: 12, color: 'gray' },
    priceInfo: { alignItems: 'flex-end' },
    servicePrice: { fontSize: 14, fontWeight: 'bold', color: '#FF6B6B' },

    emptyText: { textAlign: 'center', color: '#999', marginTop: 20 }
});