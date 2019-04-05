import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';

import { NewsProvider, ICategory } from '../providers/news-provider';
import { DbProvider } from '../providers/db-provider';

import { SplashScreen } from '@ionic-native/splash-screen';

@Component({
  templateUrl: 'app.html',
  providers: [NewsProvider, DbProvider]
})

export class MyApp {
  @ViewChild(Nav) nav: Nav;

  public categories: ICategory[] = []

  constructor(
    private splashScreen: SplashScreen,
    public platform: Platform,
    public dbProvider: DbProvider,
    public newsProvider: NewsProvider,
    // private firebaseAnalytics: FirebaseAnalytics
  ) {
    // this.initializeApp();
    this.platform.ready()
      .then(() => {
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        //
          this.splashScreen.hide()
      })
      .catch((error: any) => console.error(error))

      this.setupCategories()
  }

  setupCategories() {

    return this.dbProvider.getCategories()
      .then(() => this.newsProvider.getCategories()
        .subscribe(
          (data: ICategory[]) => {
            this.categories = data
            this.dbProvider.updateCategories(data)
          },

          error => {
            console.log("Error getting categories. Error:", error);
          }
        )
      )
      .catch(error => console.log('Error setup categories data:', error))
  }

  getCategories() {
    return this.categories
      .filter((category: ICategory) => category.id != 3)
      .sort((a, b) => a.id - b.id)
  }

  changeCategory(category) {
    this.openPage('CategoryPage', { category })
  }

  openPage(page , params?) {
    this.nav.push(page, params)
  }

  getIcon(category) {

    switch (category) {

      case 'Все новости': return 'planet';
      case 'Бизнес': return 'trending-up';
      case 'Туризм': return 'boat';
      case 'Происшествия': return 'medkit';
      case 'Отели': return 'home';
      case 'Еда': return 'restaurant';
      case 'Культура': return 'musical-note';

      default: return 'ios-globe-outline'
    }
  }
}
