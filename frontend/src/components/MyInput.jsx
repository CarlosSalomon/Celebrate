import { TextInput, StyleSheet, View, Text } from 'react-native';

export default function MyInput({ label, ...props }) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput 
                style={styles.input} 
                placeholderTextColor="#999"
                {...props} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
    },
    label: {
        marginBottom: 5,
        fontWeight: 'bold',
        color: '#555',
        fontSize: 14,
        textTransform: 'uppercase'
    },
    input: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        fontSize: 16,
        color: '#333'
    }
});