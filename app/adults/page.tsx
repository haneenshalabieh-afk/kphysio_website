import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type AdultsSearchParams = {
  q?: string;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;



export default async function AdultsPage({
  searchParams,
}: {
  searchParams: Promise<AdultsSearchParams>;
}) {
  const sp = await searchParams;
  const query = (sp.q ?? "").trim();
  const adultsDept = await prisma.department.findUnique({
    where: { name: "Adults" },
    select: { id: true, name: true },
  });

  if (!adultsDept) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert">
            <b>قسم الكبار</b>
            <div>مش لاقي Department باسم Adults. اعملي Insert للـ Department الأول.</div>
          </div>
        </div>
      </div>
    );
  }
     const adultsDeptId = adultsDept?.id;





  async function addAdultPatient(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const totalSessions = Number(formData.get("totalSessions") ?? 0);
    const sessionPrice = Number(formData.get("sessionPrice") ?? 0);

    if (!phone) throw new Error("رقم التليفون مطلوب");
    if (Number.isNaN(totalSessions) || totalSessions < 0) throw new Error("ادخل عدد الجلسات ");
    if (Number.isNaN(sessionPrice) || sessionPrice < 0) throw new Error("ادخل سعر الجلسة ");
    
    
    /**const adults = await prisma.department.findUnique({
      where: { name: "Adults" },
      select: { id: true },
    }); **/


    await prisma.patient.create({
      data: {
        name: name || "بدون اسم",
        phone,
        totalSessions,
        sessionPrice,
        departmentId: adultsDeptId,
      },
    });

    revalidatePath("/adults");
  }

  // Patients list + count of sessions taken
  const patients = await prisma.patient.findMany({
    where: {
      departmentId: adultsDept.id,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { id: "desc" },
    include: {
      _count: { select: { sessions: true } },
    },
  });

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="topbar">
          <div className="topbar__left">
            <div className="brand">


                <h1 className="brand__logo">
                    <span style={{color: "#ff0099ff"}}>K</span>
                    .Physio</h1>
           



              <div className="brand__sub">نظام إدارة المرضى والجلسات</div>
            </div>
          </div>

          <div className="topbar__right">
            <Link className="btn btnGhost" href="/">
              الرئيسية
            </Link>
            <span className="badge">قسم الكبار</span>
          </div>
        </div>

        {/* Search */}
        <div className="card">
          <div className="card__title">بحث</div>


<div className="row">
  {/* Search form */}

  
  <form action="/adults" method="get" className="toolbar" style={{ flex: 1 }}>
    <input
      className="input"
      name="q"
      defaultValue={query}

      placeholder="ابحث بالاسم أو رقم التليفون"
    />
    <div>  <button className="btn btnPrimary" type="submit">
      بحث
    </button> </div>
  </form>  
</div>
        </div>

        

        {/* Add patient */}
        <div className="card">
          <div className="card__title">إضافة مريض كبار</div>

          <form action={addAdultPatient} className="grid">
            <div>
              <label className="label">رقم التليفون (مطلوب)</label>
              <input className="input" name="phone" placeholder="مثال: 4455667788" />
            </div>

            <div>
              <label className="label">اسم المريض (اختياري)</label>
              <input className="input" name="name" placeholder="مثال: أحمد" />
            </div>

            <div>
              <label className="label">إجمالي عدد الجلسات</label>
              <input className="input" name="totalSessions" type="number" defaultValue={0} />
            </div>

            <div>
              <label className="label">سعر الجلسة</label>
              <input className="input" name="sessionPrice" type="number" defaultValue={0} />
            </div>

            <div className="grid__full">
              <button className="btn btnPrimary" type="submit">
                حفظ المريض
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="card">
          <div className="card__title">المرضى</div>

          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>المريض</th>
                  <th>التليفون</th>
                  <th>المأخوذة</th>
                  <th>المتبقي</th>
                  <th>سعر الجلسة</th>
                  <th>إجمالي الباكدج</th>
                  <th>جلسات</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => {
                  const taken = p._count.sessions;
                  const remaining = Math.max((p.totalSessions ?? 0) - taken, 0);
                  const totalPackage = (p.sessionPrice ?? 0) * (p.totalSessions ?? 0);

                  return (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.phone}</td>
                      <td>{taken}</td>
                      <td className={remaining === 0 ? "dangerText" : ""}>{remaining}</td>
                      <td>{p.sessionPrice ?? 0}</td>
                      <td>{totalPackage}</td>
                      <td>
                        <Link
                          className="btn btnSuccess"  href={`/adults/sessions?patientId=${p.id}`} >
                          فتح الجلسات
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {patients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="muted">
                      مفيش نتائج.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="footerNote muted">
          لو البحث مش بيشتغل: تأكدي إنك بتكتبي في مربع البحث وبعدين “بحث”، و“مسح” بيرجع /adults من غير q.
        </div>
      </div>
    </div>
  );
}