import { createPatient } from "../actions";
import BirthDateField from "./BirthDateField";
import styles from "./new.module.css";
import PhysioGallery from "./PysioGallery";
 

export default function NewPatientPage() {
  return (
    <div className={styles.wrap}>
        <div className={styles.card}>

            <div className={styles.header}>
                <div className={styles.logo}>
                    <span style={{color: "#ff0099ff"}}>K</span>
                    .Physio
                </div>
            </div>

 {/*  اسم المريض كامل*/}
 <form action={createPatient}> 
     <div className={styles.grid}>


 <div className={styles.field}>
 <label className={styles.label}> اسم المريض كامل </label>  
 <input className={styles.input} />
 </div>
 

       {/* تاريخ الميلاد */}
 <div className={styles.field}>
 <label className={styles.label}> تاريخ الميلاد </label>  
 <BirthDateField name="birthDate" />
 </div>



 {/*  اسم الأب */}
 <div className={styles.field}>
 <label className={styles.label}> اسم الأب </label>  
 <input className={styles.input} />
 </div>


 {/*    اسم الأم */}
 <div className={styles.field}>
 <label className={styles.label}> اسم الأم </label>  
 <input className={styles.input} />
 </div>


 {/*  رقم الهاتف الأساسي*/}
 <div className={styles.field}>
 <label className={styles.label}> رقم الهاتف الأساسي </label>  
 <input className={styles.input} />
 </div>


 {/*  رقم الهاتف البديل*/}
 <div className={styles.field}>
 <label className={styles.label}> رقم الهاتف البديل </label>  
 <input className={styles.input} />
 </div>


 {/*  رقم الهاتف الواتس آب*/}
 <div className={styles.field}>
 <label className={styles.label}> رقم الهاتف الواتس آب </label>  
 <input className={styles.input} />
 </div>


 {/*   جهة التحويل*/}
 <div className={styles.field}>
 <label className={styles.label}> جهة التحويل </label>  
 <input className={styles.input} />
 </div>
  

   {/*  عنوان المنزل   */}
 <div className={`${styles.field} ${styles.full}`}>
 <label className={styles.label}> عنوان المنزل </label>  
 <input className={styles.input} />
 </div>



    <div className={styles.action}>
    <button className={styles.submitBtn} type="submit">
      حفظ المريض
    </button>
        </div>
        </div>
    </form>

<PhysioGallery
  images={[
    { src: "/physio/1.JPG", alt: "Physio 1" },
    { src: "/physio/2.JPG", alt: "Physio 2" },
    { src: "/physio/3.JPG", alt: "Physio 3" },
    { src: "/physio/4.JPG", alt: "Physio 4" },
    { src: "/physio/5.JPG", alt: "Physio 5" },
    { src: "/physio/6.JPG", alt: "Physio 6" },
  ]}
  intervalMs={3500}
/>


</div>
    </div>
  );
}

  