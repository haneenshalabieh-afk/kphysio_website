import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./list.module.css";

export const dynamic = "force-dynamic"; // عشان ما تتكاشّش

export default async function PatientsPage() {
  const patients = await prisma.patient.findMany({
    select: { id: true, name: true, phone: true },
    orderBy: { name: "asc" }, // ترتيب أبجدي
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>قائمة المرضى</h1>

        {patients.length === 0 ? (
          <p className={styles.empty}>مفيش مرضى مسجلين لسه.</p>
        ) : (
          <ul className={styles.list}>
            {patients.map((p) => (
              <li key={p.id} className={styles.row}>
                <div className={styles.info}>
                  <div className={styles.name}>{p.name || "بدون اسم"}</div>
                  {/* اختياري: رقم تليفون صغير تحت */}
                  {p.phone ? <div className={styles.sub}>{p.phone}</div> : null}
                </div>
                <div className={styles.action} />
                <button className={styles.btn}>اطّلع على سجل المريض</button>

              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}