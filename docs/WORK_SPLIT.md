> อัปเดตตามคำสั่งล่าสุด: ผู้พัฒนาหลักรับผิดชอบ UI ทุกหน้า ภาพ 2D และเสียง; เพื่อนร่วมทีมตรวจและส่งเนื้อหาความรู้ที่ถูกต้องภายหลัง ส่วนโมเดล 3D ยังอยู่นอกขอบเขตงานปัจจุบัน

# แบ่งงาน

A: โครง Expo, shared contracts, navigation, renderer, sensor, targeting, state, integration และ QA บนมือถือ รวมถึงโมเดลหลังได้รับอนุญาต

B: `src/data/categories.ts`, `waste-items.ts`, `tips.ts`, หน้าคู่มือ/วิธีเล่น/ตั้งค่า และเนื้อหา/ทดสอบ โดยใช้ contract ร่วมและ props ไม่ผูก navigation เอง ห้ามแก้ renderer, sensor, routes, Expo config หรือ contract โดยไม่ประสาน A

ก่อนเริ่มขนาน A ต้องส่ง contract ที่ตรวจแล้วและกำหนด props; B ส่งรายการไฟล์ ภาพหน้าจอ และผลตรวจ typecheck/test; A ตรวจ ID, หมวด, imports และปุ่มก่อน merge งาน ผ่าน PR แยกใน repository เดียว ไม่แก้ไฟล์เดียวกันพร้อมกัน
