import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExcelServiceApi {
  // url ของ backend
  private apiUrl = 'http://localhost:8080/api/v1/excel';

  // เก็บชื่อไฟล์ต้นฉบับ
  private originalFileName!: string;

  // ส่งต่อข้อมูลผลลัพธ์จาก backend ไปยังหน้า Result ผ่าน BehaviorSubject
  private resultDataSubject = new BehaviorSubject<{ data: any[], filename: string } | null>(null);
  currentResultData$ = this.resultDataSubject.asObservable();
  setResultData(data: any[], filename: string) {
      this.resultDataSubject.next({ data, filename });
  }

  constructor(private http: HttpClient) {}

  // ฟังก์ชันสำหรับอัปโหลดไฟล์ excel ไปยัง backend 
  uploadExcel(file: File): Observable<any[]> {
    this.originalFileName = file.name; // เก็บชื่อไฟล์ต้นฉบับไว้ในตัวแปร
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any[]>(`${this.apiUrl}/upload`, formData);
  }
 
  // ฟังก์ชันสำหรับดาวน์โหลดไฟล์ excel จาก backend
  downloadExcel(data: any[]): void {
    // ส่งชื่อไฟล์กลับไปให้ backend ไว้ในตัวแปรนี้
    const query_params = { 
      filename: this.originalFileName 
    };

    this.http.post(`${this.apiUrl}/download`, data, { 
      params: query_params, // ส่งชื่อกลับไป
      responseType: 'blob' 
    })
    .subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob); // สร้าง URL object จาก blob ที่ได้รับจาก backend
        const link = document.createElement('a'); // สร้างลิงก์สำหรับดาวน์โหลด
        link.href = url; // กำหนด href ของลิงก์เป็น URL object ที่สร้างขึ้น
        
        // ใช้ชื่อเดิมที่เก็บไว้
        link.download = this.originalFileName; 
        
        link.click(); // เริ่มดาวน์โหลด
        window.URL.revokeObjectURL(url); // ล้าง URL object หลังจากดาวน์โหลดเสร็จ
      },
      error: (err) => {
        console.error('Download error:', err);
      }
    });
  }
}
