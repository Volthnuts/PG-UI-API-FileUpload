import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ExcelServiceApi } from '../../../core/services/excel-service-api';
import { SharedModule } from '../../../shared/shared.modules';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-excel-initial',
  imports: [
    SharedModule
  ],
  templateUrl: './excel-initial.html',
  styleUrl: './excel-initial.css',
})
export class ExcelInitial {
  @ViewChild('fileInput') fileInputVariable!: ElementRef; // อ้างอิงเพื่อล้างค่าไฟล์ค้าง
  excelForm: FormGroup;
  selectedFile: File | null = null;
  submitted = false; // สำหรับคุม Error Message หลังกด Save
  errorMsg: string[] = []; // เก็บข้อความ Error จาก API มาแสดงในหน้า Result

  constructor(
    private fb: FormBuilder,
    private excelApi: ExcelServiceApi,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.excelForm = this.fb.group({
      flightNo: ['', [
        Validators.required, 
        Validators.pattern('^[A-Z0-9]{2}[0-9]{2,4}$')
      ]],
      fileName: ['', [Validators.required]]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const maxSize = 1024 * 1024; // 1mb

    if (file) {
      // เช็คประเภทไฟล์ก่อน
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        alert('Please select a valid .xlsx file');
        event.target.value = ''; // ล้างค่าใน input
        return;
      }

      // เช็คขนาดไฟล์
      if (file.size > maxSize) {
        alert('File size must be less than 1 MB');
        event.target.value = ''; // ล้างค่าใน input เพื่อให้เลือกใหม่ได้
        this.selectedFile = null;
        this.excelForm.patchValue({ fileName: '' });
        return;
      }

      // ถ้าผ่านเงื่อนไขทั้งหมด
      this.selectedFile = file;
      this.excelForm.patchValue({ fileName: file.name });
      this.excelForm.get('fileName')?.markAsDirty();
    }
  }

  onSave() {
    this.submitted = true; // สั่งให้ Error สีแดงโชว์ขึ้นมา
    this.errorMsg = []; // ล้างค่า Error จาก backend สีแดงออกก่อนส่งใหม่

    if (this.excelForm.valid && this.selectedFile) {
      this.excelApi.uploadExcel(this.selectedFile).subscribe({
        next: (res) => {
          this.excelApi.setResultData(res, this.selectedFile!.name); // ส่งข้อมูลผลลัพธ์ไปเก็บใน service เพื่อให้หน้า result ดึงไปใช้ได้
          this.router.navigate(['/excel/result']);
        },
        error: (err) => {
          const errorMsg = err.error || err.message;
          if (typeof errorMsg === 'string') {
            this.errorMsg = errorMsg.split('\n').filter(msg => msg.trim() !== '');
          }
          
          // บังคับให้ Angular ตรวจเช็คสถานะ UI ทันทีหลังได้รับ Error
          this.cdr.detectChanges(); 
        }
      });
    } else {
      // ถ้าข้อมูลไม่ครบ markAllAsTouched จะช่วยกระตุ้น Validation ทุกช่อง
      this.excelForm.markAllAsTouched();
      this.cdr.detectChanges();   
    }
  }

  onCancel() {
    this.excelForm.reset();
    this.selectedFile = null;
    this.submitted = false;
    this.errorMsg = []; // ล้างค่า Error สีแดงออก

    if (this.fileInputVariable) {
      this.fileInputVariable.nativeElement.value = '';
    }
  }
  // ฟังก์ชันช่วยเช็คสถานะการ Enable ปุ่ม
  get canAction(): boolean {
    // Enable ถ้ามีการพิมพ์ flightNo หรือ มีการเลือกไฟล์เข้ามาแล้ว
    return this.excelForm.dirty || !!this.selectedFile;
  }
}