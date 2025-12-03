import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function MyButton({ title, onPress, loading = false, style }) {
    return (
        <TouchableOpacity 
            style={[styles.btn, style, loading && styles.disabled]} 
            onPress={onPress}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: {
        backgroundColor: '#FF6B6B', // Tu color principal
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textTransform: 'uppercase'
    },
    disabled: {
        backgroundColor: '#ffb3b3' 
    }
});