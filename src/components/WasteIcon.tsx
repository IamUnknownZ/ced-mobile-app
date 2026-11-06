import { Image, StyleSheet, View } from 'react-native';

const sources: Record<string, number> = {
  banana: require('../../assets/art/items/banana.png'),
  wrapper: require('../../assets/art/items/wrapper.png'),
  leaf: require('../../assets/art/items/leaf.png'),
  bottle: require('../../assets/art/items/bottle.png'),
  paper: require('../../assets/art/items/paper.png'),
  'dirty-paper': require('../../assets/art/items/dirty-paper.png'),
  can: require('../../assets/art/items/can.png'),
  battery: require('../../assets/art/items/battery.png'),
  'plastic-cup': require('../../assets/art/items/plastic-cup.png'),
  'uht-carton': require('../../assets/art/items/uht-carton.png'),
  'plastic-bag': require('../../assets/art/items/plastic-bag.png'),
  'food': require('../../assets/art/items/food.png'),
  'fluorescent-lamp': require('../../assets/art/items/fluorescent-lamp.png'),
  'vegetables': require('../../assets/art/items/vegetables.png'),
  'expired-medicine': require('../../assets/art/items/expired-medicine.png'),
};
export function WasteIcon({id,size=100}:{id:string;size?:number}) {
  const source=sources[id];
  return <View style={[styles.frame,{width:size,height:size,borderRadius:size/2}]}>{source && <Image source={source} resizeMode="contain" style={{width:size*.9,height:size*.9}} />}</View>;
}
const styles=StyleSheet.create({frame:{alignItems:'center',justifyContent:'center',backgroundColor:'#e7f7d6',borderWidth:2,borderColor:'#a3d978'}});
