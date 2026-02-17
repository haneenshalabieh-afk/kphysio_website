"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createPatient(formData: FormData) {
  const name = formData.get("name")?.toString() || null;

  const birthDateRaw = formData.get("birthDate")?.toString();
  const birthDate = birthDateRaw ? new Date(birthDateRaw) : null;
  
  const phoneRaw = formData.get("phone");
const phone = phoneRaw ? phoneRaw.toString().trim() : null;
if (!phone) redirect("/patients/new?error=phone_required");
  const phone2 = formData.get("phone2")?.toString() || null;
  const whatsapp = formData.get("whatsapp")?.toString() || null;

  const address = formData.get("address")?.toString() || null;

  // ✅ دي كانت ناقصة عندك
  const referralForm = formData.get("referralForm")?.toString() || null;

  const fatherName = formData.get("fatherName")?.toString() || null;
  const motherName = formData.get("motherName")?.toString() || null;

  const departmentId = 1;
  console.log("FORM DATA ENTRIES:", Array.from(formData.entries()));
   console.log("PHONE RAW:", formData.get("phone"));

  await prisma.patient.create({
    data: {
      name,
      birthDate,
      phone,
      phone2,
      whatsapp,
      address,
      referralForm, // ✅ دلوقتي المتغير اتعرّف
      fatherName,
      motherName,
      departmentId,
      totalSessions: 0,
      sessionPrice: 0,
    },
  });

  redirect("/patients");
}