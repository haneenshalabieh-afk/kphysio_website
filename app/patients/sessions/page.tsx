import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import DeletePatientButton from "@/app/components/DeletePatientButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SessionsSearchParams = {
  patientId?: string;
};

export default async function AdultSessionsPage({
  searchParams,
}: {
  searchParams: Promise<SessionsSearchParams>;
}) {
  const sp = await searchParams;

  const patientIdRaw = (sp.patientId ?? "").trim();
  const patientId = Number(patientIdRaw);

  if (!patientIdRaw || Number.isNaN(patientId)) {
    return (
      <div className="page">
        <div className="container">
          <Link className="btn btnGhost" href="/adults">
            ← رجوع لقسم الكبار
          </Link>

          <div className="alert danger">
            <b>لازم تفتحي الصفحة بـ patientId</b>
            <div>مثال: /adults/sessions?patientId=123</div>
          </div>
        </div>
      </div>
    );
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      department: true,
      sessions: { orderBy: { createdAt: "desc" } },
      _count: { select: { sessions: true } },
    },
  });

  if (!patient) {
    return (
      <div className="page">
        <div className="container">
          <Link className="btn btnGhost" href="/adults">
            ← رجوع لقسم الكبار
          </Link>
          <div className="alert danger">المريض غير موجود.</div>
        </div>
      </div>
    );
  }

  const taken = patient._count.sessions;
  const total = patient.totalSessions ?? 0;
  const remaining = Math.max(total - taken, 0);
  const price = patient.sessionPrice ?? 0;
  const totalPackage = total * price;
  const paidCount = patient.sessions.filter((s) => s.isPaid).length;
  const paidSoFar = paidCount * price;
  const unpaidCount = taken - paidCount;
  const unpaidSoFar = unpaidCount * price;

  async function addSession(formData: FormData) {
    "use server";
    const isPaid =  String(formData.get("isPaid") ?? "false") == "true"
    const paymentMethodRaw = String(formData.get("paymentMethod") ?? "").toUpperCase();
    const paymentMethod = 
    isPaid && (paymentMethodRaw == "CASH" || paymentMethodRaw == "INSTAPAY")
    ? (paymentMethodRaw as any)
    : null ;

    if (isPaid && !paymentMethod) throw new Error("اختر طريقة الدفع");
    const doctor = String(formData.get("doctor") ?? "").trim();
    if (!doctor) throw new Error("اسم الدكتور مطلوب");

    // Re-check remaining on server
    const p = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { _count: { select: { sessions: true } } },
    });
    if (!p) throw new Error("المريض غير موجود");

    const totalSessions = p.totalSessions ?? 0;
    const takenNow = p._count.sessions;
    const remainingNow = Math.max(totalSessions - takenNow, 0);
    
    if (remainingNow <= 0) throw new Error("  تم إكمال عدد الجلسات ");
    await prisma.session.create({
      data: {
        doctor,
        patientId,
        isPaid,
        paymentMethod, 
        paidAt: isPaid ? new Date () : null,
      },
    });

    revalidatePath(`/adults/sessions?patientId=${patientId}`);
    revalidatePath(`/adults`);
  }

  async function deleteSession(formData: FormData) {
    "use server";
    const sessionId = Number(formData.get("sessionId"));
    if (Number.isNaN(sessionId)) return;

    await prisma.session.delete({ where: { id: sessionId } });

    revalidatePath(`/adults/sessions?patientId=${patientId}`);
    revalidatePath(`/adults`);
  }


async function deletePatient() {
  "use server";

  await prisma.session.deleteMany({
    where: { patientId },
  });

  await prisma.patient.delete({
    where: { id: patientId },
  });

  revalidatePath("/adults");
}




  async function updatePatientPackage(formData: FormData) {
    "use server";

    const newTotal = Number(formData.get("totalSessions") ?? 0);
    const newPrice = Number(formData.get("sessionPrice") ?? 0);

    if (Number.isNaN(newTotal) || newTotal < 0) throw new Error("إجمالي عدد الجلسات");
    if (Number.isNaN(newPrice) || newPrice < 0) throw new Error("سعر الجلسة الواحدة");

    await prisma.patient.update({
      where: { id: patientId },
      data: { totalSessions: newTotal, sessionPrice: newPrice },
    });

    revalidatePath(`/adults/sessions?patientId=${patientId}`);
    revalidatePath(`/adults`);
  }

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <div className="topbar__left">

<div className="topbar__left">
  <Link className="btn btnGhost" href="/adults">
    ← رجوع لقسم الكبار
  </Link>

  
</div>


          </div>
          <div className="topbar__right">
            <span className="badge">قسم الكبار — الجلسات</span>
          </div>
        </div>




        <div className="card">
          <div className="card__title">بيانات المريض</div>
          <div className="summary">

            <div><b>المريض:</b> {patient.name} — <b>تليفون:</b> {patient.phone}</div>
            <div><b>القسم:</b> {patient.department?.name ?? "—"}</div>
            <div>
              <b>الجلسات:</b> المأخوذة {taken} / الإجمالي {total} — المتبقي{" "}
              <span className={remaining === 0 ? "dangerText" : ""}>{remaining}</span>
            </div>
            <div>
              <b>سعر الجلسة:</b> {price} — <b>إجمالي الباكدج:</b> {totalPackage}  — <b>غير مدفوع:</b> {unpaidSoFar} — <b>إجمالي المدفوع:</b>{" "}
              {paidSoFar}
            </div>
          </div>
        </div>

        <div className="rowCards">
          {/* Update package */}
          <div className="card">

            <div className="card__title">تعديل باكدج المريض</div>


            <form action={updatePatientPackage} className="grid">

              <div>

                <label className="label">إجمالي عدد الجلسات</label>

                <input className="input" name="totalSessions" type="number" defaultValue={total} />

              </div>


              <div>
                <label className="label">سعر الجلسة</label>
                <input className="input" name="sessionPrice" type="number" defaultValue={price} />
              </div>


              <div className="grid__full">
                <button className="btn btnPrimary" type="submit">
                  حفظ التعديل
                </button>
                </div>
      </form>

                <div style={{ marginTop: 20 }}>
                    <form action={deletePatient}>
                    <DeletePatientButton />

    </form>
</div>

              
          
          </div>

         {/* Add session */}
<div className="card">
  <div className="card__title">تسجيل جلسة</div>

  {remaining <= 0 ? (
    <div className="alert danger">المريض انهى عدد جلساته</div>
  ) : (
    <form action={addSession} className="grid">
      <div className="grid__full">
        <label className="label">اسم الدكتور</label>
        <input className="input" name="doctor" placeholder="مثال: د/ أحمد" />
      </div>

      <div className="grid__full">
        <label className="label">حالة الدفع</label>

        <div className="row" style={{ gap: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="radio" name="isPaid" value="true" />
            تم الدفع
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="radio" name="isPaid" value="false" defaultChecked />
            لم يتم الدفع
          </label>
        </div>
      </div>

      <div className="grid__full">
        <label className="label">طريقة الدفع (لو تم الدفع)</label>
        <select className="input" name="paymentMethod" defaultValue="">
          <option value="">— اختاري —</option>
          <option value="CASH">كاش</option>
          <option value="INSTAPAY">إنستا باي</option>
        </select>
        <div className="muted">لو اخترتي "لم يتم الدفع" اختيار طريقة الدفع هيتجاهل.</div>
      </div>

      <div className="grid__full">
        <button className="btn btnSuccess" type="submit">
          حفظ الجلسة
        </button>
      </div>
    </form>
  )}
</div>
        </div>

        {/* Sessions table */}
        <div className="card">
          <div className="card__title">التاريخ والوقت + الدكتور</div>

          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>التاريخ والوقت</th>
                  <th>الدكتور</th>
                  <th>حالة الجلسة</th>
                  <th>إجراء</th>
                  
                </tr>
              </thead>
              <tbody>
                {patient.sessions.map((s) => (
                  <tr key={s.id}>
                    <td>{new Date(s.createdAt).toLocaleString("ar-EG")}</td>
                    <td>{s.doctor}</td>


                <td>
  {s.isPaid ? (
    <>
      مدفوعة{" "}
      {s.paymentMethod === "CASH" && "(كاش)"}
      {s.paymentMethod === "INSTAPAY" && "(إنستا باي)"}
    </>
  ) : (
    "غير مدفوعة"
  )}
</td>



                    <td>
                      <form action={deleteSession}>
                        <input type="hidden" name="sessionId" value={s.id} />
                        <button className="btn btnDanger" type="submit">
                          حذف الجلسة
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}

                {patient.sessions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="muted">
                      لا يوجد جلسات مسجلة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}