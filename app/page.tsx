import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

async function addAdultPatient() {
  "use server"

  const adultsDept = await prisma.department.findFirst({
    where: { name: "Adults" },
  })

  if (!adultsDept) return

  await prisma.patient.create({
    data: {
      name: "مريض كبار 1",
      phone: "01000000001",
      totalSessions: 10,
      sessionPrice: 200,
      departmentId: adultsDept.id,
    },
  })
}

export default async function Page() {
  const patients = await prisma.patient.findMany({
    include: { department: true },
    orderBy: { id: "desc" },
  })

  return (
    <div style={{ padding: 20 }}>
      <h1>قسم الكبار</h1>

      <form action={addAdultPatient}>
        <button type="submit">إضافة مريض كبار تجريبي</button>
      </form>

      <pre>{JSON.stringify(patients, null, 2)}</pre>
    </div>
  )
}