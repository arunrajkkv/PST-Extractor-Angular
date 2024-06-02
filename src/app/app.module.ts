import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

import { AppComponent } from './app.component';
import { PstExtractorComponent } from './pst-extractor/pst-extractor.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from './services/common.service';
import { PstExtractorTestComponent } from './pst-extractor-test/pst-extractor-test.component';
import { ReportDataService } from './services/report-data.service';
import { UtilityService } from './services/utility.service';

@NgModule({
    declarations: [
        AppComponent,
        PstExtractorComponent,
        PstExtractorTestComponent
   ],
    imports: [
        BrowserModule,
        HttpClientModule,
        RouterModule,
        FormsModule,
        BrowserAnimationsModule,
        MatIconModule
    ],
    providers: [CommonService, ReportDataService, UtilityService],
    bootstrap: [AppComponent]
})
export class AppModule { }
