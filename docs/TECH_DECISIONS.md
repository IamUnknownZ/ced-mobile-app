# การตัดสินใจด้านเทคนิค

ตรวจเอกสารทางการวันที่ 30 ตุลาคม 2026: Expo GLView ให้ OpenGL ES context และอยู่ใน Expo Go; React Three Fiber รองรับ React Native ผ่าน `@react-three/fiber/native` และมี dependencies เฉพาะ Expo (https://r3f.docs.pmnd.rs/getting-started/installation, https://docs.expo.dev/versions/latest/sdk/gl-view/). Gyroscope ให้ความเร็วเชิงมุมไม่ใช่มุมสัมบูรณ์ ต้องจัดการ drift และ lifecycle (https://docs.expo.dev/versions/latest/sdk/gyroscope/).

เลือก Expo/React Native/TypeScript และตรวจชุดเวอร์ชันจาก template กับ `expo install --check` ก่อนยืนยัน ส่วน 3D เลือกทดลอง R3F Native + Expo GL; ความเข้ากันได้ของ native renderer ยังไม่ถือว่าผ่านจนทดสอบบนอุปกรณ์จริง ไม่ผูกมัด GLB; procedural geometry หรือ GLB เป็นทางเลือกหลังอนุญาต

เอกสาร Expo ระบุช่วงเปลี่ยน SDK 58 ว่า template เริ่มต้นและ Expo Go อาจต่างรุ่น (https://docs.expo.dev/more/create-expo/); รุ่นที่สร้างและตัว Expo Go/device build ต้องตรงกัน อาจต้องใช้ development build บน iOS ตรวจจริงก่อนสรุป ความเร็ว 30 FPS เป็นเป้าหมาย ไม่ใช่ผลทดสอบ

โครงที่ติดตั้งจริง: Expo 58.0.21, React 19.3.0, React Native 0.88.1, expo-gl 58.0.3, expo-sensors 58.0.4, R3F 9.8.2, Three 0.187.0. `expo install --check` ผ่าน แต่ไม่ได้พิสูจน์ว่า R3F render บน native ได้; Android export ผ่านสำหรับหน้าพัฒนาปัจจุบันซึ่งยังไม่ได้ใช้ renderer. `npm audit --omit=dev` พบ 8 รายการ (high 3, low 5) ใน dependency tree โดยคำแนะนำอัตโนมัติจะเปลี่ยน Expo ข้ามรุ่น จึงยังไม่ได้ใช้และต้องตรวจแก้ก่อนส่งมอบ


การปรับ 30 ตุลาคม 2026: เปลี่ยนจาก SDK 58 เป็น SDK 57 ให้ตรง Expo Go ของผู้ใช้; ชุดก่อนหน้าอยู่ใน Git commit 03f0e82 สำหรับย้อนกลับ การทดสอบบนเครื่องจริงยังรอดำเนินการ

หลังทดสอบ Expo Go บนอุปกรณ์พบว่า Three 0.187 ใช้ FinalizationRegistry ซึ่ง runtime เครื่องทดสอบไม่มี จึงตรึง Three และ types ที่ 0.180.0 ซึ่งตรวจแล้วว่า renderer ไม่เรียก FinalizationRegistry/WeakRef; ยังต้องยืนยันผลบนเครื่องจริงหลังเปลี่ยนรุ่น
