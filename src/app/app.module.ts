import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MainComponent } from './components/main/main.component';
import { ChartComponent } from './components/chart/chart.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ChartComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
