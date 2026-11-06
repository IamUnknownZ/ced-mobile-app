import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import * as THREE from 'three';
import { buildAimOccluder, buildWaste, buildWorld, disposeWorld, groundHeight, itemPlacement, WORLD_CAMERA } from '../src/game/scene/worldBuilder.ts';
import { stages } from '../src/data/stages.ts';

function validate(root:THREE.Group) {
  let vertices=0;
  root.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return;
    const geometry=object.geometry;
    const position=geometry.getAttribute('position');
    assert.ok(position.count>0);
    for(const name of ['position','normal','color']) {
      const attribute=geometry.getAttribute(name);
      assert.equal(attribute.count,position.count,`${name} must cover every vertex`);
      assert.ok(Array.from(attribute.array).every(Number.isFinite),`${name} has a non-finite value`);
    }
    vertices+=position.count;
  });
  return vertices/3;
}

test('all four authored worlds stay within the mobile geometry and batch budget',()=>{
  for(const stage of stages){
    const world=buildWorld(stage.id);
    assert.ok(validate(world)<10000,`${stage.id} exceeded its triangle budget`);
    assert.ok(world.children.length<=3,`${stage.id} must keep static scenery batched`);
    disposeWorld(world);
  }
});
test('every waste model has finite geometry and is placed above the lawn',()=>{
  const seen=new Set<string>();
  for(const stage of stages)for(const id of stage.wasteItemIds){
    const pose=itemPlacement(stage.id,id);
    assert.ok(pose.position[1]>groundHeight(pose.position[0],pose.position[2]));
    if(seen.has(id))continue;seen.add(id);
    const root=buildWaste(id);
    assert.ok(validate(root)>10,`${id} has no model`);
    assert.ok(new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).length()>.1);
    disposeWorld(root);
  }
  assert.equal(seen.size,15);
});
test('all waste aim proxies are visible from the starting camera',()=>{
  const origin=new THREE.Vector3(...WORLD_CAMERA.position);
  for(const stage of stages){
    const world=buildWorld(stage.id);world.updateMatrixWorld(true);
    for(const id of stage.wasteItemIds){
      const pose=itemPlacement(stage.id,id);
      const center=new THREE.Vector3(...pose.position).add(new THREE.Vector3(0,.21,0));
      const ray=new THREE.Raycaster(origin,center.clone().sub(origin).normalize());
      const hit=ray.intersectObjects(world.children,false)[0];
      assert.ok(!hit||hit.distance>origin.distanceTo(center)-.27,`${stage.id}/${id} blocked by scenery`);
    }
    disposeWorld(world);
  }
});
test('every item can be acquired by the centre reticle within the gyro pitch limit',()=>{
  const camera=new THREE.PerspectiveCamera(WORLD_CAMERA.fov,420/650,.1,40);
  camera.position.set(...WORLD_CAMERA.position);camera.lookAt(...WORLD_CAMERA.target);camera.updateMatrixWorld(true);
  const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(),camera);
  for(const stage of stages){
    const root=new THREE.Group(),world=buildAimOccluder(stage.id);root.add(world);world.visible=false;
    const proxies=stage.wasteItemIds.map(id=>{
      const pose=itemPlacement(stage.id,id),mesh=new THREE.Mesh(new THREE.SphereGeometry(.27,8,6),new THREE.MeshBasicMaterial());
      mesh.position.set(...pose.position).add(new THREE.Vector3(0,.21,0));mesh.userData.targetId=id;root.add(mesh);return mesh;
    });
    for(const proxy of proxies){
      const local=proxy.position;
      const point=ray.ray.intersectSphere(new THREE.Sphere(new THREE.Vector3(),local.length()),new THREE.Vector3());
      assert.ok(point);
      const yaw=-Math.atan2(local.x,local.z);
      const pitch=Math.atan2(local.y,Math.hypot(local.x,local.z))-Math.atan2(point.y,point.z);
      assert.ok(Math.abs(pitch)<=Math.PI/3,`${stage.id}/${proxy.userData.targetId} exceeds gyro limit`);
      root.rotation.set(pitch,yaw,0);root.updateMatrixWorld(true);
      const first=ray.intersectObjects([...world.children,...proxies],false)[0];
      assert.equal(first?.object.userData.targetId,proxy.userData.targetId,`${stage.id}/${proxy.userData.targetId} cannot be aimed at`);
    }
    disposeWorld(world);proxies.forEach(p=>{p.geometry.dispose();p.material.dispose();});
  }
});

test('aim hull stays cheap enough for repeated mobile picking',()=>{
  for(const stage of stages){const hull=buildAimOccluder(stage.id);assert.ok(validate(hull)<450);disposeWorld(hull);}
});
