import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelInitial } from './excel-initial';

describe('ExcelInitial', () => {
  let component: ExcelInitial;
  let fixture: ComponentFixture<ExcelInitial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExcelInitial],
    }).compileComponents();

    fixture = TestBed.createComponent(ExcelInitial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
