import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { StageId } from '../../types/game';

type V3 = [number, number, number];
type Layer = 'solid' | 'water' | 'foam';
// Stable variation is baked once at scene creation, never evaluated in the frame loop.
const variation = (seed:number) => { const n=Math.sin(seed*127.1+311.7)*43758.5453;return n-Math.floor(n); };
const palette = {
  wood: '#b78654', woodDark: '#71513c', cream: '#fff0c8', roof: '#dc6444',
  roofLight: '#ef8055', trim: '#fff6d6', glass: '#5bb5d3', glassDark: '#347b9f',
  stone: '#9caaa8', dark: '#3c6554', leaf: '#54ad55', leafLight: '#8ccf62',
};
export const WORLD_CAMERA = { position: [0, 5.1, 8.2] as V3, target: [0, .45, 0] as V3, fov: 42 };
export const groundHeight = (x: number, z: number) => 1.4 - .19 * (x*x + z*z);

/** Static scenery is baked into three vertex-colour batches, independent of prop count. */
class Painter {
  private pieces: Record<Layer, THREE.BufferGeometry[]> = { solid: [], water: [], foam: [] };
  private transform = new THREE.Matrix4();
  private temp = new THREE.Object3D();
  group(position: V3, rotation: V3, scale: V3, draw: () => void) {
    const previous = this.transform.clone();
    this.temp.position.set(...position); this.temp.rotation.set(...rotation); this.temp.scale.set(...scale);
    this.temp.updateMatrix(); this.transform.multiply(this.temp.matrix); draw(); this.transform.copy(previous);
  }
  add(source: THREE.BufferGeometry, color: string, position: V3 = [0,0,0], rotation: V3 = [0,0,0], scale: V3 = [1,1,1], layer: Layer = 'solid', vertexColors?: number[]) {
    const geometry = source.index ? source.toNonIndexed() : source;
    if (geometry !== source) source.dispose();
    this.temp.position.set(...position); this.temp.rotation.set(...rotation); this.temp.scale.set(...scale); this.temp.updateMatrix();
    geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(this.transform, this.temp.matrix));
    geometry.deleteAttribute('uv');
    const positions = geometry.getAttribute('position');
    const c = new THREE.Color(color); const colors = new Float32Array(positions.count * 3);
    for (let i=0;i<positions.count;i++) {
      // Gentle baked ground shading, shared by all surfaces without texture uploads.
      const shade = layer === 'solid' ? .88 + .12 * THREE.MathUtils.clamp((positions.getY(i)+.4)/2.5,0,1) : 1;
      colors.set([c.r*shade,c.g*shade,c.b*shade],i*3);
    }
    geometry.setAttribute('color',new THREE.BufferAttribute(vertexColors ? new Float32Array(vertexColors) : colors,3));
    this.pieces[layer].push(geometry);
  }
  box(size: V3, color: string, at: V3 = [0,0,0], rot: V3 = [0,0,0]) { this.add(new THREE.BoxGeometry(...size),color,at,rot); }
  cyl(top: number,bottom: number,height: number,color: string,at: V3,segments=10,rot: V3=[0,0,0]) { this.add(new THREE.CylinderGeometry(top,bottom,height,segments),color,at,rot); }
  rock(radius: number,color: string,at: V3,scale: V3=[1,1,1],rotation: V3=[0,0,0]) {
    const geometry=new THREE.IcosahedronGeometry(radius,0);
    const vertices=geometry.getAttribute('position');
    const seed=at[0]*13.3+at[1]*5.7+at[2]*23.1+this.transform.elements[12]*17.3+this.transform.elements[14]*31.1;
    // Equal source vertices receive equal displacement, preserving closed silhouettes.
    for(let i=0;i<vertices.count;i++){
      const x=vertices.getX(i),y=vertices.getY(i),z=vertices.getZ(i);
      const factor=.91+variation(seed+x*37+y*73+z*113)*.18;
      vertices.setXYZ(i,x*factor,y*factor,z*factor);
    }
    geometry.computeVertexNormals();
    this.add(geometry,color,at,rotation,scale);
  }
  slab(width:number,depth:number,color:string,seed:number) {
    const shape=new THREE.Shape();
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3,r=.86+variation(seed+i)*.15;
      const x=Math.cos(a)*width*.54*r,y=Math.sin(a)*depth*.59*r;
      if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);
    }
    shape.closePath();
    this.add(new THREE.ExtrudeGeometry(shape,{depth:.026,bevelEnabled:false}),color,[0,.031,0],[-Math.PI/2,0,0]);
  }
  tube(points: V3[],radius:number,color:string,layer:Layer='solid') {
    this.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(4,points.length*2),radius,4,false),color,[0,0,0],[0,0,0],[1,1,1],layer);
  }
  finish() {
    const root = new THREE.Group(); root.name = 'PlanetCleanerWorld';
    for (const layer of ['solid','water','foam'] as const) {
      if(!this.pieces[layer].length) continue;
      const geometry=mergeGeometries(this.pieces[layer],false)!;
      this.pieces[layer].forEach(g=>g.dispose()); geometry.computeBoundingSphere();
      const material=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:layer!=='water'});
      const mesh=new THREE.Mesh(geometry,material); mesh.name=layer; mesh.userData.planet=layer!=='foam'; root.add(mesh);
    }
    return root;
  }
}
function plant(p:Painter,x:number,z:number,draw:()=>void,scale=1,turn=0) { p.group([x,groundHeight(x,z),z],[0,turn,0],[scale,scale,scale],draw); }
function tree(p:Painter,kind:'round'|'pine'|'palm',variant=0) {
  p.cyl(.035,.06,.42,palette.woodDark,[0,.21,0],6);
  if(kind==='pine') {
    p.cyl(0,.28,.52,'#2d8d53',[0,.47,0],7);
    p.cyl(0,.22,.45,'#50b35a',[0,.7,0],7);
    p.cyl(0,.15,.34,'#86cb64',[0,.9,0],7);
  } else if(kind==='palm') {
    p.cyl(.035,.06,.64,palette.wood,[.045,.46,0],6,[0,0,-.12]);
    for(let i=0;i<6;i++) {
      const a=i*Math.PI/3,vertices:number[]=[];
      const leaf=(t:number,side:number):V3=>{
        const r=t*.55,w=Math.sin(t*Math.PI)*.085;
        return [.08+Math.cos(a)*r-Math.sin(a)*w*side,.8+Math.sin(t*Math.PI)*.12-t*.13,Math.sin(a)*r+Math.cos(a)*w*side];
      };
      for(let j=0;j<4;j++){
        const l=leaf(j/4,-1),r=leaf(j/4,1),n=leaf((j+1)/4,-1),q=leaf((j+1)/4,1);
        for(const v of [l,r,q,l,q,n,q,r,l,n,q,l])vertices.push(...v);
      }
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();
      p.add(g,i%2?'#54b85e':'#2c9857');
    }
    for(let i=0;i<3;i++)p.rock(.06,'#956b3e',[.04+i*.04,.72,.02]);
  } else {
    p.tube([[0,.25,0],[-.12,.43,.02],[-.17,.53,0]],.025,palette.woodDark);
    p.rock(.3,variant%2?'#72b754':'#4d9e54',[.025*Math.sin(variant),.64,0],[.91+variation(variant)*.2,1.02+variation(variant+3)*.16,.93+variation(variant+8)*.15],[.2,variant,.08*Math.sin(variant)]);
    p.rock(.2,'#8dce62',[-.15,.72,.05]);
  }
}
function flowerBed(p:Painter,length=.5) {
  p.box([length,.15,.28],palette.wood,[0,.075,0]); p.box([length+.035,.035,.31],'#d49a60',[0,.16,0]);
  p.box([length-.05,.012,.23],'#6f583c',[0,.18,0]);
  for(let i=0;i<3;i++) {
    const x=(i-1)*length/3,z=(i%2-.5)*.08;
    p.cyl(.008,.009,.12,'#4d9f52',[x,.23,z],4);
    for(let j=0;j<3;j++){const a=j*2.094;p.rock(.027,i%2?'#fff5d9':'#f8cb49',[x+Math.cos(a)*.033,.3,z+Math.sin(a)*.033],[1,.5,1]);}
    p.rock(.021,'#efad38',[x,.31,z],[1,.6,1]);
  }
}
function bench(p:Painter) {
  for(let i=0;i<3;i++) p.box([.51,.04,.048],i%2?'#c48b50':'#b77a42',[0,.19,-.065+i*.057]);
  for(let i=0;i<3;i++) p.box([.51,.045,.035],palette.wood,[0,.29+i*.06,-.115],[.1,0,0]);
  for(const x of [-.19,.19]) {p.box([.035,.2,.16],palette.dark,[x,.09,0]);p.box([.03,.34,.03],palette.dark,[x,.21,-.12]);}
}
function fence(p:Painter,length=1) {
  const n=Math.round(length/.25);
  for(let i=0;i<=n;i++) {const x=-length/2+i*length/n;p.box([.045,.29,.045],palette.wood,[x,.145,0]);p.cyl(0,.04,.06,'#d8a16c',[x,.32,0],4);}
  for(const y of [.12,.23])p.box([length,.035,.025],'#d1a06a',[0,y,0]);
}
function lamp(p:Painter) {
  p.cyl(.025,.045,.62,'#395c59',[0,.31,0],6);p.box([.13,.14,.13],'#ffdf88',[0,.7,0]);
  p.cyl(0,.12,.11,'#315751',[0,.83,0],4);p.box([.17,.025,.17],'#315751',[0,.61,0]);
  for(const x of [-.06,.06])for(const z of [-.06,.06])p.box([.014,.16,.014],'#315751',[x,.7,z]);
}
function roof(p:Painter,w:number,h:number,d:number,y:number,color=palette.roof) {
  const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,h);shape.lineTo(w/2,0);shape.closePath();
  p.add(new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),color,[0,y,-d/2]);
  // Eaves, ridge and tile courses are actual model geometry.
  p.box([w+.06,.035,d+.07],palette.trim,[0,y-.012,0]);
  p.box([.045,.045,d+.08],palette.roofLight,[0,y+h+.012,0]);
  for(const side of [-1,1])for(let i=1;i<3;i++) {
    const t=i/3;p.box([.025,.024,d+.025],palette.roofLight,[side*w*.5*t,y+h*(1-t)+.012,0]);
  }
}
function window(p:Painter,x:number,y:number,z:number,w=.13,h=.17) {
  p.box([w+.035,h+.035,.028],palette.trim,[x,y,z]);p.box([w,h,.032],palette.glassDark,[x,y,z+.007]);
  p.box([w*.4,h*.42,.008],palette.glass,[x-w*.22,y+h*.22,z+.026]);
  p.box([.012,h,.013],palette.trim,[x,y,z+.03]);p.box([w,.012,.013],palette.trim,[x,y,z+.03]);
}
function school(p:Painter) {
  p.box([1.13,.09,.66],'#d3c7ac',[0,.045,0]);
  p.box([1.06,.69,.52],'#edc575',[0,.42,0]);
  p.box([1.08,.075,.55],palette.trim,[0,.44,0]);
  roof(p,1.22,.27,.67,.79);
  // Central entrance with pediment, clock and columns.
  p.box([.4,.83,.15],'#f7e4b4',[0,.48,.31]);roof(p,.51,.23,.25,.9);
  p.box([.22,.29,.03],palette.woodDark,[0,.23,.402]);
  p.box([.17,.25,.035],'#548eaa',[0,.24,.424]);p.box([.012,.25,.012],palette.trim,[0,.24,.45]);
  for(const x of [-.165,.165])p.cyl(.024,.032,.4,palette.trim,[x,.32,.43],6);
  p.box([.35,.1,.03],'#c8944f',[0,.66,.41]);
  p.cyl(.085,.085,.025,palette.woodDark,[0,.91,.45],16,[Math.PI/2,0,0]);
  p.cyl(.067,.067,.027,'#fff9df',[0,.91,.468],16,[Math.PI/2,0,0]);
  p.box([.008,.05,.008],palette.dark,[0,.93,.485]);p.box([.037,.008,.008],palette.dark,[.014,.91,.485]);
  for(const x of [-.4,-.25,.25,.4])for(const y of [.26,.59])window(p,x,y,.278,.1,.15);
  for(const side of [-1,1])p.group([side*.54,0,-.02],[0,side*Math.PI/2,0],[1,1,1],()=>window(p,0,.57,0,.14,.17));
  for(let i=0;i<3;i++)p.box([.5+i*.09,.045,.12],i%2?'#dbd9c8':'#eee8d3',[0,.12-i*.04,.47+i*.1]);
  p.cyl(.008,.011,.37,palette.trim,[.33,1.17,0],5);
  p.box([.2,.12,.016],'#f8c546',[.43,1.28,0],[0,0,-.08]);
}
function house(p:Painter,color:string,roofColor:string) {
  p.box([.5,.1,.44],'#cab896',[0,.05,0]);p.box([.46,.43,.38],color,[0,.3,0]);roof(p,.6,.23,.5,.53,roofColor);
  p.box([.1,.23,.025],palette.woodDark,[.09,.18,.2]); window(p,-.12,.31,.204,.13,.15);
  p.box([.09,.21,.1],'#dba56e',[-.14,.71,-.08]);p.box([.12,.03,.12],palette.trim,[-.14,.83,-.08]);
  p.box([.2,.04,.13],'#e4d8bc',[.09,.065,.27]);
  p.group([.238,0,-.015],[0,Math.PI/2,0],[1,1,1],()=>window(p,0,.32,0,.12,.15));
}
function fountain(p:Painter) {
  p.cyl(.4,.43,.13,'#bdc7bc',[0,.065,0],16);p.cyl(.33,.35,.07,'#e5e7d6',[0,.16,0],16);
  p.add(new THREE.CylinderGeometry(.3,.3,.02,20),'#49becd',[0,.205,0],[0,0,0],[1,1,1],'water');
  p.cyl(.055,.1,.28,'#eee6cd',[0,.3,0],8);p.cyl(.19,.1,.06,'#d8ddcb',[0,.46,0],12);
  p.cyl(.025,.025,.23,'#9ee9ed',[0,.59,0],6);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;p.tube([[0,.55,0],[Math.cos(a)*.15,.61,Math.sin(a)*.15],[Math.cos(a)*.25,.22,Math.sin(a)*.25]],.012,'#b4eef1','foam');}
}
function swing(p:Painter) {
  for(const x of [-.29,.29])for(const z of [-.17,.17])p.box([.025,.55,.025],'#db7351',[x,.27,z],[z>0?.28:-.28,0,0]);
  p.box([.66,.04,.04],'#f4c952',[0,.54,0]);
  for(const x of [-.1,.1])p.cyl(.007,.007,.37,'#5c7773',[x,.32,0],4);
  p.box([.26,.035,.13],'#4da8c3',[0,.13,0]);
}
function market(p:Painter) {
  p.box([.6,.09,.47],'#d7bd8e',[0,.045,0]);p.box([.53,.45,.39],'#f0d38e',[0,.3,0]);roof(p,.68,.22,.51,.54,'#d8754d');
  p.box([.64,.04,.32],'#e4714d',[0,.46,.28],[.15,0,0]);
  for(let i=0;i<6;i++)p.box([.105,.045,.32],i%2?'#fff2c9':'#df674c',[-.263+i*.105,.48,.28],[.15,0,0]);
  for(const x of [-.28,.28])p.cyl(.016,.018,.42,palette.woodDark,[x,.23,.4],5);
  p.box([.52,.19,.17],palette.wood,[0,.16,.33]);
  for(let i=0;i<6;i++)p.rock(.045,i%2?'#e89c42':'#83b955',[-.21+i*.085,.28,.35]);
  p.group([.275,0,-.03],[0,Math.PI/2,0],[1,1,1],()=>window(p,0,.32,0,.12,.14));
  window(p,-.14,.32,.206,.13,.16);p.box([.15,.25,.024],palette.woodDark,[.14,.2,.208]);
}
function lighthouse(p:Painter) {
  p.cyl(.18,.24,.1,'#b9b9a2',[0,.05,0],10);p.cyl(.12,.18,.7,'#fff0d2',[0,.45,0],10);
  for(const y of [.3,.55])p.cyl(.18-(y-.1)*.085,.18-(y-.1)*.085,.08,'#df6a4f',[0,y,0],10);
  p.cyl(.17,.17,.06,'#dfd9b9',[0,.83,0],10);p.cyl(.12,.12,.17,palette.glass,[0,.94,0],8);
  for(let i=0;i<6;i++){const a=i*1.047;p.cyl(.01,.01,.18,palette.trim,[Math.cos(a)*.12,.94,Math.sin(a)*.12],4);}
  p.cyl(0,.2,.2,'#d5654a',[0,1.12,0],8);window(p,0,.42,.158,.06,.1);
  p.box([.09,.15,.025],palette.woodDark,[0,.14,.18]);
}
function umbrella(p:Painter) {
  p.cyl(.012,.016,.58,palette.cream,[0,.29,0],5);
  for(let i=0;i<8;i++) {
    const a=i*Math.PI/4,b=(i+1)*Math.PI/4;
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute([0,.7,0,Math.sin(a)*.31,.56,Math.cos(a)*.31,Math.sin(b)*.31,.56,Math.cos(b)*.31],3));
    g.computeVertexNormals();p.add(g,i%2?'#ffe7a6':'#ed8262');
  }
  p.box([.28,.015,.44],'#f8e3b8',[.15,.025,.07],[0,.2,0]);p.box([.28,.016,.07],'#6cb9c8',[.15,.038,.16],[0,.2,0]);
}
function dock(p:Painter) {
  for(let i=0;i<9;i++)p.box([.47,.035,.1],i%2?'#b48050':'#cf975f',[0,.04,i*.105]);
  for(const x of [-.21,.21])for(const z of [.04,.77]){p.cyl(.035,.045,.48,palette.woodDark,[x,-.12,z],6);p.cyl(.04,.04,.06,'#dfb47d',[x,.14,z],6);}
  for(const x of [-.21,.21])p.tube([[x,.13,.04],[x,.09,.4],[x,.13,.77]],.013,'#e2c48a');
}
function bin(p:Painter,color:string) {
  p.box([.16,.22,.16],color,[0,.13,0]);p.box([.19,.035,.19],palette.dark,[0,.255,0]);p.box([.065,.03,.075],palette.dark,[0,.28,0]);
  p.box([.075,.065,.012],palette.trim,[0,.15,.087]);
}
function terrain(p:Painter,stage:StageId) {
  const beach=stage==='beach';
  // Water globe under the raised, scalloped island. Colour bands give the water volume.
  const ocean=new THREE.SphereGeometry(1.98,24,14).toNonIndexed();
  const oceanPositions=ocean.getAttribute('position'),oceanColors:number[]=[];
  const deep=new THREE.Color(beach?'#207ca7':'#237d9f'),shallow=new THREE.Color(beach?'#55c8cb':'#53c0bf');
  for(let i=0;i<oceanPositions.count;i++) {
    const y=oceanPositions.getY(i),x=oceanPositions.getX(i),z=oceanPositions.getZ(i);
    const depth=THREE.MathUtils.clamp((y+1.7)/3.2,0,1);
    const tint=deep.clone().lerp(shallow,depth).multiplyScalar(.97+.03*Math.sin(x*6+z*4));
    oceanColors.push(tint.r,tint.g,tint.b);
  }
  p.add(ocean,'#ffffff',[0,-.34,0],[0,0,0],[1,.78,1],'water',oceanColors);
  const segments=32,rings=6,positions:number[]=[],colors:number[]=[];
  const coast=(a:number)=>1.78+.08*Math.sin(a*5)+.035*Math.cos(a*9);
  const anchors:[number,number,number][] = stage==='school'?[[0,-.65,.6],[-1,.15,.24],[1.25,-.73,.26],[-1.2,-.7,.24]]:stage==='park'?[[0,-.55,.48],[-1.05,-.9,.24],[1.07,-.85,.28],[-.92,-.05,.22],[.92,-.05,.22]]:stage==='beach'?[[.65,-.9,.24],[-.85,-.65,.34],[-1.2,-.35,.16],[1.16,-.55,.16]]:[[0,-.6,.42],[-1,-.55,.34],[1.05,-.6,.34]];
  const point=(j:number,i:number):V3=>{const a=i/segments*Math.PI*2,r=j/rings*coast(a);return [Math.cos(a)*r,groundHeight(Math.cos(a)*r,Math.sin(a)*r),Math.sin(a)*r];};
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){
    const a=point(j,i),b=point(j+1,i),c=point(j+1,i+1),d=point(j,i+1);
    // Upward winding. Per-face shades keep a clean low-poly lawn.
    for(const face of [[a,c,b],[a,d,c]]) {
      const noise=Math.sin(i*127.1+j*311.7)*43758.5453;
      const shade=noise-Math.floor(noise);
      const sandy=beach&&face.reduce((n,v)=>n+v[2],0)/3>-.05+Math.sin(face[0][0]*2)*.18;
      const color=new THREE.Color(sandy?(shade>.5?'#ebd4a0':'#e6ce98'):shade>.65?'#8bbe65':shade>.25?'#88bc63':'#86b961');
      for(const v of face){
        let contact=1;
        for(const [x,z,radius] of anchors){const distance=Math.hypot(v[0]-x,v[2]-z);contact=Math.min(contact,.78+.22*THREE.MathUtils.clamp(distance/(radius+.18),0,1));}
        positions.push(...v);colors.push(color.r*contact,color.g*contact,color.b*contact);
      }
    }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();
  p.add(g,'#ffffff',[0,0,0],[0,0,0],[1,1,1],'solid',colors);
  // One continuous cliff replaces the repeated ring of identical boulders.
  // Its uneven strata, seams and wet base are vertex colours in the existing solid batch.
  const cliffPositions:number[]=[],cliffColors:number[]=[];
  const cliffPoint=(ring:number,i:number):V3=>{
    const a=(i%segments)/segments*Math.PI*2,r=coast(a),n=variation((i%segments)*7.7);
    let radial=ring===0?r:ring===1?r+.025+Math.sin(a*7)*.05:ring===2?r+.09+Math.sin(a*5+1)*.07:ring===3?1.94+Math.sin(a*5)*.025:1.85;
    const y=ring===0?groundHeight(Math.cos(a)*r,Math.sin(a)*r)+.008:ring===1?.46+(n-.5)*.18:ring===2?.35+(n-.5)*.18:ring===3?.025+(n-.5)*.08:-.27;
    if(ring>0&&ring<4)radial=Math.max(radial,Math.sqrt(Math.max(0,1.98**2-((y+.34)/.78)**2))+.035);
    return [Math.cos(a)*radial,y,Math.sin(a)*radial];
  };
  for(let ring=0;ring<4;ring++)for(let i=0;i<segments;i++){
    const a=cliffPoint(ring,i),b=cliffPoint(ring+1,i),c=cliffPoint(ring+1,i+1),d=cliffPoint(ring,i+1);
    for(const [faceIndex,face] of [[a,d,b],[b,d,c]].entries()){
      const n=variation(i*19.7+ring*5.1+faceIndex*.33);
      const dry=new THREE.Color(beach?'#c8ae81':'#a5ab99');
      const wet=new THREE.Color(beach?'#709d98':'#628d8a');
      const color=dry.lerp(wet,ring*.22).multiplyScalar(.86+n*.21);
      for(const vertex of face){cliffPositions.push(...vertex);cliffColors.push(color.r,color.g,color.b);}
    }
  }
  const cliff=new THREE.BufferGeometry();cliff.setAttribute('position',new THREE.Float32BufferAttribute(cliffPositions,3));cliff.computeVertexNormals();
  p.add(cliff,'#ffffff',[0,0,0],[0,0,0],[1,1,1],'solid',cliffColors);
  // A thin, broken turf lip joins the lawn to the rock without duplicated pebble meshes.
  const lipPositions:number[]=[],lipColors:number[]=[];
  for(let i=0;i<segments;i++) {
    const top=cliffPoint(0,i),next=cliffPoint(0,i+1);
    const lower:V3=[top[0]*1.012,top[1]-.055-variation(i)*.055,top[2]*1.012];
    const nextLower:V3=[next[0]*1.012,next[1]-.055-variation((i+1)%segments)*.055,next[2]*1.012];
    const color=new THREE.Color(beach?'#dfc58f':'#689950').multiplyScalar(.93+variation(i*3)*.12);
    for(const v of [top,next,lower,next,nextLower,lower]){lipPositions.push(...v);lipColors.push(color.r,color.g,color.b);}
  }
  const lip=new THREE.BufferGeometry();lip.setAttribute('position',new THREE.Float32BufferAttribute(lipPositions,3));lip.computeVertexNormals();
  p.add(lip,'#ffffff',[0,0,0],[0,0,0],[1,1,1],'solid',lipColors);
  // Broken foam arcs follow the visible coastline, never a flat disc through the land.
  for(let i=0;i<10;i++){
    const a=i/10*Math.PI*2;
    p.tube([[Math.cos(a)*1.91,-.04,Math.sin(a)*1.91],[Math.cos(a+.1)*1.94,-.04,Math.sin(a+.1)*1.94],[Math.cos(a+.19)*1.91,-.04,Math.sin(a+.19)*1.91]],.014,'#aee9df','foam');
  }
}
function waterfall(p:Painter,angle:number) {
  const radius=1.84,top=.8,bottom=-.55;
  const positions:number[]=[];
  for(let i=0;i<10;i++) {
    const y0=top+(bottom-top)*i/10,y1=top+(bottom-top)*(i+1)/10;
    const r0=radius+.08*Math.sin(i/10*Math.PI),r1=radius+.08*Math.sin((i+1)/10*Math.PI);
    const point=(r:number,y:number,side:number):V3=>[Math.cos(angle)*r-Math.sin(angle)*side*.12,y,Math.sin(angle)*r+Math.cos(angle)*side*.12];
    const a=point(r0,y0,-1),b=point(r1,y1,-1),c=point(r1,y1,1),d=point(r0,y0,1);
    for(const v of [a,c,b,a,d,c])positions.push(...v);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();
  // Double-sided thin ribbon becomes two baked faces without a transparent pass.
  const reverse=g.clone();const values=reverse.getAttribute('position');
  for(let i=0;i<values.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(values,i),c=new THREE.Vector3().fromBufferAttribute(values,i+2);values.setXYZ(i,c.x,c.y,c.z);values.setXYZ(i+2,a.x,a.y,a.z);}reverse.computeVertexNormals();
  p.add(g,'#79dce2',[0,0,0],[0,0,0],[1,1,1],'water');p.add(reverse,'#79dce2',[0,0,0],[0,0,0],[1,1,1],'water');
  for(const offset of [-.065,.04])p.tube([[Math.cos(angle)*radius-Math.sin(angle)*offset,top,Math.sin(angle)*radius+Math.cos(angle)*offset],[Math.cos(angle)*(radius+.09)-Math.sin(angle)*offset,.1,Math.sin(angle)*(radius+.09)+Math.cos(angle)*offset],[Math.cos(angle)*(radius+.02)-Math.sin(angle)*offset,bottom,Math.sin(angle)*(radius+.02)+Math.cos(angle)*offset]],.013,'#d5f7e9','foam');
  for(let i=0;i<5;i++)p.rock(.09,'#bcefe3',[Math.cos(angle)*(radius+.02)+(i-2)*.05,bottom,Math.sin(angle)*(radius+.02)],[1,.25,1]);
}
function path(p:Painter,points:[number,number][],color='#d9c49a',width=.19) {
  const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)));
  const n=points.length*3;
  for(let i=0;i<n;i++) {
    const v=curve.getPoint(i/(n-1)),next=curve.getTangent(i/(n-1));
    const turn=Math.atan2(next.x,next.z);
    plant(p,v.x,v.z,()=>p.slab(width,.15,new THREE.Color(color).multiplyScalar(.94+variation(i*2.1)*.1).getStyle(),i*3.7),1,turn+(variation(i)-.5)*.2);
  }
}
function terrainPlanting(p:Painter,stage:StageId) {
  // Upper silhouette and rear planting; the central lawn stays open for collectibles.
  const count=stage==='beach'?4:9;
  for(let i=0;i<count;i++){
    const a=Math.PI+.18+i/(count-1)*(Math.PI-.36),r=1.36+.13*Math.sin(i*3.7);
    const x=Math.cos(a)*r,z=Math.sin(a)*r;
    plant(p,x,z,()=>tree(p,stage==='beach'?'palm':i%3===0?'pine':'round',i),.72+(i%3)*.16,i*.73);
  }
  for(let i=0;i<16;i++){
    const a=i/16*Math.PI*2,r=1.5+.13*Math.sin(i*2.3),x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(stage==='beach'&&z>.15)continue;
    plant(p,x,z,()=>{
      p.rock(.11,i%2?'#60a653':'#8cc161',[0,.075,0],[1.4,.7,1]);
      if(i%3===0)for(let k=0;k<3;k++)p.rock(.022,k%2?'#fff4c9':'#edc34c',[(k-1)*.055,.16,.02]);
    });
  }
}
export function buildWorld(stage:StageId) {
  const p=new Painter();terrain(p,stage);terrainPlanting(p,stage);
  if(stage==='park')waterfall(p,2.45);
  if(stage==='school') {
    plant(p,0,-.65,()=>school(p),1.1);
    path(p,[[0,-.14],[-.08,.3],[.1,.72],[.22,1.35]],'#d9d5b8',.25);
    plant(p,-1,.15,()=>bench(p),.9,.4);
    plant(p,1.15,-.1,()=>swing(p),.85);
    for(const x of [-.65,.65]){plant(p,x,-.18,()=>flowerBed(p,.45));plant(p,x,.53,()=>lamp(p),.65);}
    for(const x of [-1.05,1.05])plant(p,x,.78,()=>fence(p,.55),.9,x>0?-.45:.45);
    plant(p,-1.2,-.7,()=>tree(p,'pine'),1.1);plant(p,1.25,-.73,()=>tree(p,'round'),.95);
  } else if(stage==='park') {
    plant(p,0,-.55,()=>fountain(p),1.15);
    path(p,[[-1.4,.55],[-.7,.1],[0,.14],[.7,.1],[1.4,.55]],'#dbc69c',.22);
    path(p,[[0,.15],[.05,.65],[-.1,1.35]],'#dbc69c',.24);
    for(const x of [-.92,.92]){plant(p,x,-.05,()=>bench(p),1,x>0?-.4:.4);plant(p,x,.62,()=>flowerBed(p,.4),.85);plant(p,x,-.6,()=>lamp(p),.75);}
    plant(p,-1.05,-.9,()=>tree(p,'pine'),1.2);plant(p,1.07,-.85,()=>tree(p,'round'),1.1);
    plant(p,-.9,1.05,()=>fence(p,.7),1,.3);plant(p,.9,1.05,()=>fence(p,.7),1,-.3);
    plant(p,-1.22,.5,()=>bin(p,'#4d98c7'),.85);
  } else if(stage==='beach') {
    plant(p,.65,-.9,()=>lighthouse(p),1.2);
    plant(p,-.85,-.65,()=>house(p,'#f3d9a1','#63aeb6'),.85);
    plant(p,-1,.2,()=>umbrella(p),1,-.3);plant(p,1.05,.35,()=>umbrella(p),.9,.4);
    plant(p,-1.2,-.35,()=>tree(p,'palm'),1.2);plant(p,1.16,-.55,()=>tree(p,'palm'),1.2);
    p.group([-.8,.45,1.37],[0,-.3,0],[1,1,1],()=>dock(p));
    for(let i=0;i<8;i++){const x=-.5+i*.14,z=1.3+Math.sin(i)*.07;plant(p,x,z,()=>p.rock(.055,i%2?'#f3ecce':'#dfa988',[0,.025,0],[1,.35,.8]));}
    path(p,[[.55,-.65],[.2,-.25],[-.1,.2]],'#e6ce96',.17);
  } else {
    plant(p,0,-.6,()=>market(p),1.25);
    plant(p,-1,-.55,()=>house(p,'#e9cc92','#d36a4f'),.92,.25);
    plant(p,1.05,-.6,()=>house(p,'#b9d8aa','#699dab'),.92,-.25);
    path(p,[[-1.35,.2],[-.6,.1],[0,.2],[.6,.1],[1.35,.2]],'#b8b6a3',.28);
    path(p,[[0,.2],[-.1,.75],[.15,1.4]],'#b8b6a3',.28);
    for(const x of [-.85,.85]){plant(p,x,.62,()=>flowerBed(p,.4),.9);plant(p,x,-.05,()=>lamp(p),.7);}
    for(let i=0;i<4;i++)plant(p,-1.12+i*.2,1,()=>bin(p,['#509dcc','#e2bb3d','#64ad62','#d96c5c'][i]),.8);
    plant(p,1.1,.85,()=>bench(p),.9,-.35);
    for(const x of [-1.15,1.15])plant(p,x,.6,()=>fence(p,.5),.8,x>0?-.4:.4);
  }
  return p.finish();
}

// Coordinates are authored on the lawn, away from buildings and the main path.
const itemPlots: Record<StageId,Record<string,[number,number]>> = {
  park:{banana:[-.55,.65],wrapper:[.6,.7],leaf:[.45,-.05]},
  school:{paper:[-.42,.5],'dirty-paper':[.51,.76],bottle:[.69,.31],can:[-.67,.94],'uht-carton':[-.64,-.22],'plastic-cup':[.28,-.05]},
  beach:{bottle:[-.38,.63],'plastic-bag':[.42,.68],can:[.67,.03],food:[-.5,.14]},
  community:{battery:[-.45,.52],'fluorescent-lamp':[.54,.62],bottle:[.65,-.16],wrapper:[-.68,-.12],vegetables:[-.22,.99],'expired-medicine':[.78,.97]},
};
export function itemPlacement(stage:StageId,id:string) {
  const [x,z]=itemPlots[stage][id]??[0,.65];
  return {position:[x,groundHeight(x,z)+.025,z] as V3,rotation:[0,(x+z)*.4,0] as V3};
}
export function disposeWorld(root:THREE.Group) {
  root.traverse(child=>{if(child instanceof THREE.Mesh){child.geometry.dispose();for(const m of Array.isArray(child.material)?child.material:[child.material])m.dispose();}});
}

/** Recognisable waste silhouettes, with the same scale/material language as the world. */
export function buildWaste(model:string) {
  const p=new Painter();
  const silver='#c4d4d4';
  switch(model) {
    case 'bottle': {
      const profile=[[0,0],[.07,.015],[.09,.05],[.09,.24],[.075,.29],[.038,.32],[.038,.39],[0,.39]].map(v=>new THREE.Vector2(...v as [number,number]));
      p.add(new THREE.LatheGeometry(profile,10),'#73c9d7',[0,.035,0]);
      p.cyl(.042,.042,.04,'#3889bc',[0,.44,0],10);p.cyl(.093,.093,.075,'#f5f0d8',[0,.22,0],10);
      p.box([.1,.038,.012],'#419e74',[0,.22,.095]);
      for(const y of [.1,.32])p.add(new THREE.TorusGeometry(.087,.008,4,10),'#a1dce2',[0,y,0],[Math.PI/2,0,0]);
      break;
    }
    case 'can':
      p.cyl(.085,.082,.27,'#df7153',[0,.17,0],12);p.cyl(.086,.086,.015,silver,[0,.312,0],12);p.cyl(.086,.086,.015,silver,[0,.032,0],12);
      for(const y of [.32,.025])p.add(new THREE.TorusGeometry(.085,.009,4,12),silver,[0,y,0],[Math.PI/2,0,0]);
      p.add(new THREE.TorusGeometry(.025,.007,4,8),palette.dark,[0,.325,.01],[Math.PI/2,0,0],[.65,1,1]);
      p.box([.1,.12,.015],'#f6dba2',[0,.17,.083],[0,0,-.12]);break;
    case 'battery':
      p.cyl(.065,.065,.28,'#3f525c',[0,.17,0],10);p.cyl(.066,.066,.085,'#e6b64f',[0,.28,0],10);p.cyl(.027,.027,.02,silver,[0,.332,0],8);
      p.box([.05,.009,.012],palette.trim,[0,.26,.067]);p.box([.009,.05,.012],palette.trim,[0,.26,.068]);break;
    case 'paper':case 'dirty-paper': {
      const shape=new THREE.Shape();shape.moveTo(-.16,-.12);shape.lineTo(.1,-.12);shape.lineTo(.17,-.06);shape.lineTo(.15,.13);shape.lineTo(-.15,.12);shape.closePath();
      p.add(new THREE.ExtrudeGeometry(shape,{depth:.007,bevelEnabled:false}),model==='paper'?'#fff6df':'#d6bf95',[0,.05,0],[-Math.PI/2,.12,-.15]);
      if(model==='dirty-paper') {for(let i=0;i<3;i++)p.rock(.045,'#ad8656',[-.06+i*.06,.065,i%2*.04],[1,.08,.6]);}
      else for(let i=0;i<3;i++)p.box([.17-i*.025,.005,.008],'#a4babe',[-.015,.072,-.055+i*.035],[0,.12,0]);
      break;
    }
    case 'wrapper':
      p.box([.25,.035,.19],'#ed9a38',[0,.07,0],[.12,.12,0]);p.box([.16,.012,.12],'#f8d357',[0,.094,0],[.12,.12,0]);
      for(const x of [-.14,.14]){p.box([.035,.018,.19],silver,[x,.065,0],[0,0,x*1.2]);for(let i=0;i<5;i++)p.box([.04,.015,.012],'#e8e7ce',[x,.077,-.075+i*.035]);}break;
    case 'banana':
      for(let i=0;i<3;i++)p.group([0,.06,0],[0,i*2.094,0],[1,1,1],()=>{
        p.tube([[0,.12,0],[.06,.16,.025],[.14,.09,.04],[.19,.03,.06]],.032,'#edc53f');
        p.tube([[0,.13,-.012],[.06,.17,.014],[.14,.1,.03]],.014,'#ffdf6d');
        p.rock(.021,'#98663a',[.19,.03,.06]);
      });p.cyl(.018,.025,.1,'#947343',[0,.22,0],5,[0,0,.18]);break;
    case 'leaf': {
      const shape=new THREE.Shape();shape.moveTo(-.17,0);shape.quadraticCurveTo(-.02,.16,.18,.015);shape.quadraticCurveTo(.01,-.13,-.17,0);
      p.add(new THREE.ExtrudeGeometry(shape,{depth:.008,steps:1,curveSegments:3,bevelEnabled:false}),'#b68b48',[0,.05,0],[-Math.PI/2,0,.2]);
      p.tube([[-.19,.06,0],[0,.07,0],[.16,.06,.015]],.006,'#795c37');
      for(const x of [-.08,0,.07])p.tube([[x,.07,0],[x+.04,.065,.06]],.004,'#d1a35a');break;
    }
    case 'plastic-cup':
      p.cyl(.1,.062,.22,'#b9dfdf',[0,.14,0],10);p.cyl(.086,.05,.2,'#73b8c0',[0,.155,0],10);
      p.add(new THREE.TorusGeometry(.1,.012,5,12),'#e1f0e5',[0,.255,0],[Math.PI/2,0,0]);
      p.cyl(.009,.009,.3,'#dc8564',[.035,.31,0],5,[0,0,.18]);break;
    case 'uht-carton':
      p.box([.19,.26,.14],'#e9efdf',[0,.16,0]);p.box([.195,.12,.145],'#65abc5',[0,.15,0]);
      roof(p,.19,.07,.14,.29,'#70b5cc');p.box([.018,.03,.15],'#e9efdf',[0,.37,0]);
      p.box([.095,.075,.008],palette.trim,[0,.16,.08]);p.box([.05,.04,.009],'#63a671',[0,.16,.087]);break;
    case 'plastic-bag':
      p.rock(.17,'#d8e5cf',[0,.13,0],[1,.75,.3],[0,.2,0]);
      for(const x of [-.08,.08])p.add(new THREE.TorusGeometry(.05,.014,4,9),'#e9efd9',[x,.28,0],[0,0,0],[.7,1,1]);
      p.box([.18,.02,.03],'#c4d8c6',[0,.22,0]);p.tube([[-.1,.1,.04],[0,.18,.06],[.09,.13,.04]],.007,'#b4cbb9');break;
    case 'food':
      p.cyl(.17,.13,.025,'#ded3b1',[0,.035,0],10);
      for(let i=0;i<7;i++){const a=i*2.4;p.rock(.047,['#b8824d','#e4a75a','#7eaa58'][i%3],[Math.cos(a)*.09,.08+(i%2)*.025,Math.sin(a)*.08],[1,.65,1]);}break;
    case 'vegetables':
      for(let i=0;i<2;i++)p.group([i*.1-.05,.065,0],[0,i*1.4,Math.PI/2+.2],[1,1,1],()=>{
        p.cyl(.055,0,.21,'#e69b45',[0,.1,0],6);
        for(let j=0;j<3;j++)p.tube([[0,.21,0],[(j-1)*.05,.29,0],[(j-1)*.07,.32,.03]],.013,'#6ca858');
      });p.rock(.08,'#85b663',[-.09,.08,.07],[1,.35,1]);break;
    case 'fluorescent-lamp':
      p.cyl(.028,.028,.47,'#e1ece4',[0,.055,0],8,[0,0,Math.PI/2]);
      for(const x of [-.25,.25]){p.cyl(.034,.034,.04,silver,[x,.055,0],8,[0,0,Math.PI/2]);for(const z of [-.012,.012])p.cyl(.004,.004,.02,'#889a98',[x+Math.sign(x)*.03,.055,z],4,[0,0,Math.PI/2]);}break;
    case 'expired-medicine':
      p.box([.14,.19,.09],'#e9eadb',[-.055,.12,0]);p.box([.145,.045,.094],'#c76e64',[-.055,.16,0]);
      p.cyl(.05,.05,.15,'#a07849',[.105,.1,.02],8);p.cyl(.055,.055,.035,'#e9e9d9',[.105,.192,.02],8);
      p.box([.08,.05,.012],'#eee3bd',[.105,.11,.07]);p.box([.075,.008,.012],'#c76e64',[-.055,.085,.052]);break;
  }
  const root=p.finish();root.name=`waste-${model}`;return root;
}

export function stageWasteIds(stage:StageId) { return Object.keys(itemPlots[stage]); }
export function buildRestoredPatch() {
  const p=new Painter();
  for(let i=0;i<3;i++)p.rock(.065,i%2?'#79b754':'#a5cb73',[(i-1)*.065,.025,(i%2)*.04],[1,.3,1]);
  for(const x of [-.05,.055]) {
    p.cyl(.006,.008,.1,'#579448',[x,.07,0],4);
    for(let i=0;i<5;i++){const a=i*1.257;p.rock(.021,'#fff1c4',[x+Math.cos(a)*.025,.12,Math.sin(a)*.025],[1,.45,1]);}
    p.rock(.017,'#e4b94b',[x,.125,0],[1,.5,1]);
  }
  return p.finish();
}
/** Picking uses this small invisible hull instead of testing thousands of scenery triangles. */
export function buildAimOccluder(stage:StageId) {
  const p=new Painter();
  p.add(new THREE.SphereGeometry(1.98,12,8),'#ffffff',[0,-.34,0],[0,0,0],[1,.78,1]);
  const positions:number[]=[];
  const point=(ring:number,i:number):V3=>{const a=i/24*Math.PI*2,r=ring/4*1.78;return [Math.cos(a)*r,groundHeight(Math.cos(a)*r,Math.sin(a)*r),Math.sin(a)*r];};
  for(let ring=0;ring<4;ring++)for(let i=0;i<24;i++)for(const v of [point(ring,i),point(ring+1,i+1),point(ring+1,i),point(ring,i),point(ring,i+1),point(ring+1,i+1)])positions.push(...v);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();p.add(g,'#ffffff');
  if(stage==='school')p.box([1.18,1.18,.64],'#ffffff',[0,groundHeight(0,-.65)+.59,-.65]);
  if(stage==='park')p.cyl(.4,.47,.55,'#ffffff',[0,groundHeight(0,-.55)+.275,-.55],8);
  if(stage==='beach')p.cyl(.2,.26,1.35,'#ffffff',[.65,groundHeight(.65,-.9)+.675,-.9],8);
  if(stage==='community')for(const x of [-1,0,1.05])p.box([x===0?.8:.5,.75,.5],'#ffffff',[x,groundHeight(x,-.6)+.375,-.6]);
  const root=p.finish();root.traverse(o=>{o.userData.planet=false;if(o instanceof THREE.Mesh)o.userData.aimOccluder=true;});return root;
}
