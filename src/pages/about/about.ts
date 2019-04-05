import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

import { NavController, NavParams } from 'ionic-angular';
import { NewsProvider } from '../../providers/news-provider';


@IonicPage()
@Component({
  selector: 'about-page',
  templateUrl: 'about.html'
})

export class AboutPage {

  refreshButtonEnabled: boolean;
  counter: number;
  infiniteIconColor: string;
  currentYear: number;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public newsProvider: NewsProvider
  ) {
    this.infiniteIconColor = 'dark';
    this.currentYear = new Date().getFullYear();
  }

  ionViewDidLoad() {
    this.refreshButtonEnabled = true;
    this.counter = 0;
  }
}
