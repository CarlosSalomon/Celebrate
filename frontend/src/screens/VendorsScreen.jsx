import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const categories = [
    { id: '1', name: 'Salón', icon: 'home', color: '#FF6B6B' },
    { id: '2', name: 'DJ', icon: 'musical-notes', color: '#4ECDC4' },
    { id: '3', name: 'Catering', icon: 'restaurant', color: '#FFD93D' },
    { id: '4', name: 'Fotografía', icon: 'camera', color: '#6C5CE7' },
    { id: '5', name: 'Decoración', icon: 'rose', color: '#A8E6CF' },
    { id: '6', name: 'Bebidas', icon: 'wine', color: '#FF8B94' },
];

export default function VendorsScreen({ navigation, route }) {
    const { eventId } = route.params;

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('VendorList', {
                category: item.name,
                eventId: eventId
            })}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={30} color="white" />
            </View>
            <Text style={styles.categoryName}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Buscar Servicios</Text>
            </View>

            <FlatList
                data={categories}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    title: { fontSize: 24, fontWeight: 'bold', marginLeft: 15, color: '#333' },
    list: { paddingBottom: 20 },

    card: { flex: 1, backgroundColor: 'white', margin: 10, padding: 20, borderRadius: 15, alignItems: 'center', elevation: 3 },
    iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    categoryName: { fontSize: 16, fontWeight: 'bold', color: '#333' }
});