import { Component, ViewChild } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { NavParams, Content, Nav } from 'ionic-angular';

import { NewsProvider, IPost, ICategory } from '../../providers/news-provider';
import { DbProvider } from '../../providers/db-provider';

@IonicPage()
@Component({
 selector: 'category-page',
  templateUrl: 'category.html'
})

export class CategoryPage {
  @ViewChild(Content) content: Content

  public limit: number
  public step: number = 10
  public scrollButtonEnabled: boolean
  public scrollWatcher: any
  public infiniteIconVisible: boolean = true
  public page: number = 1
  public posts: IPost[] = []
  public category: ICategory
  public spinnerVisible: boolean = false

  constructor(
    public nav: Nav,
    public navParams: NavParams,
    public newsProvider: NewsProvider,
    public dbProvider: DbProvider,
  ) {
    this.category = navParams.get('category') || { id: 3, name: 'Все новости' }
    this.limit = this.step;

    this.refreshData()
  }

  // Life cycles
  //
  ionViewDidEnter() {
    this.showInfiniteIcon()
    this.setScrollWatcher()
  }

  ionViewWillLeave() {
    this.removeScrollWatcher()
  }

  // Events
  //
  setScrollWatcher() {
    this.scrollWatcher = setInterval(() => {
      if (this.content.scrollTop > 300) {
        this.scrollButtonEnabled = true;
      } else {
        this.scrollButtonEnabled = false;
        this.limit = this.step;
      }
    }, 500)
  }

  removeScrollWatcher() {
    clearInterval(this.scrollWatcher)
  }

  scrollToTop() {
    this.content.scrollToTop();
  }

  offPlaceholder(event) {
    event.target.parentElement.querySelector('.placeholder')
      .setAttribute('hidden', 'true');

    event.target.removeAttribute('hidden');
    event.target.classList.remove('invisible');
  }

  loadMore(infiniteScroll) {
    infiniteScroll.complete()

    if (this.spinnerVisible) return

    this.spinnerVisible = true

    this.page++;
    this.limit = this.step * this.page;

    this.newsProvider.getPosts(this.page, this.category.id)
      .subscribe(
        (data: any[]) => {
          const postsIds = this.posts.map((post: IPost) => post.id)

          this.posts = this.posts.concat(data.filter((post: IPost) => {
            return !postsIds.includes(post.id)
          }))

          this.spinnerVisible = false
        },

        error => {
          this.spinnerVisible = false
          if (error.status === 400) return

          console.log('Error loading more data:', error)
          setTimeout(() => this.newsProvider.presentToast('Нет сети'), 500)
        }
      )
  }

  // Posts
  //
  doRefresh(refresher) {
    this.refreshData()
      .then(() => refresher.complete())
  }

  refreshData() {
    this.limit = this.step;

    return Promise.resolve()
      .then(() => this.dbProvider.getPosts())
      .then((data: any[]) => this.posts = data)
      .then(() => this.newsProvider.getPosts(this.page, this.category.id))
      .then((res: any) => res.subscribe((data: any[]) => {
        // console.log('Posts before update:', this.posts)
        const postsIds = this.posts.map((post: IPost) => post.id)

        this.posts = this.posts.concat(data.filter((post: IPost) => {
          return !postsIds.includes(post.id)
        }))

        this.dbProvider.updatePosts(data)
        // console.log('Posts after update:', this.posts)

        this.hideInfiniteIcon()
      },

      error => {
        this.hideInfiniteIcon()
        if (error.status === 400) return

        console.log('Refresh data error:', error)
        setTimeout(() => this.newsProvider.presentToast('Нет сети'), 500)
      }
    ))
      .catch(error => console.log('Error refreshing data:', error))
  }

  sortedPosts() {
    return this.posts
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      .filter((post: IPost) => post.categories.indexOf(this.category.id) != -1)
      .slice(0, this.limit)
  }

  viewPost(post) {
    this.nav.push('DetailsPage', { post });
  }

  // Animations
  showInfiniteIcon() {
    Array.from(document.querySelectorAll('.infinite-icon'))
      .forEach(icon => this.animatePulse(icon))
    this.infiniteIconVisible = true
  }

  hideInfiniteIcon() {
    Array.from(document.querySelectorAll('.infinite-icon'))
      .forEach(icon => this.stopAnimatePulse(icon))
    this.infiniteIconVisible = false
  }

  animatePulse(element) {
    if (!element) return Promise.resolve(
      // console.log('Animation Pulse: no element')
    )

    return new Promise(resolve => {
      element.classList.add('animation-pulse')
      // console.log('Animation Pulse started on:', element)

      setTimeout(() => resolve(true), 1500)
    })
    .catch(e => console.log('Error in animatePulse:', e))
  }

  stopAnimatePulse(element) {
    if (!element) return Promise.resolve(
      // console.log('Animation stopPulse: no element')
    )

    return new Promise(resolve => {
      element.addEventListener('animationiteration', () => {
        // console.log('Animation stopAnimationPulse started on element:', element)
          element.classList.remove('animation-pulse')
          resolve(true)
      })
    })
    .catch(e => console.log('Error in animateHide:', e))
  }
}
