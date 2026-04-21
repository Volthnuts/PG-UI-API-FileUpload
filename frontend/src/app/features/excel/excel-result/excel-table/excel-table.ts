import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.modules';
import { Router } from '@angular/router';
import { ExcelServiceApi } from '../../../../core/services/excel-service-api';

@Component({
  selector: 'app-excel-table',
  imports: [
    SharedModule,
  ],
  templateUrl: './excel-table.html',
  styleUrl: './excel-table.css',
})
export class ExcelTable {
  @Input() dataSource: any[] = [];
  @Input() filename!: string;
  @Output() dataChange = new EventEmitter<any[]>();
  @Output() edit = new EventEmitter<any>();

  columns: any[] = [];

  constructor(
    private excelApi: ExcelServiceApi,
    private router: Router,
  ) {}

  ngOnChanges() {
    if (this.dataSource && this.dataSource.length > 0) {
      this.columns = Object.keys(this.dataSource[0]).map(key => {
        return {
          key: key, // เก็บ key เดิมไว้ดึงข้อมูล: row[col.key]
          label: this.formatHeader(key) // แปลงเป็นชื่อที่จะโชว์
        };
      });
    }
  }

  formatHeader(key: string): string {
    return key
      // เปลี่ยน _ เป็น " "
      .replace(/_/g, ' ')
      // ตัดช่องว่างหน้าหลัง 
      .trim()
      // และเปลี่ยนตัวแรกของคำให้เป็นตัวใหญ่
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  onEditRow(rowData: any, index: number) {
    console.log('Edit Row Data:', rowData); // ตรวจสอบข้อมูลที่ส่งออกมา
    this.edit.emit({ data: rowData, index: index }); // ส่งข้อมูลแถวที่คลิกออกไปข้างนอก
  }

  // ฟังก์ชันสำหรับปุ่ม Download
  onDownloadFile() {
  if (this.filename && this.dataSource.length > 0) {
    
    const dataToDownload = this.dataSource.map(row => {
      const mappedRow: any = {};
        this.columns.forEach(col => {
          mappedRow[col.label] = row[col.key];
        });
      
      return mappedRow;
    });

    this.excelApi.downloadExcel(dataToDownload);
  }
}

  // ฟังก์ชันสำหรับปุ่ม Cancel
  onCancel() {
    // กลับไปยังหน้า Initial
    this.router.navigate(['/excel/initial']); 
  }
}
