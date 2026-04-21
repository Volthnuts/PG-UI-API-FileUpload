import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelTable } from './excel-table';

describe('ExcelTable', () => {
  let component: ExcelTable;
  let fixture: ComponentFixture<ExcelTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExcelTable],
    }).compileComponents();

    fixture = TestBed.createComponent(ExcelTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
