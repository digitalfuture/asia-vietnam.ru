import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import { ToastController } from 'ionic-angular';

import { DbProvider } from './db-provider'

import { Observable } from 'rxjs/Observable'
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'

export interface IPost {
  id: number
  date: string
  modified: string
  slug: string
  type: string
  title: { rendered: string }
  content: { rendered: string }
  categories: number[]
  tags: number[]
  _embedded: { 'wp:featuredmedia': any[] }
}

export interface ICategory {
  id: number
  name: string
}

@Injectable()
export class NewsProvider {

  public baseUrl: String = 'http://asia-vietnam.ru/wp-json/wp/v2/'
  public categories: ICategory[] = []
  public tag: number
  public tagPosts: any[] = []

  constructor(
    public dbProvider: DbProvider,
    public http: Http,
    private toastCtrl: ToastController
  ) {
    dbProvider.initDB()
   }

  getCategories() {
    // console.log('Getting categories...');

    return this.http.get(`${this.baseUrl}categories?exclude=1,106`)
      .pipe(
        map(data => data.json())
      )
  }

  getTags(post) {
    // console.log('Getting tags from API ...');

    return this.http.get(`${this.baseUrl}tags?post=${post.id}`)
      .pipe(
        map(res => res.json())
      )
  }

  searchByText(terms: Observable<string>) {
    return terms
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(term => this.searchEntriesByText(term))
      )
  }

  searchEntriesByText(term: string) {
    return this.http.get(`${this.baseUrl}posts?_embed&${term}&per_page=10`)
      .pipe(
        map(res => res.json())
      )
  }

  getPosts(page: number, categoryId: number) {
    return this.http.get(`${this.baseUrl}posts?_embed&page=${page}&per_page=10&categories=${categoryId}`)
      .pipe(
        map(res => res.json())
      )
  }
    
  getSinglePost(slug: string) {
    return this.http.get(`${this.baseUrl}posts?_embed&slug=${slug}`)
      .pipe(
        map(res => res.json())
      )
  }

  searchByTag(tagId: number, page: number) {
    // console.log('tagId:', tagId)
    return this.http.get(`${this.baseUrl}posts?_embed&tags=${tagId}&page=${page}&per_page=10`)
      .pipe(
        map(res => res.json())
      )
  }

  //
  checkIntenetConnection() {
    let url = this.baseUrl + '';

    return new Promise(resolve => {
      this.http.head(url)
        .subscribe(() => {
          // console.log('Internet is connected');
          resolve(true)

          },
          
          () => {
            // console.log('Internet is disconnected');
            resolve(false)
          }
        )
    })
  }

  presentToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 5000,
      cssClass: 'toast'
    });

    toast.present();
  }
  //
}