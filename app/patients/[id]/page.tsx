// app/patients/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import styles from "./patient.module.css";
import { saveDoctorProfile } from "./actions";

function calcAge(birth?: Date | null) {
  if (!birth) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function fmtDate(d?: Date | null) {
  if (!d) return "-";
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return "-";
  }
}

export default async function PatientPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      profile: true,
      files: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!patient) return <div>المريض مش موجود</div>;

  const age = calcAge(patient.birthDate);

  // Server Action wrapper (بيخلي الفورم ينادي action ومعاه id)
  async function action(formData: FormData) {
    "use server";
    await saveDoctorProfile(id, formData);
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>سجل المريض</h1>

      {/* بيانات التسجيل */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>بيانات المريض</h2>
        <div className={styles.grid}>
          <div><b>الاسم:</b> {patient.name ?? "بدون اسم"}</div>
          <div><b>الموبايل:</b> {patient.phone}</div>
          <div><b>تاريخ الميلاد:</b> {fmtDate(patient.birthDate)}</div>
          <div><b>العمر:</b> {age ?? "-"}</div>
          <div><b>اسم الأب:</b> {patient.fatherName ?? "-"}</div>
          <div><b>اسم الأم:</b> {patient.motherName ?? "-"}</div>
          <div className={styles.full}><b>العنوان:</b> {patient.address ?? "-"}</div>
        </div>
      </section>

      {/* جزء الدكتور */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>معلومات الطبيب</h2>

        <form action={action} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.full}>
              <label className={styles.label}>التشخيص</label>
              <textarea
                name="diagnosis"
                className={styles.textarea}
                defaultValue={patient.profile?.diagnosis ?? ""}
                placeholder="اكتب التشخيص هنا..."
              />
            </div>

            <div className={styles.full}>
              <label className={styles.label}>الأدوية (أسماء الأدوية)</label>
              <textarea
                name="medications"
                className={styles.textarea}
                defaultValue={patient.profile?.medications ?? ""}
                placeholder="مثال: Panadol 500mg - مرة يوميًا..."
              />
            </div>

            <div className={styles.full}>
              <label className={styles.label}>حساسية من أدوية</label>
              <textarea
                name="allergies"
                className={styles.textarea}
                defaultValue={patient.profile?.allergies ?? ""}
                placeholder="مثال: حساسية من البنسلين..."
              />
            </div>

            <div className={styles.full}>
              <label className={styles.label}>ملاحظات</label>
              <textarea
                name="notes"
                className={styles.textarea}
                defaultValue={patient.profile?.notes ?? ""}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>

            <div>
              <label className={styles.label}>عدد جلسات علاج طبيعي</label>
              <input
                type="number"
                min={0}
                name="sessionsPhysio"
                className={styles.input}
                defaultValue={patient.profile?.sessionsPhysio ?? 0}
              />
            </div>

            <div>
              <label className={styles.label}>عدد جلسات نفسية</label>
              <input
                type="number"min={0}
                name="sessionsPsych"
                className={styles.input}
                defaultValue={patient.profile?.sessionsPsych ?? 0}
              />
            </div>

            <div>
              <label className={styles.label}>عدد جلسات تخاطب</label>
              <input
                type="number"
                min={0}
                name="sessionsSpeech"
                className={styles.input}
                defaultValue={patient.profile?.sessionsSpeech ?? 0}
              />
            </div>

            <div>
              <label className={styles.label}>عدد جلسات تنمية مهارات</label>
              <input
                type="number"
                min={0}
                name="sessionsSkills"
                className={styles.input}
                defaultValue={patient.profile?.sessionsSkills ?? 0}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={styles.button} type="submit">
              حفظ معلومات الطبيب
            </button>
          </div>
        </form>
      </section>

      {/* ملفات الأشعات والتقارير */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>الملفات</h2>

        <div className={styles.filesGrid}>
          <div>
            <h3>أشعات</h3>
            <ul>
              {patient.files.filter((f) => f.type === "XRAY").map((f) => (
                <li key={f.id}>
                  <a href={f.url} target="_blank" rel="noreferrer">
                    {f.title ?? "اشعة"}
                  </a>
                </li>
              ))}
            </ul>
            {/* Upload XRAY */}
          </div>

          <div>
            <h3>تقارير طبية</h3>
            <ul>
              {patient.files.filter((f) => f.type === "REPORT").map((f) => (
                <li key={f.id}>
                  <a href={f.url} target="_blank" rel="noreferrer">
                    {f.title ?? "تقرير"}
                  </a>
                </li>
              ))}
            </ul>
            {/* Upload REPORT */}
          </div>
        </div>
      </section>
    </div>
  );
}