const canvas = document.getElementById('scene3d');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020914, 0.035);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(6, 4, 9);
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
const controls = new THREE.OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.autoRotate = true; controls.autoRotateSpeed = .45;
scene.add(new THREE.AmbientLight(0x7bdfff, .55));
const key = new THREE.PointLight(0x34e8ff, 7, 40); key.position.set(0,5,5); scene.add(key);
const orange = new THREE.PointLight(0xff9d22, 5, 18); orange.position.set(-3,1.2,0); scene.add(orange);
const glass = new THREE.MeshPhysicalMaterial({ color:0x34e8ff, transparent:true, opacity:.18, roughness:.08, metalness:.1, transmission:.55, thickness:.65, emissive:0x063d5c, emissiveIntensity:.45, side:THREE.DoubleSide });
const metal = new THREE.MeshStandardMaterial({ color:0x7596aa, metalness:.85, roughness:.18, transparent:true, opacity:.55, emissive:0x0a2038, emissiveIntensity:.2 });
const glowBlue = new THREE.MeshBasicMaterial({ color:0x33e7ff, transparent:true, opacity:.72 });
const glowOrange = new THREE.MeshBasicMaterial({ color:0xff9d22, transparent:true, opacity:.85 });
const group = new THREE.Group(); scene.add(group);
function cyl(r1,r2,len,mat,rot=true){ const m = new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,96,1,true), mat); if(rot)m.rotation.z=Math.PI/2; return m; }
// motor x-ray
const stator = cyl(1.55,1.55,4.2,glass); group.add(stator);
const rotor = cyl(.62,.62,4.8,metal); group.add(rotor);
const shaft = cyl(.32,.32,7.1,metal); shaft.position.x=.85; group.add(shaft);
const front = new THREE.Mesh(new THREE.TorusGeometry(1.62,.08,16,128), glowBlue); front.position.x=2.25; front.rotation.y=Math.PI/2; group.add(front);
const rear = front.clone(); rear.position.x=-2.25; group.add(rear);
const fanBox = new THREE.Mesh(new THREE.BoxGeometry(1.35,2.65,2.65), glass); fanBox.position.x=-3.1; group.add(fanBox);
const impeller = new THREE.Mesh(new THREE.TorusGeometry(.75,.09,18,128), glowOrange); impeller.position.x=-2.75; impeller.rotation.y=Math.PI/2; group.add(impeller);
for(let i=0;i<10;i++){ const fin=new THREE.Mesh(new THREE.BoxGeometry(3.4,.055,.11),glass); fin.position.set(0,1.72,(-.65+i*.145)); group.add(fin); }
for(let i=0;i<4;i++){ const foot=new THREE.Mesh(new THREE.BoxGeometry(.9,.25,.7),glass); foot.position.set(i<2?-1.2:1.2,-1.65,i%2?-1:1); group.add(foot); }
// tank and pipes
const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,2.7,72,1,true), glass); tank.position.set(-6,.1,0); tank.rotation.z=Math.PI/2; group.add(tank);
const pipe = cyl(.18,.18,4.8,glass); pipe.position.set(-4.3,0,0); group.add(pipe);
const outlet = cyl(.22,.22,4.2,glass); outlet.position.set(4.7,0,0); group.add(outlet);
// energy curves
const particles=[]; const particleGeo=new THREE.SphereGeometry(.045,12,12);
for(let i=0;i<85;i++){ const p=new THREE.Mesh(particleGeo, i%5===0?glowOrange:glowBlue); p.userData={t:Math.random()*Math.PI*2, r:.85+Math.random()*.6, speed:.01+Math.random()*.018}; group.add(p); particles.push(p); }
const grid = new THREE.GridHelper(18, 40, 0x1cdfff, 0x07334e); grid.position.y=-1.85; scene.add(grid);
const composer = new THREE.EffectComposer(renderer); composer.addPass(new THREE.RenderPass(scene,camera)); const bloom=new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),1.25,.55,.05); composer.addPass(bloom);
let pumpOn = true, alarmTest=false, packets=1452; const data = { level:74, current:12.8, temp:48, flow:38.4, pressure:4.2, voltage:380, rssi:-82, snr:8.7 };
function chart(id,label,initial){ return new Chart(document.getElementById(id),{type:'line',data:{labels:Array(14).fill(''),datasets:[{label,data:Array(14).fill(initial),tension:.42,borderWidth:2,pointRadius:0}]},options:{responsive:true,animation:false,plugins:{legend:{display:false}},scales:{x:{display:false},y:{ticks:{color:'#8fb8c8'},grid:{color:'rgba(255,255,255,.08)'}}}}}); }
const levelChart=chart('levelChart','Nível',data.level), currentChart=chart('currentChart','Corrente',data.current);
function setText(id,val){ document.getElementById(id).textContent = val; }
function addAlarm(txt,type='danger'){ const ul=document.getElementById('alarmList'); if(ul.querySelector('.ok')) ul.innerHTML=''; const li=document.createElement('li'); li.className=type; li.textContent = new Date().toLocaleTimeString('pt-BR')+' • '+txt; ul.prepend(li); while(ul.children.length>5) ul.lastChild.remove(); }
function updateTelemetry(){
  if(pumpOn){ data.level += (Math.random()-.54)*1.2; data.current=12.5+Math.random()*1.8; data.flow=36+Math.random()*6; data.pressure=4+Math.random()*.5; }
  else { data.current=0; data.flow=0; data.pressure=Math.max(.2,data.pressure-.08); data.level += Math.random()*.35; }
  data.level=Math.max(8,Math.min(96,data.level)); data.temp += pumpOn?(Math.random()-.45)*.7:-.35; data.temp=Math.max(28,Math.min(82,data.temp)); data.rssi=-88+Math.random()*10; data.snr=5+Math.random()*7; packets++;
  setText('tankLevel',data.level.toFixed(0)); setText('flowRate',data.flow.toFixed(1)); setText('pressure',data.pressure.toFixed(1)); setText('temperature',data.temp.toFixed(0)); setText('current',data.current.toFixed(1)); setText('rssi',data.rssi.toFixed(0)); setText('snr',data.snr.toFixed(1)); setText('packets',packets);
  document.getElementById('pumpStatus').textContent=pumpOn?'Ligada':'Desligada';
  document.getElementById('togglePump').textContent=pumpOn?'Desligar Bomba':'Ligar Bomba';
  if(data.level<20) addAlarm('Nível crítico no reservatório.');
  if(data.temp>70) addAlarm('Temperatura elevada no motor.');
  levelChart.data.datasets[0].data.push(data.level); levelChart.data.datasets[0].data.shift(); levelChart.update(); currentChart.data.datasets[0].data.push(data.current); currentChart.data.datasets[0].data.shift(); currentChart.update();
}
document.getElementById('togglePump').onclick=()=>{pumpOn=!pumpOn; addAlarm(pumpOn?'Bomba acionada pelo operador.':'Bomba desligada pelo operador.', pumpOn?'ok':'danger')};
document.getElementById('alarmTest').onclick=()=>{alarmTest=!alarmTest; addAlarm('Teste manual de alarme executado.');};
setInterval(updateTelemetry,1800);
function animate(){ requestAnimationFrame(animate); controls.update(); if(pumpOn){ rotor.rotation.x+=.08; impeller.rotation.z+=.11; }
  particles.forEach((p,i)=>{ p.userData.t += pumpOn?p.userData.speed:.002; const x=-2.8 + ((p.userData.t+i*.09)%6.1); p.position.set(x, Math.sin(p.userData.t*2+i)*p.userData.r, Math.cos(p.userData.t*2+i)*p.userData.r); });
  group.rotation.y = Math.sin(Date.now()*.00025)*.08; composer.render(); }
animate(); addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});
