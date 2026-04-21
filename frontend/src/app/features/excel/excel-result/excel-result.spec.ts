import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelResult } from './excel-result';

describe('ExcelResult', () => {
  let component: ExcelResult;
  let fixture: ComponentFixture<ExcelResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExcelResult],
    }).compileComponents();

    fixture = TestBed.createComponent(ExcelResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
