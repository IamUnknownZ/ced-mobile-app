import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useGameAudio } from '../audio/GameAudio';
import { GameButton } from '../components/GameButton';
import { categories, guideItems, parkItems } from '../data/park';
import { WasteIcon } from '../components/WasteIcon';
import { stages } from '../data/stages';
import type { StageConfig, WasteCategoryId } from '../types/game';

const steps = [
  ['1', 'Move your device', 'Tilt or turn your device to explore the planet while staying in place.'],
  ['2', 'Aim at waste', 'Rotate the planet until waste is under the crosshair.'],
  ['3', 'Tap to inspect', 'When you find waste, tap anywhere on the planet, then collect it.'],
  ['4', 'Choose a bin', 'Read the categories and choose the right one.'],
];
export function AlphaButton({ title, onPress, secondary = false }: {title:string;onPress:()=>void;secondary?:boolean}) {
  return <GameButton title={title} onPress={onPress} tone={secondary ? 'sky' : 'sun'} />;
}
export function HomeScreen({ onStart, onTutorial, onGuide, onSettings, highScore }: {onStart:()=>void;onTutorial:()=>void;onGuide:()=>void;onSettings:()=>void;highScore:number}) {
  const audio = useGameAudio();
  const { width, height } = useWindowDimensions();
  const heroSize = Math.min(width - 40, Math.max(190, Math.min(height * 0.38, 360)));
  return <ScrollView contentContainerStyle={styles.home}>
    <View style={styles.homeTop}><Text style={styles.kicker}>PLANET CLEANER</Text><Text style={styles.version}>Version 1.0.0</Text></View>
    <View style={styles.titleBlock}><Text style={styles.logo}>ROTATE</Text><Text style={styles.logoAccent}>RECYCLE</Text><Text style={styles.tagline}>One piece at a time, let's restore our planet.</Text></View>
    <View style={styles.heroArtwork}><Image source={require('../../assets/art/menu-planet.png')} accessibilityLabel="Illustration of a park planet and areas to clean" resizeMode="contain" style={{width:heroSize,height:heroSize}} /></View>
    <View style={styles.homeActions}><Text style={styles.caption}>Choose a location  •  Park best score: {highScore}</Text>
      <AlphaButton title="▶   Start cleaning" onPress={onStart} />
      <View style={styles.menuGrid}><View style={styles.menuCell}><AlphaButton title="▤  How to play" onPress={onTutorial} secondary /></View><View style={styles.menuCell}><AlphaButton title="♻  Waste guide" onPress={onGuide} secondary /></View></View>
      <AlphaButton title="⚙  Motion settings" onPress={onSettings} secondary />
      <View style={styles.soundRow}>
        <Pressable accessibilityRole="switch" accessibilityState={{checked:audio.music}} onPress={()=>audio.setMusic(!audio.music)} style={({pressed})=>[styles.soundButton,pressed&&styles.pressed]}><Text style={styles.soundText}>Music {audio.music ? 'On' : 'Off'}</Text></Pressable>
        <Pressable accessibilityRole="switch" accessibilityState={{checked:audio.effects}} onPress={()=>audio.setEffects(!audio.effects)} style={({pressed})=>[styles.soundButton,pressed&&styles.pressed]}><Text style={styles.soundText}>Sound effects {audio.effects ? 'On' : 'Off'}</Text></Pressable>
      </View>
      {audio.error && <Text style={styles.note}>Could not load or save audio settings. Restart the app.</Text>}
    </View>
    <View style={{alignItems:'center',gap:3,paddingTop:12,paddingBottom:8}}>
      <Text style={{fontSize:12,fontWeight:'700',color:'#346e7c'}}>Created by</Text>
      <Text style={{fontSize:14,lineHeight:21,fontWeight:'700',color:'#185b70',textAlign:'center'}}>Kanokphong Huakhamkham{'\n'}Phanatphon Sabaithae-thae</Text>
    </View>
  </ScrollView>;
}
export function StageSelectScreen({onBack,onSelect}:{onBack:()=>void;onSelect:(stage:StageConfig)=>void}) {
  const audio = useGameAudio();
  return <ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.kicker}>CHOOSE YOUR MISSION</Text><Text style={styles.heading}>Planet map</Text>
    <Text style={styles.body}>Choose an area to care for and start exploring.</Text>
    <View style={styles.stageGrid}>{stages.map((stage,index)=><Pressable accessibilityRole="button" accessibilityLabel={`Start level ${stage.titleTh}`} key={stage.id} onPress={()=>{audio.playEffect('click');onSelect(stage);}} style={({pressed})=>[styles.stageTile,pressed&&styles.pressed]}>
      <Image source={[require('../../assets/art/stages/park.png'),require('../../assets/art/stages/school.png'),require('../../assets/art/stages/beach.png'),require('../../assets/art/stages/community.png')][index]} resizeMode="cover" style={styles.stageArt}/>
      <Text style={styles.stageNumber}>Mission {index+1} · Illustration</Text><Text style={[styles.cardTitle,{paddingHorizontal:10}]}>{stage.titleTh}</Text><Text style={styles.stageGoal} numberOfLines={2}>{stage.educationalGoalTh}</Text>
      <Text style={styles.stageStart}>Start level  ›</Text>
    </Pressable>)}</View>
    <Text style={styles.note}>Move your device to rotate the planet, aim at waste and choose its category.</Text><AlphaButton title="Back to menu" onPress={onBack} secondary />
  </ScrollView>;
}
export function TutorialScreen({onBack,onStart}:{onBack:()=>void;onStart:()=>void}) {
  return <ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.kicker}>GET STARTED</Text><Text style={styles.heading}>How to play</Text>
    {steps.map(([n,title,body])=><View key={n} style={styles.infoCard}><Text style={styles.number}>{n}</Text><View style={styles.grow}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.body}>{body}</Text></View></View>)}
    <Text style={styles.note}>Hold your device comfortably. Pause rotation to reposition your hands, or recenter at any time.</Text><AlphaButton title="Play" onPress={onStart}/><AlphaButton title="Back to menu" onPress={onBack} secondary/>
  </ScrollView>;
}
export function GuideScreen({onBack,discovered}:{onBack:()=>void;discovered:readonly string[]}) {
  const audio = useGameAudio();
  const [query,setQuery] = useState(''); const [category,setCategory] = useState<WasteCategoryId|null>(null);
  const items=useMemo(()=>guideItems.filter(item=>(!category || item.categoryId===category) && item.nameTh.toLocaleLowerCase('th').includes(query.trim().toLocaleLowerCase('th'))),[query,category,discovered]);
  return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.kicker}>LET'S LEARN</Text><Text style={styles.heading}>Waste guide</Text>
    <Text style={styles.caption}>Discovered {discovered.length}/{parkItems.length} items</Text>
    <TextInput accessibilityLabel="Search waste" value={query} onChangeText={setQuery} placeholder="Search by waste name" style={styles.search}/>
    <View style={styles.filters}><Pressable accessibilityRole="button" onPress={()=>{audio.playEffect('click');setCategory(null);}} accessibilityState={{selected:!category}} style={({pressed})=>[styles.chip,!category&&styles.chipActive,pressed&&styles.pressed]}><Text style={styles.chipText}>All</Text></Pressable>{categories.map(c=><Pressable key={c.id} accessibilityRole="button" onPress={()=>{audio.playEffect('click');setCategory(c.id);}} accessibilityState={{selected:category===c.id}} style={({pressed})=>[styles.chip,{borderColor:c.color},category===c.id&&styles.chipActive,pressed&&styles.pressed]}><Text style={styles.chipText}>{c.nameTh}</Text></Pressable>)}</View>
    {items.length ? items.map(item=><View style={styles.guideCard} key={item.id}>{discovered.includes(item.id) ? <><View style={styles.guideTop}><WasteIcon id={item.id} size={56} /><View style={styles.grow}><Text style={styles.cardTitle}>{item.nameTh}</Text><Text style={styles.caption}>{categories.find(c=>c.id===item.categoryId)?.nameTh}</Text></View></View><Text style={styles.body}>{item.explanationTh}</Text><Text style={styles.note}>{item.disposalTipTh}</Text></> : <><Text style={styles.lockedIcon}>?</Text><Text style={styles.cardTitle}>Not discovered yet</Text><Text style={styles.note}>Explore levels to unlock information about this item.</Text></>}</View>) : <Text style={styles.body}>No items found. Try another search or category.</Text>}
    <Text style={styles.note}>Bin colours and collection rules vary by location. Check local guidance.</Text><AlphaButton title="Back to menu" onPress={onBack} secondary />
  </ScrollView>;
}
const styles=StyleSheet.create({stageGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},stageTile:{width:'48%',flexGrow:1,backgroundColor:'#fffaf1',borderRadius:18,overflow:'hidden',borderWidth:2,borderBottomWidth:5,borderColor:'#e8bb58',paddingBottom:10},stageArt:{width:'100%',height:120,backgroundColor:'#b8e8f5'},stageGoal:{fontSize:12,lineHeight:17,color:'#356465',paddingHorizontal:10,minHeight:34},stageStart:{fontSize:13,fontWeight:'900',color:'#c7650d',paddingHorizontal:10,paddingTop:4},guideTop:{flexDirection:'row',alignItems:'center',gap:10},lockedIcon:{fontSize:24,fontWeight:'900',color:'#4d8991',backgroundColor:'#daf1f4',overflow:'hidden',width:42,height:42,textAlign:'center',textAlignVertical:'center',borderRadius:21},stageCard:{backgroundColor:'#fffdf4',borderRadius:22,padding:14,flexDirection:'row',alignItems:'center',gap:12,borderWidth:3,borderColor:'#f2ce75',borderBottomWidth:6},stageIcon:{width:70,height:70,borderRadius:20,justifyContent:'center',alignItems:'center'},stageIconText:{fontSize:34,color:'#267e60',fontWeight:'900'},stageNumber:{fontSize:11,color:'#348b87',fontWeight:'800',paddingHorizontal:10,paddingTop:8},prototype:{fontSize:11,color:'#9a611e',fontWeight:'700'},stageArrow:{fontSize:30,color:'#2e876f'},home:{flexGrow:1,paddingHorizontal:20,paddingTop:12,paddingBottom:20,gap:8,backgroundColor:'#a8e2f8'},homeTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},version:{fontSize:11,fontWeight:'800',color:'#196580',backgroundColor:'#d9f7ff',overflow:'hidden',borderRadius:12,paddingHorizontal:10,paddingVertical:5},titleBlock:{alignItems:'center'},logoAccent:{fontSize:40,lineHeight:46,color:'#e07711',fontWeight:'900',textShadowColor:'#fff6d1',textShadowRadius:3},tagline:{color:'#135d72',fontSize:14,fontWeight:'800',textAlign:'center',backgroundColor:'#eafaff',overflow:'hidden',borderRadius:14,paddingHorizontal:12,paddingVertical:4},heroArtwork:{alignItems:'center',justifyContent:'center',flexGrow:1},homeActions:{gap:8},menuGrid:{flexDirection:'row',gap:8},menuCell:{flex:1},soundRow:{flexDirection:'row',gap:8,justifyContent:'center'},soundButton:{minHeight:44,justifyContent:'center',paddingHorizontal:14,backgroundColor:'#f4fcff',borderWidth:2,borderColor:'#8ed5e7',borderBottomWidth:4,borderRadius:15},soundText:{fontSize:13,fontWeight:'700',color:'#185b70'},content:{padding:20,paddingBottom:28,gap:12,backgroundColor:'#d9f3ff',flexGrow:1},kicker:{color:'#287e90',fontSize:13,fontWeight:'800',letterSpacing:1},logo:{fontSize:40,lineHeight:49,color:'#176b50',fontWeight:'900'},heading:{fontSize:32,color:'#176b50',fontWeight:'900',textShadowColor:'#fff',textShadowOffset:{width:0,height:2},textShadowRadius:1},hero:{padding:18,borderRadius:24,backgroundColor:'#fff',flexDirection:'row',alignItems:'center',gap:14},heroCopy:{flex:1,gap:5},planetBadge:{width:112,height:112,borderRadius:56,backgroundColor:'#56c2e4',borderWidth:5,borderColor:'#d3f5ff',overflow:'hidden'},landOne:{position:'absolute',width:72,height:35,backgroundColor:'#70c65c',borderRadius:20,left:-8,top:24,transform:[{rotate:'-24deg'}]},landTwo:{position:'absolute',width:66,height:40,backgroundColor:'#3ea45a',borderRadius:24,right:-8,bottom:21,transform:[{rotate:'-32deg'}]},landThree:{position:'absolute',width:22,height:18,backgroundColor:'#9bd574',borderRadius:12,left:15,bottom:15},planetStar:{position:'absolute',right:15,top:10,color:'#fff',fontSize:19},heroTitle:{fontSize:20,fontWeight:'800',color:'#176b50'},body:{fontSize:16,lineHeight:24,color:'#173f50'},note:{fontSize:14,lineHeight:21,color:'#345c6b'},caption:{fontSize:14,color:'#346e7c',fontWeight:'700'},button:{minHeight:52,justifyContent:'center',alignItems:'center',borderRadius:17,backgroundColor:'#d86a0e',paddingHorizontal:16,paddingVertical:12},secondary:{backgroundColor:'#fff',borderWidth:1,borderColor:'#8bc4d2'},pressed:{opacity:.75},buttonText:{color:'#fff',fontSize:17,fontWeight:'800'},secondaryText:{color:'#195a70'},linkStack:{gap:8},infoCard:{backgroundColor:'#fff',borderRadius:20,padding:16,flexDirection:'row',gap:14,alignItems:'flex-start',borderWidth:2,borderColor:'#bce8ef',borderBottomWidth:4},number:{fontSize:21,fontWeight:'900',color:'#fff',backgroundColor:'#258ed0',overflow:'hidden',width:38,height:38,textAlign:'center',textAlignVertical:'center',borderRadius:19},grow:{flex:1,gap:3},cardTitle:{fontSize:18,fontWeight:'800',color:'#195b48'},guideCard:{backgroundColor:'#fff',padding:16,borderRadius:18,gap:6,borderWidth:2,borderColor:'#c1e6ee',borderBottomWidth:4},search:{backgroundColor:'#fff',borderRadius:16,borderWidth:2,borderColor:'#8bc4d2',padding:12,fontSize:16,color:'#173f50',minHeight:48},filters:{flexDirection:'row',flexWrap:'wrap',gap:6},chip:{borderWidth:2,borderBottomWidth:4,borderColor:'#79aeb9',borderRadius:16,backgroundColor:'#fff',paddingHorizontal:12,paddingVertical:9,minHeight:44,justifyContent:'center'},chipActive:{backgroundColor:'#b7e3cc',borderColor:'#257e55'},chipText:{color:'#164f55',fontWeight:'700'}});
