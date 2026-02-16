"use client";

export default function DeletePatientButton() {
  return (
    <button
      className="btn btnDanger"
      type="submit"
      style={{ width: "100%" }}
      onClick={(e) => {
        if (!confirm("هل أنت متأكد من حذف المريض نهائيًا؟")) {
          e.preventDefault();
        }
      }}
    >
      حذف المريض نهائيًا
    </button>
  );
}