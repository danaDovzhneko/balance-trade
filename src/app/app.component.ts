import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Trade } from './models/trade';
import { Wallet } from './models/wallet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'test-trade';

  public mainShown: boolean = true;
  public chartShown: boolean = false;

  public trades: BehaviorSubject<Trade[]> = new BehaviorSubject<Trade[]>([])
  public wallet: BehaviorSubject<Wallet> = new BehaviorSubject<Wallet>({
    balance: 0,
    tradeHistory: {}
  }) 

  public toggleComponents() {
    this.chartShown = !this.chartShown;
    this.mainShown = !this.mainShown;
  }

  public clearAll() {
    const wallet: Wallet = {
      balance: 0,
      tradeHistory: {}
    }
    this.wallet.next(wallet)
    this.trades.next([])
  }
}
