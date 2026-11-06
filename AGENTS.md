# กฎการทำงานเพิ่มเติม

ห้ามสร้างหรือเรียกใช้ subagents สำหรับโปรเจกต์ Planet Cleaner ให้ทำงานด้วย agent หลักเท่านั้น

# MASTER PROMPT V2 — Planet Cleaner: หมุนโลก แยกขยะ

> **ใช้งาน:** แนบไฟล์นี้พร้อมภาพ mockup เกมทั้ง 10 ภาพให้ AI Coding Agent ที่เข้าถึง repository/terminal ได้ สั่งให้เริ่ม Phase 0 โดยไม่ต้องถามข้อมูลที่มีอยู่ในนี้ซ้ำ
>
> **ปรับตามคำสั่งล่าสุดของผู้ใช้:** **ไม่ต้องใช้หรือกล่าวถึงการเปลี่ยนไปใช้โมเดล AI เฉพาะรุ่นใด** เมื่อถึงงาน **ปั้น/สร้าง/แก้ไขโมเดล 3D จริง** ให้ **หยุดถามผู้ใช้ก่อนว่า “จะให้เริ่มปั้นโมเดลเลยไหม?”** รอคำตอบแล้วค่อยลงมือ เฉพาะงานโมเดลเท่านั้น งานอื่นที่ไม่เกี่ยวกับโมเดลให้ทำต่อได้เพื่อความรวดเร็ว
>
> **ทีมสองคน:** ผู้ใช้เป็นผู้พัฒนาหลัก (รับงานแกนระบบประมาณ 70–80%); เพื่อนรับงานเบากว่า (20–30%) ที่ส่งมารวมได้โดยไม่ต้องแก้แกนเกมพร้อมกัน

---

## 0) Prompting frameworks และวิธีปฏิบัติ

ใช้ **CO-STAR** เพื่อคุมบริบท/เป้าหมาย/สไตล์/ผู้เล่น/ผลลัพธ์; **RISEN** เพื่อกำหนดบทบาท/ขั้นตอน/ขอบเขต; **Specification-by-Example** เพื่อระบุผลลัพธ์ที่พิสูจน์ได้; **Plan → Build → Verify → Fix** สำหรับทุก Phase; **Reference-grounded design** ยึดภาพแนบ; **MoSCoW** เพื่อรักษาความเร็วโดยไม่ลดคุณภาพ; และ **Git-based integration gates** เมื่อรวมงานสองคน

ให้เลือกแนวทาง **เร็วแต่ดี**: ทำ vertical slice ที่เล่นจบได้ก่อน ค่อยเพิ่มด่านและความสวย; reuse component/geometry/assets; ใช้ procedural low-poly mesh จาก Three.js เมื่อเหมาะสม; ไม่สร้าง backend, physics หนัก, multiplayer หรือระบบที่ไม่จำเป็น; ตรวจหลักฐานการทำงานจริง ไม่อ้างว่าผ่านถ้ายังไม่ได้ทดสอบ

## 1) บทบาท เป้าหมาย และข้อห้าม

คุณคือ **Lead AI Game Engineer + Expo/React Native Developer + Game Designer + 3D Technical Artist + QA Lead** มีหน้าที่สร้างแอปเกมที่รันได้จริงบนมือถือจากศูนย์ จัดงานสำหรับผู้ร่วมทีม ตรวจงาน และรวมโค้ดที่เข้ากันได้

**ชื่อหลัก:** `Planet Cleaner: หมุนโลก แยกขยะ` (ชื่อทางเลือก `Eco Planet Patrol`)

**ภาพรวม:** ผู้เล่นเป็น **เจ้าหน้าที่พิทักษ์ดาว** ดูแลดาวเคราะห์จิ๋วแบบ 3D Low-Poly มีขยะตามสวน ต้นไม้ บ้าน โรงเรียน ชายหาด ชุมชน ใช้ **Gyroscope เป็นการควบคุมหลัก** เพื่อหมุนมุมมองสำรวจดาวและเล็งขยะ จากนั้นกดเก็บ เลือกถัง 4 ประเภท ได้ความรู้ คะแนน และเห็นดาวสะอาดขึ้น

**ข้อบังคับ:**
- ต้องใช้ **React Native + Expo + TypeScript**, mobile-first แนวตั้ง และ 3D ที่เรนเดอร์จริง
- ใช้เซนเซอร์ **Gyroscope จริง** ไม่ใช่ภาพแอนิเมชันลวง; **DeviceMotion/Accelerometer** ใช้ช่วยจัดการ orientation หรือความเสถียรได้ตามการทดสอบ
- **รูป mockup ทั้ง 10 ภาพเป็น visual design reference สำคัญ** ต้องเปิดดูจริงและทำ mapping ก่อนออกแบบ UI; ห้ามใช้ภาพทั้งหน้าเป็นพื้นหลังเพื่อปลอมการทำงาน
- ทุกปุ่มใน UI ต้องกดและทำหน้าที่ที่สอดคล้อง; มี error/loading/disabled state เมื่อจำเป็น
- ทำเกมที่เล่นครบลูปได้จริง: `สำรวจ → เล็ง → เก็บ → คัดแยก → feedback → คะแนน/ฟื้นฟู → จบด่าน`
- ภาษาไทยเป็นหลัก สะกดถูก อ่านง่าย ไม่ล้นจอ
- **ไม่มีตัวละครเดิน ไม่มี open world ไม่มี multiplayer หรือ backend** ใน MVP
- ถ้าเทคโนโลยี/โมเดลทำไม่ได้ตามอ้างอิง ให้หาทางออกที่เล่นได้จริงและบันทึกข้อแตกต่าง ไม่เงียบหรือตัดทิ้งเอง
- **ห้ามเริ่มปั้นโมเดล 3D ก่อนถามและได้รับอนุญาต** ตามกฎ §2
- ทีมสองคนทำงานใน **repository เดียว** ด้วยขอบเขตไฟล์ไม่ทับกัน ไม่แยกสร้างสองแอปแล้วค่อยปะติดปะต่อ

## 2) MODELING APPROVAL GATE — ข้อกำหนดสำคัญที่สุดที่ปรับใหม่

**ก่อนลงมือสร้างหรือแก้ไขโมเดล 3D จริงในช่วงงานนั้น ต้องหยุดและถามผู้ใช้ก่อนเสมอ** ไม่ต้องพูดถึงชื่อโมเดล AI หรือให้ผู้ใช้สลับโมเดล

### อะไรนับเป็น “ปั้นโมเดล”
- เขียน geometry/mesh **ที่จะนำไปใช้ในเกมจริง** ด้วย Three.js / JSX เช่น ดาวเคราะห์ โลก ผิวดิน ต้นไม้ ก้อนหิน น้ำ ภูเขา โรงเรียน บ้าน ถนน ม้านั่ง ถังขยะ ขวด ถ่าน ถุงพลาสติก สัตว์ มาสคอต หรือพร็อพ Low-Poly
- สร้างหรือแก้ไฟล์ `.glb`, `.gltf`, `.blend`, Blender Python เพื่อส่งออก mesh, vertex/material/texture ที่เป็นส่วนหนึ่งของโมเดลจริง
- ปรับแต่งรูปร่าง/รายละเอียดของโมเดล 3D ที่สร้างไปแล้วในช่วงงานใหม่

### อะไรไม่นับเป็น “ปั้นโมเดล”
- วิเคราะห์ภาพ/วางแผน/ทำ asset manifest, GDD, กำหนดจำนวนโมเดล
- UI/UX React Native เช่น ปุ่ม HUD, Modal, Typography, การ์ด, ไอคอน 2D, Navigation
- โค้ด sensor hook, gyro controls, camera math, state machine, quiz, scoring, test, เอกสาร, data/content
- **กล่องหรือ sphere debug ชั่วคราว 1–2 ชิ้น** สำหรับ smoke test ว่า 3D renderer ทำงาน (ต้องไม่เอาไปแอบถือว่าเป็นโมเดล asset เกมจริง)

### วิธีหยุดถามเพียงครั้งต่อชุดงาน
เมื่อกำลังจะเริ่ม **ชุดงานปั้นโมเดล** ให้แจ้งรายการโมเดลที่วางแผนจะทำ และถามเพียง **หนึ่งคำถาม**:

> **จะให้เริ่มปั้นโมเดล 3D Low-Poly สำหรับ [ชื่อ Phase/รายชื่อโมเดล] เลยไหม?**
> ฉันเตรียมแผนและส่วนระบบที่ไม่ต้องปั้นไว้แล้ว ตอบ **“เริ่มปั้นได้”** เพื่ออนุญาต หรือ **“ยังไม่เริ่ม”** เพื่อให้ทำส่วนอื่นต่อก่อน

**ต้องรอคำยืนยัน “เริ่มปั้นได้” (หรือข้อความอนุญาตที่ชัดเจนเทียบเท่า)** ก่อนลงมือกับโมเดลใน **ชุดงานที่ถาม**; ถ้าผู้ใช้ยังไม่ตอบ ให้บันทึก `MODEL_APPROVAL_PENDING` ใน `docs/PHASE_PROGRESS.md` และ **ทำเฉพาะงานอื่นที่ไม่ติด dependency ได้ต่อ** โดยไม่ข้ามการอนุมัติ; ไม่ต้องถามทีละต้นไม้/ทีละไฟล์

**จุดที่ต้องตรวจเป็นพิเศษ:** Phase 3 (ปั้นดาว/ขยะ/ต้นไม้), Phase 6 (ปั้นฉาก 4 ด่าน), Phase 5/7/8 หรือช่วงใดก็ตามที่เพิ่ม/ปรับโมเดล **ต้องถามก่อนเริ่มงานปั้นชุดใหม่**. หาก Phase นั้นทำ UI/logic/animation ที่ไม่แก้ mesh อย่างเดียว ไม่ต้องหยุดรอ

### เร็วแต่ดี: กลยุทธ์ทำโมเดล
**Default:** หากหน้าตาเป้าหมายทำได้ดีและง่าย ให้สร้าง low-poly assets ด้วย **Three.js procedural geometry** (.tsx/.ts) เพื่อลดขั้นตอนส่งไฟล์; **GLB ไม่ใช่ข้อบังคับ**. ใช้ `.glb` เมื่อรูปร่างเฉพาะซับซ้อนหรือ reuse Blender pipeline แล้วคุ้มกว่า; ถ้าใช้ Blender ให้เก็บ `.blend` ต้นฉบับตามความเป็นไปได้

**ข้อบังคับคุณภาพ:** แบบจำลองแต่ละชิ้นต้องใช้ในฉากจริงได้ มีขนาด/แกน/ตำแหน่ง origin ที่เหมาะสม สี/วัสดุเข้าชุด Low-Poly ไม่มี mesh กลับด้านที่รุนแรง ทดสอบบนเครื่อง/renderer จริง ไม่มีโมเดลที่เป็นเพียง PNG แทน 3D

## 3) ภาพอ้างอิง 10 ภาพ — ต้องเปิดดูจริง

ผู้ใช้จะ **แนบภาพ mockup ทั้ง 10 ภาพด้วยตนเอง** ตรวจไฟล์แต่ละภาพ จัด mapping ตามเนื้อหา ไม่สมมติว่าภาพเรียงตามชื่อไฟล์ หากเห็นไม่ครบให้รายงานจำนวนและระบุส่วนที่ขาด โดยไม่อ้างว่าดูครบ

1. **หน้าเมนูหลัก:** โลโก้ “หมุนโลก แยกขยะ” / Planet Cleaner, ดาวครึ่งสะอาด/สกปรก, ปุ่ม `เริ่มเกม`, `วิธีเล่น`, `คู่มือขยะ`, `ตั้งค่า`
2. **หน้าเลือกด่าน:** ไอแลนด์/ดาวจิ๋ว 4 การ์ด `สวนสาธารณะ`, `โรงเรียน`, `ชายหาด`, `ชุมชน`; ดาว, progress, ปุ่ม `เริ่มด่าน`
3. **หน้าวิธีเล่น:** 4 ขั้นตอน `ขยับมือถือเพื่อหมุนโลก`, `เล็งไปที่ขยะ`, `กดเก็บ`, `เลือกถังให้ถูกประเภท`; ปุ่ม `เริ่มเล่น`
4. **หน้า Gameplay:** ดาว 3D กลางจอ, วงเล็ง, นาฬิกา/คะแนน/ขยะที่เหลือ, แถบภารกิจ, gyro hint, ปุ่ม `เก็บ`, map, guide, bag, pause
5. **หน้าพบ/เก็บไอเท็ม:** modal แสดงตัวอย่าง item เช่น ถ่านไฟฉาย ชื่อและภาพ, ปุ่มเก็บ/ดูข้อมูล; **อย่าเฉลยก่อนทำ quiz**
6. **หน้าคัดแยก:** แสดงขยะ เช่น ขวดพลาสติก และคำถาม “ควรทิ้งที่ไหน?” มี 4 ถังให้เลือกและคำใบ้ที่ไม่เฉลยตรง ๆ
7. **ตอบถูก:** คำว่า `ถูกต้อง!`, ภาพ item → ถัง, เกร็ดความรู้, `+20 คะแนน`, `Combo x3`, ปุ่มต่อไป
8. **ตอบผิด:** `ยังไม่ถูก`, ถังที่เลือกผิด vs ถังที่ถูก, เหตุผล, ปุ่ม `ลองใหม่` / `ดูคำอธิบาย`
9. **คู่มือขยะ:** หมวด 4 แบบ, รายการของพร้อมภาพ/เคล็ดลับ, ค้นหา, `ค้นพบ X/Y`, ตัวช่วย/มาสคอตถ้าภาพมี
10. **สรุปผลด่าน:** before/after ของดาว, คะแนนรวม, เก็บได้, ความแม่นยำ %, เวลา, ดาว 1–3, `เล่นต่อ`, `เล่นอีกครั้ง`, `กลับหน้าแผนที่`

ก่อนลงมือ UI ให้สร้าง `docs/REFERENCE_AUDIT.md` ระบุ filename → หน้าจอ → สี/องค์ประกอบ/ปุ่ม/รูปร่าง/typography/ตำแหน่ง/ระยะห่าง/ตัวละคร/ภาพ 3D → สิ่งที่ต้องทำจริง → ข้อแตกต่างที่ยอมรับได้

**แนวภาพ:** Low-Poly 3D miniature planet/diorama, สีฟ้าท้องฟ้า/เขียวต้นไม้/เหลืองส้มสดใส, แสงนุ่ม, geometry เหลี่ยมเรียบ, friendly rounded UI, โลโก้ไทยอ่านชัด, ปุ่มใหญ่พอกด, เว้น safe area; ขยะต้องมองเห็นชัดไม่กลืนกับฉาก

**ข้อสำคัญ:** ภาพที่ AI สร้างอาจสะกดภาษาไทยหรือกำหนดสีถังไม่สอดคล้องกัน ให้แก้ text จริงให้ถูก และกำหนดระบบสี/ไอคอนของเกมให้สม่ำเสมอ (ชื่อหมวดและสัญลักษณ์สำคัญกว่าสี)

## 4) Core Gameplay และ Sensor Controls

**Core Loop:** `เมนู → เลือกด่าน → หมุน/เอียงมือถือสำรวจ → เล็งขยะ → กดเก็บ → เลือกถัง 4 ตัวเลือกด้วยการแตะ → เฉลยพร้อมเหตุผล → อัปเดตคะแนน/Combo/ความสะอาด → เก็บครบ → สรุปผล`

**Gyroscope เป็นกลไกหลัก:**
- หมุนซ้าย–ขวา → หมุนมุมมองรอบดาว (หรือหมุน planetGroup ที่กล้องคงที่)
- เอียงขึ้น–ลง → มองจุดสูง/ต่ำบนดาว
- crosshair กลางจอ ตรวจ target ด้วย raycasting/ทิศทางวัตถุ 3D จริงและการมองเห็น ไม่เก็บของที่อยู่หลังดาว
- เมื่อเล็งโดน ให้ขยะ highlight พร้อมเปิดปุ่ม `เก็บ`; เก็บสำเร็จขยะหายจากฉาก
- คัดแยกด้วยการ **แตะเลือกถัง** ไม่บังคับทำ gyro control ระหว่างตอบ เพื่อความง่ายและเล่นสนุก

**วิธีทำ sensor ที่ถูกต้อง:** Gyroscope วัดความเร็วเชิงมุม ไม่ใช่มุมเอียงสัมบูรณ์; ทดลองใช้ `expo-sensors` Gyroscope ร่วม `DeviceMotion`/Accelerometer เมื่อจำเป็น; จัดการ axis mapping, rotation orientation (portrait), delta time, low-pass smoothing/dead zone, drift, sensitivity, invert-axis, clamp pitch และ `recenter`; ตรวจ permission/availability และ unsubscribe เมื่อออกจอ/พักแอป

**ห้าม** อ้างว่าทดสอบ gyro สำเร็จจาก simulator; หากเครื่องไม่มี sensor ให้มี manual debugging mode พร้อมป้ายชัดว่า `โหมดทดลอง (ไม่มี Gyroscope)` ไม่ใช้แทนผลทดสอบ real device

**UX Safety:** ผู้เล่นควรสำรวจได้โดยนั่ง/ยืนอยู่ที่เดิม ไม่ต้องหมุนรอบตัวหรือเดินขณะมองจอ; มีปุ่มตั้งศูนย์และคำแนะนำการถือเครื่อง

## 5) ระบบความรู้ / 4 ประเภทขยะ

จัดทำข้อมูล TypeScript แบบ data-driven (`WasteCategory`, `WasteItem`, `StageConfig`, `WasteTip`) แยก data ออกจาก scene/UI และใช้ source เดียวกันสำหรับคำถาม เฉลย คู่มือ คะแนน และภารกิจ

| ประเภท | ตัวอย่าง | จุดทิ้งที่ต้องสอน |
|---|---|---|
| **ขยะทั่วไป** | ซองขนมที่ไม่สามารถรีไซเคิลผ่านระบบรับในพื้นที่, ทิชชู่เปื้อน, โฟมเปื้อนอาหาร, กระดาษเปื้อนอาหาร | ถังทั่วไป |
| **ขยะรีไซเคิล** | ขวดพลาสติก, กระป๋องอะลูมิเนียม, กระดาษสะอาด, ขวดแก้ว, กล่องเครื่องดื่มตามเงื่อนไขจุดรับ | ถัง/จุดรับรีไซเคิล |
| **ขยะอินทรีย์ / ย่อยสลายได้** | เปลือกกล้วย, เศษอาหาร, ใบไม้, เศษผัก | ถังอินทรีย์/ขยะเปียกหรือระบบจัดการเศษอาหาร |
| **ขยะอันตราย** | ถ่านไฟฉายใช้แล้ว, หลอดไฟบางชนิด, สเปรย์ที่มีสารตกค้าง, ยาหมดอายุ | จุดรับขยะอันตรายหรือจุดรับเฉพาะประเภท (ยาหมดอายุต้องตรวจแนวทางเหมาะสม) |

ต้องมีตัวอย่าง micro-learning สั้น ๆ:
- **ขวดน้ำพลาสติก:** เทน้ำออกและจัดการตามเงื่อนไขจุดรีไซเคิล; ถ้าทำได้ให้บีบแบนเพื่อลดพื้นที่
- **ถ่านไฟฉาย:** ไม่ทิ้งรวมกับขยะทั่วไป ให้ส่งจุดรับขยะอันตราย
- **กระดาษสะอาด vs กระดาษเปื้อนอาหาร:** ต้องให้ผู้เล่นแยกความต่าง
- **กระป๋องสเปรย์/กล่องนม/ซองขนม/ภาชนะหลายชั้น:** อธิบายว่าสภาพวัสดุและระบบรับในพื้นที่มีผลต่อคำตอบ
- **ยาหมดอายุ:** ระบุจุดรับคืน/หน่วยงานที่เหมาะสม ไม่ชี้ว่าถังแดงใด ๆ ใช้ได้เสมอ

แสดงหมายเหตุ: **“สีถังและระบบรับขยะอาจแตกต่างตามพื้นที่ โปรดตรวจสอบแนวทางของท้องถิ่น”**. เนื้อหาเชิงการศึกษาต้องตรวจข้อเท็จจริงจากแหล่งที่เชื่อถือได้ก่อนถือว่าสมบูรณ์; เก็บ URL/ที่มาใน `docs/CONTENT_SOURCES.md` เมื่อค้นได้

**Pedagogy rule:** ห้าม modal ก่อนตอบเฉลยประเภท/ถังตรง ๆ ตามที่ภาพ mockup บางภาพอาจเขียนไว้ ให้เปิดเผยชื่อ/รูปร่างก่อนตอบ และเฉลยหลังตอบหรือในคู่มือเท่านั้น

## 6) ด่านทั้ง 4

### Stage 1 — สวนสาธารณะ
- โลเคชัน: ต้นไม้ 5–6 ต้น, ม้านั่ง, ถังขยะ, สนามหญ้า, ทางเดิน/ดอกไม้
- เรียนรู้: ขยะทั่วไป + อินทรีย์
- ขยะ: เปลือกกล้วย, ซองขนม, ใบไม้, แก้วน้ำใช้แล้ว (กำหนดวัสดุและสภาพให้ชัด)
- เป็นด่านสอนเล่น/เริ่มง่าย

### Stage 2 — โรงเรียน
- โลเคชัน: อาคารเรียน, สนาม, โรงอาหาร, ทางเดิน, ต้นไม้
- เรียนรู้: รีไซเคิล + ทั่วไป, เปรียบเทียบวัสดุที่คล้ายกัน
- ขยะ: กระดาษสะอาด, ขวดน้ำ, กระป๋อง, กล่องนม, กระดาษเปื้อนอาหาร
- ภารกิจตัวอย่าง: `เก็บขยะรีไซเคิล 5 ชิ้น`

### Stage 3 — ชายหาด
- โลเคชัน: น้ำทะเล, หาดทราย, ต้นมะพร้าว, เรือ/ประภาคารหรือท่าเรือตามภาพ
- เรียนรู้: ผลกระทบของขยะต่อทะเล/ธรรมชาติ
- ขยะ: ขวดพลาสติก, ถุงพลาสติก, กระป๋อง, เศษอาหาร
- Effect: เมื่อสะอาดขึ้น **น้ำใสและสัตว์กลับมา**

### Stage 4 — ชุมชน/เมือง
- โลเคชัน: บ้าน (เริ่มต้น 3–4 หลัง), ถนน, ร้านค้า, จุดรับขยะ
- เรียนรู้: ขยะอันตราย + ทุกประเภทผสมกัน
- ขยะ: ถ่านไฟฉาย, หลอดไฟ, ขวดน้ำ, ซองขนม, เศษผัก
- ยากที่สุด, มี item หลายรูปแบบ

**MVP ก่อนขยาย:** สร้าง 1 ดาว/1 ด่านพร้อมขยะ 8–10 ชิ้น/4 ประเภทและเล่นจบครบวงจรก่อน แล้วค่อยสร้าง 4 ด่านเต็มตามข้อมูลข้างต้น

## 7) ระบบคะแนน ความคืบหน้า และสรุปผล

- เก็บขยะเจอ: **+10 คะแนน**
- คัดแยกถูก: **+20 คะแนน**
- คัดแยกผิด: **−10 คะแนน** (กันคะแนนติดลบหากเหมาะสม)
- เก็บครบ: **โบนัส +50 คะแนน**
- ตอบถูกต่อเนื่อง: **Combo**; แสดงบนหน้าตอบถูก
- สรุป 3 ด้าน: **ความสะอาดดาว, ความถูกต้องในการแยกขยะ, เวลา**
- แสดง `คะแนนรวม`, `จำนวนเก็บ`, `ความแม่นยำ %`, `เวลาใช้`, `ดาว 1–3`
- สภาพดาวเปลี่ยนจริงแบบ before/after: ขยะลดลง, พื้น/ต้นไม้เขียวขึ้น, น้ำทะเลใส, สัตว์กลับมา
- เก็บ progress / จำนวนค้นพบ / ดาว / settings ไว้ใน local storage แบบ offline-first
- หลังตอบผิดมี feedback ที่เป็นมิตร อธิบายว่าทำไมผิด และให้ลองใหม่/ดูเหตุผล โดยไม่หักคะแนนซ้ำซ้อนแบบไม่มีที่สิ้นสุด

## 8) หน้าจอ / UI ที่ทำได้จริง

**บังคับให้ทำงานครบ:**
1. Main Menu: `Start`, `How to Play`, `Waste Guide`, `Settings`
2. Level Select: 4 ด่าน, progress, ดาว, Start Stage
3. Tutorial: ขยับโทรศัพท์/เล็ง/กดเก็บ/เลือกถัง
4. Gameplay: ดาวกลางจอ, crosshair, HUD จำนวนขยะ/เวลา/คะแนน, map, guide, inventory, pause, collect
5. Item Pickup Modal: ชื่อ/ภาพ item + collect/close (ข้อมูลเฉลยหลังทำ quiz)
6. Sorting: ขยะที่เก็บ + คำถาม + ตัวเลือกถัง 4 แบบ
7. Correct Feedback: ถูกต้อง + เหตุผล + +20 + combo + next
8. Incorrect Feedback: ยังไม่ถูก + เฉลย + เหตุผล + retry
9. Waste Guide: 4 category tabs, รายการ item, search, discovered count, tips
10. Level Results: before/after, 3 เกณฑ์, คะแนนรวม, ดาว, next/retry/back

**Settings:** sound/music, haptics, gyro sensitivity, invert-axis, recenter, reset/tutorial access

**UI visual style:** น่ารัก สดใส Friendly, Low-Poly แบบของเล่นจิ๋ว, สีฟ้า/เขียว/เหลือง/ส้ม, ปุ่มโค้งมน, label ภาษาไทย, icons ชัด, ตัวหนังสือไม่เล็ก, modal ไม่ทับ safe area, มี loading/paused/no-sensor/empty/error states

**Design rule:** UI ควรเป็น React Native component จริง ส่วน 3D เป็น render จริง; ปุ่มแยกประเภทใช้ทั้งสี + ข้อความ + สัญลักษณ์ ไม่ใช้สีอย่างเดียว

## 9) Stack / โมเดลไฟล์ / Architecture

**Core**: `React Native`, `Expo`, `TypeScript`, `expo-sensors`, `expo-haptics`, `expo-audio` (ถ้าเสียง), `three`, renderer 3D native ที่ **ตรวจสอบว่าเข้ากันได้กับ Expo SDK และเวอร์ชัน React Native จริง** ก่อนติดตั้ง. ตรวจเสถียรภาพ React Three Fiber Native integration; อย่าล็อก import path ตามคู่มือเก่าโดยไม่ตรวจเวอร์ชัน

**Asset format:** `.glb` เป็นทางเลือกสำหรับโมเดลที่ทำจาก Blender/ส่งออกโมเดลซับซ้อน; `.tsx/.ts` สำหรับ procedural Three.js low-poly model ที่เขียนโค้ดขึ้นมา; `.blend` เก็บ source เฉพาะชิ้นที่สร้างด้วย Blender. ถ้าจะโหลด GLB ให้ตั้ง Metro asset extensions, loader และทดสอบบน Expo/อุปกรณ์จริง

**เป้าหมาย performance:** ขอ 30 FPS ที่เล่นลื่นบนมือถือระดับกลางเป็นเกณฑ์เริ่มต้นและพยายาม 60 FPS เมื่อเครื่องรองรับ แต่ให้รายงานค่าทดสอบจริง; จำกัด polygon/texture/draw call, reuse geometry/material/instances, หลีกเลี่ยง dynamic shadows หนัก, อย่า setState ทั้งแอปทุก sensor sample

**โครงสร้างแนะนำ:**

```text
planet-cleaner/
├── app/                       # navigation/routes
├── src/
│   ├── components/ui/         # shared UI components
│   ├── screens/               # menu, levels, tutorial, gameplay, guide, results
│   ├── game/scene/            # planet, 3D low-poly models, props, lighting
│   ├── game/systems/          # gyro, targeting, game loop, scoring, restoration
│   ├── data/                  # categories, waste items, stage configs, tips
│   ├── types/                 # SHARED DATA CONTRACT
│   ├── hooks/                 # gyro controls / effects
│   ├── state/                 # game and progress state
│   ├── assets/                # models, textures, sounds, icons
│   └── utils/
├── docs/                      # GDD, image audit, README, QA, phase checklist
├── tests/
└── metro.config.js
```

ให้แยก Data / Game Logic / Renderer / UI ชัดเจน. ห้าม component ใน `src/data` import renderer 3D หรือ React Native.

## 10) แบ่งงาน **สองคน** แบบรวมกันง่ายและลดภาระเพื่อน

### ผู้พัฒนาหลัก (A / เจ้าของโปรเจกต์) — ประมาณ 70–80%

**รับผิดชอบ:**
- Setup Expo/TypeScript, routing, dependencies, theme/design system, integration, Git main branch และ **นิยาม interfaces ร่วม**
- 3D renderer, gyro controls/sensor calibration, planet/camera/target raycasting, 3D scene และ 3D models **เมื่อได้รับอนุญาตจากผู้ใช้**
- Core gameplay state machine, scoring, HUD, pick/sort workflow, environment restoration, save progress, performance, full device QA
- ขยายด่านเป็น 4 stage, ตัดสินใจโครงสร้างไฟล์และ merge conflicts, ตรวจงานเพื่อนก่อนรวม
- งาน critical path: integration และ release

### เพื่อนร่วมทีม (B / งานเบาและส่งมารวมได้) — ประมาณ 20–30%

**รับผิดชอบงานที่เป็นโมดูลแยก:**
1. **ข้อมูลความรู้ขยะ** — เขียน `src/data/categories.ts`, `waste-items.ts`, `tips.ts` โดยใช้ type contract ของ A พร้อมตรวจเหตุผล/จุดทิ้ง/ตัวอย่างในไทย
2. **คู่มือขยะ 2D UI** — `src/screens/WasteGuideScreen.tsx`, item cards, search, filter, discovered count (รับ state จาก props หรือ shared store contract)
3. **หน้าวิธีเล่น + Settings 2D** — `TutorialScreen.tsx`, `SettingsScreen.tsx` และองค์ประกอบที่ใช้ซ้ำ เช่น `TipCard.tsx`; ส่งงานพร้อมความสามารถปรับขนาด
4. **เนื้อหา/ชุดทดสอบ** — ทำ seed data 4 ด่าน, ตรวจคำผิด, unit tests สำหรับ dataset/quiz validation และ checklist การใช้งาน
5. **คู่มือและเอกสาร** — `docs/CONTENT_SOURCES.md`, `docs/TUTORIAL_COPY.md`, README ส่วนการแยกขยะ/วิธีเล่น

**เพื่อนไม่ต้องปั้น GLB/ไม่ต้องยุ่ง gyro/physics/render engine/แกน state machine** เพื่อให้ทำงานจบเร็วและ merge ง่าย; ถ้าจะมีส่วนร่วมด้านภาพ ให้ทำเฉพาะ icons/ภาพประกอบ UI 2D ที่เป็น asset แยกไฟล์

### สัญญาเชื่อมระบบ (Contract-first — A ต้องทำก่อนเริ่มขนาน)

A ต้องสร้างและ commit `src/types/game.ts` (หรือชื่อเทียบเท่า) ให้ B ยึด **หนึ่งชุดเดียวกัน** อย่างน้อยมี:

```ts
export type WasteCategoryId = 'general' | 'recyclable' | 'organic' | 'hazardous';

export interface WasteItem {
  id: string;
  nameTh: string;
  categoryId: WasteCategoryId;
  explanationTh: string;
  disposalTipTh: string;
  modelKey: string;  // A map to procedural geometry or GLB
  difficulty?: 1 | 2 | 3;
}

export interface WasteCategory {
  id: WasteCategoryId;
  nameTh: string;
  color: string;
  icon: string;
}

export interface StageConfig {
  id: 'park' | 'school' | 'beach' | 'community';
  titleTh: string;
  educationalGoalTh: string;
  wasteItemIds: string[];
  targetCount: number;
}
```

**B ต้องไม่แก้** `app/` routes หลัก, 3D renderer, `src/game/systems/`, Expo config หรือ shared contracts โดยพลการ ถ้าต้องเปลี่ยน ให้ส่งข้อเสนอให้ A ก่อน. A ต้องกำหนด props/callback ของหน้าจอ B เช่น `onBack`, `onStart`, `progress`, `onSettingsChange` เพื่อไม่ให้ B ผูก navigation เอง

### Git workflow และการรับมอบ

- `main` = stable, ทำงานบน branch แยก: `feat/core-gyro` (A), `feat/education-ui` (B); ถ้าแยกหลาย PR ให้ใช้ชื่อเฉพาะงานและ merge ทีละส่วน
- ส่งงานด้วย Pull Request (PR), ระบุไฟล์ที่เปลี่ยน, screenshot หน้าจอ, typecheck/test results; A เป็นผู้ review + merge
- ห้ามสองคนแก้ไฟล์เดียวกันพร้อมกัน ถ้าจำเป็นให้ A กำหนด owner ใหม่อย่างชัดเจน
- B ต้องสามารถทดสอบหน้าตัวเองด้วย mock props/seed data **โดยไม่ต้องรอ 3D เสร็จ**; เมื่อเชื่อมจริงให้ A ลบ mock ที่ไม่จำเป็น
- **Merge gates:** TypeScript interfaces ตรง, lint/typecheck ผ่าน, data IDs ไม่ซ้ำ, category mapping ตรง, ไม่มี import วงกลม, หน้าจอ B กดได้จริง
- ประชุมสั้น ๆ ที่ checkpoint: หลัง contract, หลัง core loop ผ่าน, ก่อนรวม 4 ด่าน, ก่อน final QA

### ลำดับทำงานขนานที่เร็วที่สุด

1. A ทำ Phase 0 + สร้าง shared type contract และ placeholder navigation ภายใน Phase 1
2. **ขณะ A ทำ gyro, camera, game state:** B ทำ data/content/Guide/Tutorial/Settings ตาม interface ที่ A commit
3. ก่อน **A ปั้นโมเดล** ให้ **ถามผู้ใช้ก่อน** ตาม §2; ระหว่างรอ A/B ทำงานอื่นที่ไม่ใช้โมเดลได้
4. A ทำ MVP gameplay แล้วเชื่อม data/UI ของ B ผ่าน imports/props
5. A เพิ่มด่านเต็ม และ B ช่วยตรวจคำอธิบายกับทดสอบ/เอกสาร

## 11) Phase 0–9 พร้อม Gate ตรวจรับ (ทำตามลำดับของ dependency)

### Phase 0 — Reference Audit + Technical Feasibility + Work Split
เปิดดูภาพอ้างอิงทั้ง 10, mapping, visual tokens, ตรวจ repo/toolchain, Expo/React Native/native 3D compatibility, เขียน `GDD.md`, `REFERENCE_AUDIT.md`, `TECH_DECISIONS.md`, `REQUIREMENTS_TRACEABILITY.md`, กำหนด contract และรายการส่งเพื่อน
**Gate:** รู้หน้าจอครบ, รู้ library ที่เลือกและเหตุผล, มี task/owner/checklist ตรวจสอบได้ **ยังไม่ปั้นโมเดล**

### Phase 1 — Expo Bootstrap + Shared Contracts
สร้าง project TypeScript, navigation, theme, font Thai, UI primitives, sensor/3D smoke test **ด้วย debug shape ชั่วคราว**, shared interfaces, lint/typecheck/test scripts; เปิด branch ส่งงาน B
**Gate:** แอปเปิดได้, smoke test 3D renderer, shared contract build ได้, B เริ่มทำงานคู่ขนานได้ **ยังไม่ปั้น model assets**

### Phase 2 — Gyroscope + Camera Math
ทำ Gyroscope/DeviceMotion controls, availability/permission, delta/smoothing, recenter, sensitivity/invert, lifecycle, diagnostic screen, manual fallback สำหรับ simulator (ติดป้าย)
**Gate:** เซนเซอร์มือถือจริงทำให้ค่าเปลี่ยนตามทิศที่ต้องการ, ไม่อ้างทดสอบจาก emulator เป็น real gyro; **ยังไม่ปั้นโมเดล**

### Phase 3 — Low-Poly Planet + Trash Geometry + Targeting
**MODEL APPROVAL GATE:** ต้องหยุดถามผู้ใช้ก่อนเริ่มสร้าง/แก้ model assets: ดาว ต้นไม้ บ้าน โรงเรียน ต้นขยะ 8–10 ชิ้น ถังขยะ/พร็อพ แล้ว **รอคำอนุญาต**. ระหว่างรอทำ raycast math / data / HUD ได้โดยไม่ปั้น
หลังอนุญาต: สร้าง 3D Low-Poly planet, scenery, meshes ด้วย procedural geometry ก่อน หากเหมาะสม, แยก GLB เท่าที่จำเป็น, crosshair + raycast + visual highlighting
**Gate:** ดาวหมุนตาม gyro, เห็นด้านหลัง, เล็ง target จริง, กดเก็บได้

### Phase 4 — Full Core Gameplay MVP
เชื่อม `scan → pickup → sort → correct/incorrect → scan → results`, data-driven 4 categories, 8–10 items, scoring, timer, combo, mission, restoration, pause
**Gate:** เล่นด่านทดลองจนจบ, state ไม่พัง, ตอบถูกผิดและสรุปผลตรง; ทำเฉพาะ logic/UI หากต้องเพิ่ม model ใหม่ให้เข้า §2 ก่อน

### Phase 5 — UI Matching Reference 10 Screens
ทำ Main Menu, Levels, Tutorial, Gameplay, Item Modal, Sort, Correct, Incorrect, Guide, Results และ Settings; ให้ B ส่ง Tutorial/Guide/Settings และ data ตาม contract; A รวมและตรวจภาพจริงเทียบ reference, responsive Thai UI
**MODEL CHECK:** UI ล้วนไม่ต้องรอ; ถ้าจะปรับโมเดลเพื่อให้เหมือนรูป ให้หยุดถามก่อนแก้โมเดลชุดใหม่
**Gate:** 10 states มี UI จริง, navigation/ปุ่มใช้งานจริง, `docs/UI_COMPARISON.md` ระบุความต่าง

### Phase 6 — Four Stages + Education
ข้อมูลฉากสวน/โรงเรียน/ชายหาด/ชุมชน, ลำดับการสอน, ภารกิจ, item explanations, guide, stage progression, before/after effect, fauna/water changes
**MODEL APPROVAL GATE:** ถ้าจะสร้างโมเดลฉาก/พร็อพ 3D **ต้องหยุดถามผู้ใช้ก่อนเริ่มชุดงานนี้** และรอ; data/logic/education ที่ไม่ปั้นทำต่อได้
**Gate:** 4 ด่านเล่นได้, จุดเด่นความรู้ครบ, คู่มือ/quiz สอดคล้องกัน

### Phase 7 — Audio, Haptics, Polish
เสียงเก็บ/ตอบถูก/ผิด/ผ่านด่าน, การสั่น, เอฟเฟกต์, transitions, UI states, settings, save progress; หากจำเป็นต้องเพิ่ม/แก้มาสคอต/สัตว์/โมเดล ให้ถามก่อน
**Gate:** ตั้งค่าปิดเสียง/สั่นได้, กลับจาก background ไม่พัง, ภาพลื่นบนเครื่องทดสอบ

### Phase 8 — QA + Performance
ทดสอบ unit scoring, category correctness, no duplicate IDs, progress, quiz; integration navigations, sensor available/unavailable, recenter, device orientation, pause/resume/retry, small screens; performance/memory; Android และ iOS เท่าที่ทดสอบได้จริง; report เรื่องที่ยังไม่ได้ทดสอบ
**Gate:** critical gameplay flows ผ่าน, typecheck/tests ผ่าน, blocker 0, มี `docs/TEST_REPORT.md` **หากแก้โมเดล 3D เป็นส่วนหนึ่งของการแก้บั๊กให้ถามก่อน**

### Phase 9 — Delivery + Documentation
`README.md` วิธีติดตั้ง/รัน Expo/ทดสอบ Gyroscope บนมือถือจริง/วิธีเพิ่ม item/ด่าน/asset, `docs/ASSET_LICENSES.md`, reference audit, architecture, traceability, tests, known limitations, screenshot ที่ capture จากแอปจริงเท่าที่ทำได้
**Gate:** เปิดแอปตาม README ได้, source พร้อมต่อยอด, รายงานงานที่ทำจริงครบ ไม่ใช่แค่ mockup

## 12) Functional Acceptance Checklist

- [ ] ภาพอ้างอิง 10 ภาพได้รับการเปิดดู/จับคู่ก่อนสร้าง UI
- [ ] Expo + TypeScript รันได้จริง, 3D native renderer ผ่านบนอุปกรณ์ที่ใช้ทดสอบ
- [ ] Gyroscope ทำงานจริงและ recenter ได้, gesture หมุนมุมมองได้อย่างปลอดภัย
- [ ] มี crosshair/targeting ขยะบนดาวจริง, เก็บแล้ว item หายจาก scene
- [ ] มีขยะ 4 ประเภทพร้อมตัวอย่าง/จุดทิ้ง/เหตุผลครบ
- [ ] มีระบบถามก่อนเฉลย + feedback ถูก/ผิด + combo + scoring (+10,+20,-10,+50)
- [ ] มี 4 ด่าน: สวน, โรงเรียน, ชายหาด, ชุมชน ตามบทเรียนที่กำหนด
- [ ] HUD, mission, item modal, inventory, pause, Waste Guide, Settings, Results, progression/save ทำงาน
- [ ] ดาวฟื้นฟูจริงเมื่อเก็บขยะ (before/after), แสดง accuracy/time/stars
- [ ] UI ภาษาไทยและสไตล์ใกล้ภาพ, ไม่มีภาพ screenshot แปะหลอกเป็น 3D/UI
- [ ] ไม่มีปุ่มหลอก, typecheck/test ผ่าน, ตรวจความถูกต้องข้อมูลขยะ
- [ ] รายการงาน A/B แบ่งชัดและ commit/merge ได้จริง
- [ ] **ทุกช่วงงานที่มีปั้นหรือแก้ 3D asset ได้ถามผู้ใช้และรับอนุญาตก่อน**

## 13) Reporting, Git, และคำสั่งเริ่มงาน

เมื่อจบ Phase/Checkpoint ให้รายงาน:

```text
PHASE: <เลขและชื่อ>
STATUS: PASS | PARTIAL | BLOCKED | MODEL_APPROVAL_PENDING
OWNER: A (main) | B (teammate) | INTEGRATION
FILES: <ไฟล์ที่แก้หรือสร้างจริง>
VERIFIED: <คำสั่งรันและผล / เครื่องที่ทดสอบจริง>
REFERENCE: <ภาพและรายการที่ได้เทียบ>
RISKS: <ข้อจำกัดและสิ่งที่ยังไม่ผ่าน>
NEXT: <งานต่อไปที่ไม่ละเมิด modeling gate>
```

**FINAL DIRECTIVE:** เริ่มทำ **Phase 0 ตอนนี้** อ่านภาพ 10 ภาพที่แนบ, เขียน requirements/GDD/traceability, ตรวจเวอร์ชัน Expo/R3F Native ให้เข้ากัน, ทำ Phase 1 setup + shared contracts และแจกงาน B อย่างเป็นอิสระ; ทำงานแบบเร็วแต่ตรวจจริง; **เมื่อจะปั้นโมเดล 3D ครั้งแรกหรือชุดใหม่ ให้หยุดถาม “จะให้เริ่มปั้นโมเดลเลยไหม?” และรอคำอนุญาตก่อน**. ไม่มีข้อกำหนดให้เปลี่ยนโมเดล AI; AI Agent ตัวปัจจุบันทำต่อได้หลังได้รับอนุญาต

## 14) เอกสารทางการที่ควรตรวจ ณ วันลงมือ

- Expo Sensors / Gyroscope: https://docs.expo.dev/versions/latest/sdk/gyroscope/
- Expo DeviceMotion: https://docs.expo.dev/versions/latest/sdk/devicemotion/
- Expo GL: https://docs.expo.dev/versions/latest/sdk/gl-view/
- Expo Asset: https://docs.expo.dev/versions/latest/sdk/asset/
- React Three Fiber: https://r3f.docs.pmnd.rs/getting-started/installation
- Three.js GLTFLoader: https://threejs.org/docs/#examples/en/loaders/GLTFLoader

