import { Component, OnInit, Output,EventEmitter, Input, OnDestroy } from '@angular/core';
import { EChartsOption } from 'echarts';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Trade } from 'src/app/models/trade';
import { Wallet } from 'src/app/models/wallet';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, OnDestroy {

  @Input() trades!: BehaviorSubject<Trade[]>
  @Input() wallet!: BehaviorSubject<Wallet>
  @Output() toggleComponents = new EventEmitter<void>();

  public chartOptions: EChartsOption = {}
  public subscription!: Subscription 

  constructor() { }

  ngOnInit(): void {
    this.subscription = this.wallet.subscribe((wal) => {
      let wallet = Object.entries(wal.tradeHistory)
      wallet.sort((a, b) => {
        if(a[0] > b[0]) return 1
        if(a[0] < b[0]) return -1
        return 0
      })

      let lastValue: number = 0

      this.chartOptions = {
        xAxis: {
          type:"category",
          data: wallet.map(item => item[0])
        },
        yAxis: {
          type:"value"
        },
        series: {
          type:"line",
          // color: "#A2E3C4",
          data: wallet.map(item => item[1]).map(obj => {
            let value = obj.map(item => item.amountChange).reduce((acc, item) => acc += item, lastValue)
            lastValue = value
            return value
          })
        }
      }
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public openTrades(): void {
    this.toggleComponents.emit()
  }

}
