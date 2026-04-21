import { Routes } from "@angular/router";
import { ExcelInitial } from "../features/excel/excel-initial/excel-initial";
import { ExcelResult } from "../features/excel/excel-result/excel-result";

export const Excel_Routes: Routes = [
    {
      path: '', 
      redirectTo: 'initial', 
      pathMatch: 'full'
    },
    {
      path: 'initial',
      component: ExcelInitial
    },
    {
      path: 'result',
      component: ExcelResult

    }
]