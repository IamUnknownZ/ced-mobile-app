import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGameAudio } from '../audio/GameAudio';

type ButtonTone = 'sun' | 'leaf' | 'sky' | 'light' | 'coral';
const palette: Record<ButtonTone, {face:string; edge:string; rim:string; ink:string}> = {
  sun: { face:'#f28b13', edge:'#b95508', rim:'#ffd365', ink:'#fff' },
  leaf: { face:'#43ae34', edge:'#207628', rim:'#a5e96c', ink:'#fff' },
  sky: { face:'#208bc1', edge:'#125d8c', rim:'#85dafa', ink:'#fff' },
  coral: { face:'#df544b', edge:'#a92e38', rim:'#ffb7a8', ink:'#fff' },
  light: { face:'#f7fdff', edge:'#84bdc5', rim:'#fff', ink:'#195d69' },
};
export function GameButton({ title, onPress, tone='sun', disabled=false, compact=false, silent=false }: {
  title:string; onPress:()=>void; tone?:ButtonTone; disabled?:boolean; compact?:boolean; silent?:boolean;
}) {
  const audio = useGameAudio();
  const colors=palette[tone];
  return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={()=>{if(!silent) audio.playEffect('click');onPress();}} style={({pressed})=>[styles.base,{backgroundColor:colors.edge},compact&&styles.compact,disabled&&styles.disabled,pressed&&styles.pressed]}>
    <View style={[styles.face,{backgroundColor:colors.face,borderColor:colors.rim},compact&&styles.compactFace]}><Text style={[styles.label,{color:colors.ink},compact&&styles.compactLabel]}>{title}</Text></View>
  </Pressable>;
}
const styles=StyleSheet.create({
  base:{borderRadius:18,paddingBottom:4,minWidth:0},face:{minHeight:52,borderRadius:16,borderWidth:2,alignItems:'center',justifyContent:'center',paddingHorizontal:14,paddingVertical:9},label:{fontSize:16,fontWeight:'900',textAlign:'center',textShadowColor:'rgba(0,0,0,0.12)',textShadowOffset:{width:0,height:1},textShadowRadius:1},
  compact:{borderRadius:14,flexShrink:1},compactFace:{minHeight:44,borderRadius:12,paddingHorizontal:11,paddingVertical:7},compactLabel:{fontSize:14},disabled:{opacity:.45},pressed:{transform:[{translateY:2}],opacity:.85},
});
