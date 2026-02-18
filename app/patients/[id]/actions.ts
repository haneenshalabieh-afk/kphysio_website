"use server";

import { prisma } from "@/lib/prisma";

function toInt(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number(v ?? fallback);
  return Number.isFinite(n) ? n : fallback;
}

export async function saveDoctorProfile(patientId: number, formData: FormData) {
  const diagnosis = formData.get("diagnosis")?.toString().trim() || null;
  const medications = formData.get("medications")?.toString().trim() || null;
  const allergies = formData.get("allergies")?.toString().trim() || null;
  const notes = formData.get("notes")?.toString().trim() || null;

  const sessionsPhysio = toInt(formData.get("sessionsPhysio"), 0);
  const sessionsPsych = toInt(formData.get("sessionsPsych"), 0);
  const sessionsSpeech = toInt(formData.get("sessionsSpeech"), 0);
  const sessionsSkills = toInt(formData.get("sessionsSkills"), 0);

  await prisma.patientProfile.upsert({
    where: { patientId },
    create: {
      patientId,
      diagnosis,
      medications,
      allergies,
      notes,
      sessionsPhysio,
      sessionsPsych,
      sessionsSpeech,
      sessionsSkills,
    },
    update: {
      diagnosis,
      medications,
      allergies,
      notes,
      sessionsPhysio,
      sessionsPsych,
      sessionsSpeech,
      sessionsSkills,
    },
  });
}