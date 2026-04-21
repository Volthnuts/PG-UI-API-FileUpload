import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.modules';
import { ExcelServiceApi } from '../../../core/services/excel-service-api';
import { ExcelEditForm } from './excel-edit-form/excel-edit-form';
import { ExcelTable } from './excel-table/excel-table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-excel-result',
  imports: [
    SharedModule,
    ExcelEditForm,
    ExcelTable
  ],
  templateUrl: './excel-result.html',
  styleUrl: './excel-result.css',
})
export class ExcelResult implements OnInit {
  resultData: any[] = [];
  filename!: string;
  selectedRowData: any = null;
  selectedIndex: number | null = null; 

  constructor(
    private excelApi: ExcelServiceApi,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.excelApi.currentResultData$.subscribe(result => {
      if (result) {
        this.resultData = result.data;      // ข้อมูลตาราง
        this.filename = result.filename;
      }
    });

    console.log('Result Data in ExcelResult Component:', this.resultData); // ตรวจสอบข้อมูลที่ได้รับในหน้า Result
    this.cdr.detectChanges();
  }


  handleEdit(event: any) {
    // เมื่อกดปุ่มแก้ไขที่ตาราง ข้อมูลจะไหลมาที่ฟังก์ชันนี้
    this.selectedRowData = event.data;
    this.selectedIndex = event.index; 
    console.log('Editing index:', this.selectedIndex);
  }

  clearEditedData(event: any) {
    this.selectedRowData = null; // ล้างข้อมูลที่เลือกไว้
    this.selectedIndex = null; // ล้างดัชนีที่เลือกไว้
    console.log('Cleared Edited Data, back to Table view'); // ตรวจสอบการล้างข้อมูล
  }

  updateData(event: any) {
    if (this.selectedIndex !== null && event) {
      const updatedData = [...this.resultData];
      updatedData[this.selectedIndex] = { ...event }; 
      
      this.resultData = updatedData;

      console.log('Update Success at index:', this.selectedIndex);
      console.log('New Data in Row:', this.resultData[this.selectedIndex]);

      this.clearEditedData(null);
      this.cdr.detectChanges();

      console.log('Updated Result Data:', this.resultData); // ตรวจสอบข้อมูลหลังอัพเดต
    }
  }
}
