# ที่มาภาพและเสียง

| ไฟล์ | ที่มาและการปรับ | สิทธิ์/หมายเหตุ |
|---|---|---|
| `assets/art/menu-planet.png` | สร้างด้วยเครื่องมือ imagegen โดยใช้ `reference_images/01_Main_Menu.jpg` ของโปรเจกต์เป็นภาพอ้างอิงเมื่อ 30 ต.ค. 2026 | ภาพประกอบ 2D หน้าเมนู ไม่ใช่โมเดล 3D ในเกม; ตรวจสิทธิ์ภาพอ้างอิงสำหรับการเผยแพร่ |
| `assets/audio/menu-music.mp3` | แปลงจาก `jong-drill-story/public/music-v4.wav` ในโปรเจกต์ Jong ของผู้ใช้เป็น MP3 และเพิ่มเกน 6 เท่า | `score_v4.py` ระบุเพลงต้นฉบับและไม่มี sample ภายนอก; ตรวจสิทธิ์การเผยแพร่ของเจ้าของผลงานก่อนปล่อยจริง |
| `assets/audio/click.wav` | แปลงจาก `studio/assets/sound-effects/pop/kenney-interface-pluck-001.ogg` ในโปรเจกต์ Jong | Kenney Interface Sounds, CC0 ตามทะเบียนต้นทาง [Kenney](https://kenney.nl/assets/interface-sounds) |
| `assets/audio/correct.wav` | แปลงจาก `studio/assets/sound-effects/ding/kenney-interface-confirmation-001.ogg` ในโปรเจกต์ Jong | Kenney Interface Sounds, CC0 ตามทะเบียนต้นทาง |
| `assets/audio/wrong.wav` | แปลงจาก `studio/assets/sound-effects/ding/kenney-interface-bong-001.ogg` ในโปรเจกต์ Jong | Kenney Interface Sounds, CC0 ตามทะเบียนต้นทาง |

ข้อมูล Kenney เทียบกับ `/home/kanok/Videos/Ai-Clip/studio/assets/sound-effects/LICENSES.md` ของโปรเจกต์ต้นทาง การแปลงเสียงใช้ GStreamer; ปรับเกนเพลงตามที่ระบุ เพลงเล่นต่อเนื่องระหว่างหน้าต่าง ๆ และมีสวิตช์ปิด เอฟเฟกต์มีสวิตช์แยก ตรวจระดับเสียงและจุดวนซ้ำบนมือถือจริงก่อนเผยแพร่


## ภาพและเสียงเพิ่มเติม

| ไฟล์ | ที่มาและการปรับ | สิทธิ์ |
|---|---|---|
| `assets/art/sorting-bins.png` | สร้างด้วย imagegen โดยอ้างอิง `reference_images/06_Sorting.jpg` ใช้เป็นภาพประกอบ 2D | ตรวจสิทธิ์ภาพอ้างอิงก่อนเผยแพร่ |
| `assets/audio/music-overworld.mp3` | [Overworld (BGM), IntelligentGene / Another Page Studio](https://opengameart.org/content/overworld-bgm) | CC0 |
| `assets/audio/music-happy-menu.mp3` | [Happy menu song, Blocky Modeler](https://opengameart.org/content/happy-menu-song) | CC0 |
| `assets/audio/music-wisdom.mp3`, `music-swing.mp3` | [Short loops background music pack, hernandack](https://opengameart.org/content/short-loops-background-music-pack); แปลง OGG เป็น MP3 และปรับระดับเสียง | CC0 |
| `assets/audio/pickup.wav` | Jong: [Pop In SFX, Sadiquecat](https://freesound.org/people/Sadiquecat/sounds/824189/); แปลง OGG เป็น WAV | CC0 ตามทะเบียนต้นทาง |
| `assets/audio/correct-jong.wav`, `complete.wav` | Jong: [Kenney Digital Audio](https://kenney.nl/assets/digital-audio); แปลง OGG เป็น WAV | CC0 |

เพลย์ลิสต์มีเพลงจาก Jong 1 เพลงและ OpenGameArt 4 เพลง เล่นตามลำดับและวนซ้ำ โปรดตรวจระดับเสียง จุดเปลี่ยนเพลง และสิทธิ์เพลง Jong บนอุปกรณ์จริงก่อนเผยแพร่

เสียงตอบถูกปัจจุบัน `assets/audio/correct-confirmation.wav` แปลงจาก Jong `ding/kenney-interface-confirmation-003.ogg` ([Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds), CC0); เลือกเปลี่ยนจากเสียง two-tone ตามความคิดเห็นผู้ใช้ และมีปุ่มลองฟังในหน้าตั้งค่า

| `assets/art/items/*.png` | สร้างด้วย imagegen เป็นภาพประกอบ 2D ของขยะ 8 ชนิดที่มีในฉาก โดยตัดจากภาพชุดเดียวกันเมื่อ 30 ต.ค. 2026 | ภาพประกอบ UI ไม่ใช่โมเดล 3D |


ภาพ `assets/art/items/plastic-cup.png`, `uht-carton.png`, `plastic-bag.png`, `food.png`, `fluorescent-lamp.png`, `vegetables.png`, `expired-medicine.png` สร้างด้วย imagegen เมื่อ 30 ต.ค. 2026 เป็นภาพประกอบ 2D ของรายการตามใบเนื้อหาทีม โมเดล 3D ใน `src/game/scene/ParkScene.tsx` ปั้นแบบ procedural ด้วย Three.js ตามข้อมูลรูปทรงทั่วไป ไม่ได้ใช้ไฟล์โมเดลภายนอก

ภาพ `assets/art/stages/{park,school,beach,community}.png` สร้างด้วย imagegen เมื่อ 30 ต.ค. 2026 สำหรับการ์ดเลือกด่าน เป็นภาพประกอบแนวทางศิลป์ ไม่ใช่ภาพจับจากฉาก 3D ที่เล่นจริง

`assets/art/app-icon.png` สร้างด้วย imagegen สำหรับ Planet Cleaner วันที่ 1 พ.ย. 2026 ใช้เป็นไอคอนแอป Android และ iOS
