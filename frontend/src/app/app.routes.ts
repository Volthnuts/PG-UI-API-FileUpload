import { Routes } from '@angular/router';
import { Excel_Routes } from './routes/excel-route';

export const routes: Routes = [
    { 
        path: '', 
        redirectTo: 'excel', 
        pathMatch: 'full' 
    },

    {
        path: 'excel',
        children: [
            ...Excel_Routes
        ]
    },

    { 
        path: '**', 
        redirectTo: 'excel' 
    }
];
