import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import * as THREE from 'three';
import type { RefObject } from 'react';
import type { StageId } from '../../types/game';
import type { Orientation } from '../systems/gyro';
import { parkItems } from '../../data/park';
import { guardOptionalContextLoss } from './contextCleanup';

import { buildAimOccluder, buildRestoredPatch, buildWaste, buildWorld, disposeWorld, itemPlacement, stageWasteIds, WORLD_CAMERA } from './worldBuilder';

function Trash({model,active}:{model:string;active:boolean}) {
  const root=useMemo(()=>buildWaste(model),[model]);
  useEffect(()=>()=>disposeWorld(root),[root]);
  return <group>
    <mesh position={[0,.012,0]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[.19,.215,24]}/>
      <meshBasicMaterial color={active?'#ffd266':'#fff5d5'} transparent opacity={active ? .95 : .5} depthWrite={false} side={THREE.DoubleSide}/>
    </mesh>
    <primitive object={root} dispose={null}/>
  </group>;
}
function RestoredPatch() {
  const root=useMemo(buildRestoredPatch,[]);
  const group=useRef<THREE.Group>(null);
  const growth=useRef(.05);
  useEffect(()=>()=>disposeWorld(root),[root]);
  useFrame((_,delta)=>{if(growth.current>=.999)return;growth.current=THREE.MathUtils.damp(growth.current,1,5,delta);group.current?.scale.setScalar(growth.current);});
  return <group ref={group} scale={.05}><primitive object={root} dispose={null}/></group>;
}
function Scene({stageId,orientationRef,remaining,onTarget}:{stageId:StageId;orientationRef:RefObject<Orientation>;remaining:string[];onTarget:(id:string|null)=>void}){
  const group=useRef<THREE.Group>(null);
  const [highlighted,setHighlighted]=useState<string|null>(null);
  const {camera,size}=useThree();
  const occluder=useMemo(()=>buildAimOccluder(stageId),[stageId]);
  useEffect(()=>()=>disposeWorld(occluder),[occluder]);
  const world=useMemo(()=>buildWorld(stageId),[stageId]);
  useEffect(()=>()=>disposeWorld(world),[world]);
  useEffect(()=>{
    camera.lookAt(...WORLD_CAMERA.target);
    if(camera instanceof THREE.PerspectiveCamera){camera.zoom=Math.min(1,size.width/size.height/.65);camera.updateProjectionMatrix();}
    camera.updateMatrixWorld();checked.current.x=Infinity;
  },[camera,size.width,size.height]);
  const ray=useMemo(()=>new THREE.Raycaster(),[]);
  const center=useMemo(()=>new THREE.Vector2(0,0),[]);
  const last=useRef<string|null>(null);
  const aimElapsed=useRef(0);
  const targets=useRef<THREE.Object3D[]>([]);
  const checked=useRef({x:Infinity,y:Infinity,remaining:null as string[]|null});
  useFrame((_,delta)=>{
    if(!group.current)return;
    const desired=orientationRef.current;
    const alpha=1-Math.exp(-Math.min(delta,.1)/.022);
    group.current.rotation.x+=(desired.pitch-group.current.rotation.x)*alpha;
    group.current.rotation.y+=(desired.yaw-group.current.rotation.y)*alpha;
    aimElapsed.current+=delta;
    const changed=checked.current.remaining!==remaining;
    if(!changed&&aimElapsed.current<1/30)return;
    aimElapsed.current=0;
    const moved=Math.abs(checked.current.x-group.current.rotation.x)>.0001||Math.abs(checked.current.y-group.current.rotation.y)>.0001;
    if(!changed&&!moved)return;
    if(changed){targets.current=[];group.current.traverse(object=>{if(object.userData.targetId||object.userData.aimOccluder)targets.current.push(object)})}
    checked.current={x:group.current.rotation.x,y:group.current.rotation.y,remaining};
    group.current.updateMatrixWorld(true);
    ray.setFromCamera(center,camera);
    const hit=ray.intersectObjects(targets.current,false).find(entry=>entry.object.userData.targetId||entry.object.userData.aimOccluder);
    const id=hit?.object.userData.targetId as string|undefined;
    const next=id??null;
    if(last.current!==next){last.current=next;setHighlighted(next);onTarget(next)}
  });
  return <>
    <hemisphereLight args={['#fff7dd','#6e9da1',1.65]}/>
    <directionalLight position={[-3,7,5]} intensity={2.2} color="#fff0d1"/>

    <group ref={group}>
      <primitive object={world} dispose={null}/>
      <primitive object={occluder} visible={false} dispose={null}/>
      {stageWasteIds(stageId).filter(id=>!remaining.includes(id)).map(id=>{
        const pose=itemPlacement(stageId,id);
        return <group key={`restored-${id}`} position={pose.position}><RestoredPatch/></group>;
      })}
      {parkItems.filter(item=>remaining.includes(item.id)).map(item=>{
        const placement=itemPlacement(stageId,item.id);
        return <group key={item.id} position={placement.position} rotation={placement.rotation}>
          <group scale={1.05}><Trash model={item.modelKey} active={highlighted===item.id}/></group>
          <mesh position={[0,.21,0]} userData={{targetId:item.id}}><sphereGeometry args={[.27,8,6]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
        </group>;
      })}
    </group>
  </>;
}
export function ParkScene(props:{stageId:StageId;orientationRef:RefObject<Orientation>;remaining:string[];onTarget:(id:string|null)=>void}){
  return <Canvas onCreated={({gl})=>guardOptionalContextLoss(gl)} camera={{position:WORLD_CAMERA.position,fov:WORLD_CAMERA.fov,near:.1,far:40}}><Scene {...props}/></Canvas>;
}
