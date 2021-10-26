import { Component, Output,EventEmitter, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { Trade } from 'src/app/models/trade';
import { Wallet } from 'src/app/models/wallet';

function comparisonDateValidator() : ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null=> {
    const control1 = control.get("entryDate")?.value;
    const control2 = control.get("exitDate")?.value;

    if(!control1 || !control2) return null

    if (control1 > control2) {
      return {dateError: true}
    } else {
      return null
    }
  };
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  public mainForm: FormGroup;
  public submitted = false
  public chosenTrade: Trade | undefined;
  
  @Input() trades!: BehaviorSubject<Trade[]>;
  @Input() wallet!: BehaviorSubject<Wallet>
  @Output() toggleComponents = new EventEmitter<void>();
  @Output() clearAll = new EventEmitter<void>();

  constructor(private formBuilder: FormBuilder) { 
    this.mainForm = this.formBuilder.group({
      entryDate: ['', Validators.required],
      exitDate: ['', Validators.required],
      entryPrice: ['', [Validators.required, Validators.min(1), Validators.maxLength(6)]],
      exitPrice: ['', [Validators.required, Validators.min(1), Validators.maxLength(6)]],
    }, {validators: comparisonDateValidator()})
  }

  public submit() {
    this.submitted = true

    if(this.mainForm.invalid) return

    const trade: Trade = {
      id: (this.chosenTrade ? this.chosenTrade.id : Date.now()),
      entryDate: moment(this.mainForm.controls.entryDate.value).toDate(),
      exitDate: moment(this.mainForm.controls.exitDate.value).toDate(),
      entryPrice: this.mainForm.controls.entryPrice.value,
      exitPrice: this.mainForm.controls.exitPrice.value,
      profit: this.mainForm.controls.exitPrice.value - this.mainForm.controls.entryPrice.value
    }
    
    let wallet = this.wallet.getValue()
    let trades = this.trades.getValue()

    if(this.chosenTrade) {
      trades = trades.map(item => item.id == trade.id ? trade: item);

      if(trade.entryDate != this.chosenTrade.entryDate || trade.entryPrice != this.chosenTrade.entryPrice)
        wallet = this.updateWalletInfo(wallet, trade.entryDate, this.chosenTrade.entryDate, trade.id, -trade.entryPrice, false)
      if(trade.exitDate != this.chosenTrade.exitDate || trade.exitPrice != this.chosenTrade.exitPrice)
        wallet = this.updateWalletInfo(wallet, trade.exitDate, this.chosenTrade.exitDate, trade.id, trade.exitPrice, true)

    } else {
      wallet = this.addWalletInfo(wallet, trade.entryDate, trade.id, -trade.entryPrice, false)
      wallet = this.addWalletInfo(wallet, trade.exitDate, trade.id, trade.exitPrice, true)

      trades.push(trade)
    }
    wallet.balance = trades.reduce((acc, item) => acc += item.profit, 0)
    
    trades.sort((a, b) => {
      if(a.exitDate > b.exitDate) return 1
      else if(a.exitDate < b.exitDate) return -1
      return 0
    })
    
    this.clearEdit()
    this.wallet.next(wallet)
    this.trades.next(trades)

    this.submitted = false
  }

  public clearAllButton() {
    this.clearAll.emit()
  }

  public openChart() {
    this.toggleComponents.emit();
  }
  
  public editTrade(trade: Trade) {
    this.chosenTrade = trade;
    
    this.mainForm.controls.entryDate.setValue(moment(trade.entryDate).format("YYYY-MM-DD"))
    this.mainForm.controls.exitDate.setValue(moment(trade.exitDate).format("YYYY-MM-DD"))
    this.mainForm.controls.entryPrice.setValue(trade.entryPrice)
    this.mainForm.controls.exitPrice.setValue(trade.exitPrice)
  }

  public clearEdit() {
    this.chosenTrade = undefined

    this.mainForm.controls.entryDate.setValue('')
    this.mainForm.controls.exitDate.setValue('')
    this.mainForm.controls.entryPrice.setValue('')
    this.mainForm.controls.exitPrice.setValue('')
  }

  private addWalletInfo(wallet: Wallet, date: Date, id: number, value: number, isEndValue: boolean): Wallet {
    if(!wallet.tradeHistory[date.toLocaleDateString()]) wallet.tradeHistory[date.toLocaleDateString()] = []

    wallet.tradeHistory[date.toLocaleDateString()].push({
      tradeId: id,
      amountChange: value,
      isEndValue
    })

    return wallet
  }

  private updateWalletInfo(wallet:Wallet, date: Date, oldDate:Date, id:number, value: number, isEndValue: boolean) {
    wallet.tradeHistory[oldDate.toLocaleDateString()] = wallet.tradeHistory[oldDate.toLocaleDateString()].filter(i => i.tradeId !== id || i.isEndValue !== isEndValue)

    if(wallet.tradeHistory[oldDate.toLocaleDateString()].length == 0) delete wallet.tradeHistory[oldDate.toLocaleDateString()]

    return this.addWalletInfo(wallet, date, id, value, isEndValue)
  }
}
