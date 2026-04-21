import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.modules';

@Component({
  selector: 'app-excel-edit-form',
  imports: [
    SharedModule
  ],
  templateUrl: './excel-edit-form.html',
  styleUrl: './excel-edit-form.css',
})
export class ExcelEditForm {
  resultForm: FormGroup;
  rawData: any[] = [];
  isEditing = false;

  @Input() selectedIndex!: number;
  @Input() set selectedData(value: any) {
    if (value) {
      this.resultForm.enable();
      this.resultForm.patchValue({
        first_name: value.first_name,
        last_name: value.last_name,
        gender: value.gender,
        date_of_birth: this.formatDateForInput(value.date_of_birth),
        nationality: value.nationality
      });
      this.isEditing = true;
    }
  }
  @Output() clear = new EventEmitter<any>();
  @Output() update = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder, 
    private router: Router
  ) {
    this.resultForm = this.fb.group({
      // A-Z, a-z เท่านั้น และความยาวไม่เกิน 20
      first_name: [{value: '', disabled: true}, [Validators.required, Validators.pattern('^[a-zA-Z]+$'), Validators.maxLength(20)]],
      last_name: [{value: '', disabled: true}, [Validators.required, Validators.pattern('^[a-zA-Z]+$'), Validators.maxLength(20)]],
      // Male, Female, Unknown เท่านั้น
      gender: [{value: '', disabled: true}, [Validators.required, Validators.pattern('^(Male|Female|Unknown)$')]],
      // วันที่จริง และ <= วันปัจจุบัน
      date_of_birth: [{value: '', disabled: true}, [Validators.required, this.dateValidator]],
      // A-Z เท่านั้น และยาว 3 ตัวอักษร
      nationality: [{value: '', disabled: true}, [Validators.required, Validators.pattern('^[A-Z]+$'), Validators.minLength(3), Validators.maxLength(3)]]
    });
  }

  // Validator ตรวจสอบวันในอนาคต
  dateValidator(control: AbstractControl) {
      if (!control.value) return null;
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // รีเซ็ตเวลาเพื่อเทียบแค่วันที่
      return selectedDate > today ? { futureDate: true } : null;
  }

  // แปลง format วันที่จาก MM/dd/yyyy เป็น yyyy-MM-dd เพื่อให้ input date รับได้
  formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    return dateStr;
  }

  onSave() {
    if (this.resultForm.valid) {
      console.log('Final Data:', this.resultForm.value);
      this.update.emit(this.resultForm.value);

      this.resultForm.reset();
      this.isEditing = false;
    }
  }

  onClear() {
    this.resultForm.reset();
    this.isEditing = false;
    this.clear.emit();
  }

  isInvalid(controlName: string) {
    const control = this.resultForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }
}
