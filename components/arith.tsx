import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { styles } from "./styles";

export default function Arith() {
    const [x, setX] = useState("");
    const [y, setY] = useState("");
    const [result, setResult] = useState("0");

    const reset = () => {
      setResult("0");
      setX("");
      setY("");
    }
    return(
        <View style={styles.container}>
            <View style={styles.result}>
                <Text style={{textAlign: 'center',
                        fontSize: 24,
                        fontWeight: 'bold',}}>Result:</Text>
                <Text style={{fontSize: 18,}}>{result}</Text>
            </View>
            <View>
                <TextInput style={styles.input}
                    keyboardType='number-pad'
                    value={x}
                    onChangeText={(text)=>setX(text)}
                    placeholder="Enter Number" />
                <TextInput style={styles.input}
                    keyboardType='number-pad'
                    value={y}
                    onChangeText={(text)=>setY(text)}
                    placeholder="Enter Number" />
            </View>
            <View style={styles.button_pack}>
                <Button title=" ADD " onPress={() => {
                    const numX = Number(x);
                    const numY = Number(y);
                    if (isNaN(numX) || isNaN(numY)) {
                        setResult("Invalid Input");
                    } else {
                        setResult(String(numX + numY));
                    }
                    }} />
                <Button title=" SUB " onPress={() => {
                    const numX = Number(x);
                    const numY = Number(y);
                    if (isNaN(numX) || isNaN(numY)) {
                        setResult("Invalid Input");
                    } else {
                        setResult(String(numX - numY));
                    }
                    }} />
                <Button title="Reset" onPress={() => {
                    reset();
                    }} />
            </View>
        </View>
    )
}

