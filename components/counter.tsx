import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Count = () => {
    const [count, setCount] = useState(0);
    return(
        <View style={styles.container}>
            <Text style={styles.display}>Count: {count}</Text>
            <View>
                <TouchableOpacity style={styles.button}
                        onPress={()=>setCount(count+1)}>
                    <Text style={styles.button_label}> + </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}
                        onPress={()=>setCount(count-1)}>
                    <Text style={styles.button_label}> - </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Count;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        backgroundColor: '#F8FAFC',
    },
    display: {
        backgroundColor: '#10B981',
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
        padding: 24,
        textAlign: 'center',
        borderRadius: 16,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#3B82F6',
        padding: 14,
        borderRadius: 16,
        marginVertical: 8,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1.5,
    },
    button_label: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 28,
        textAlign: 'center',
    }
})
