import { Component, ViewChild } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { NavController, NavParams, Content } from 'ionic-angular';

import { NewsProvider, IPost } from '../../providers/news-provider';

@IonicPage()
@Component({
  selector: 'tag-page',
  templateUrl: 'tag.html'
})

export class TagPage {
  @ViewChild(Content) content: Content

  public step: number = 10
  public limit: number = this.step
  public tag: any
  public scrollButtonActive: boolean
  public scrollWatcher: any;
  public posts: IPost[] = []
  public page: number = 1
  public spinnerVisible: boolean = false

  constructor(
    public navCtrl: NavController,
    public newsProvider: NewsProvider,
    public navParams: NavParams
  ) {
    this.tag = navParams.get('tag');
    this.searchPosts()
  }

  //
  ionViewDidEnter() {
    // console.log('Tag page entered')
    if (!this.posts.length) {
      this.showInfiniteIcon()
    }

    this.setScrollWatcher()
  }

  ionViewWillLeave() {
    this.removeScrollWatcher()
  }

  //
  setScrollWatcher() {
    this.scrollWatcher = setInterval(() => {
      if (this.content.scrollTop > 300) {
        this.scrollButtonActive = true;
      } else {
        this.scrollButtonActive = false;
        this.limit = this.step;
      }
    }, 500)
  }

  removeScrollWatcher() {
    clearInterval(this.scrollWatcher)
  }

  scrollToTop() {
    return this.content.scrollToTop();
  }

  // Posts
  searchPosts() {
    this.newsProvider.searchByTag(this.tag.id, this.page)
      .subscribe((data: IPost[]) => {
        this.posts = data
        // console.log('this.posts', this.posts)
          this.hideInfiniteIcon()

          this.spinnerVisible = false
      },

      error => {
        this.hideInfiniteIcon()
        this.spinnerVisible = false

        if (error.status === 400) return

        console.log('Error loading posts by tag:', error);
        setTimeout(() => this.newsProvider.presentToast('Нет сети'), 500)
      })
  }

  filteredPosts() {
    return this.posts
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      .slice(0, this.limit)
  }

  viewPost(post) {
    this.navCtrl.push('DetailsPage', { post })
  }

  loadMore(infiniteScroll) {
    infiniteScroll.complete();

    if (this.spinnerVisible) return

    this.spinnerVisible = true

    this.page++;
    this.limit = this.page * this.step;

    this.newsProvider.searchByTag(this.tag.id, this.page)
      .subscribe((data: IPost[]) => {
        const postsIds = this.posts.map((post: IPost) => post.id)

        this.posts = this.posts.concat(data.filter((post: IPost) => {
          return !postsIds.includes(post.id)
        }))

        this.spinnerVisible = false
        // console.log('this.searchResult', this.searchResult)
      },

      error => {
        this.spinnerVisible = false

        if (error.status === 400) return

        console.log('Error loading posts by tag:', error);
        setTimeout(() => this.newsProvider.presentToast('Нет сети'), 500)
      })
  }

  doRefresh(refresher) {
    this.page = 1
    this.limit = this.step
    this.posts = []

    this.newsProvider.searchByTag(this.tag.id, this.page)
      .subscribe((data: any[]) => {
        this.posts = data

        console.log('this.posts', this.posts)
        refresher.complete()
      },

      error => {
        refresher.complete()

        if (error.status === 400) return

        console.log('Error loading posts by tag:', error)
        setTimeout(() => this.newsProvider.presentToast('Нет сети'), 500)
      })
  }

  //
  offPlaceholder(event) {
    event.target.parentElement.querySelector('.placeholder')
      .setAttribute('hidden', 'true');

    event.target.removeAttribute('hidden');
    event.target.classList.remove('invisible');
  }

  //
  // Animations
  showInfiniteIcon() {
    Array.from(document.querySelectorAll('.infinite-icon'))
      .forEach(icon => this.animatePulse(icon))
  }

  hideInfiniteIcon() {
    Array.from(document.querySelectorAll('.infinite-icon'))
    .forEach(icon => this.stopAnimatePulse(icon))
  }

  animatePulse(element) {
    if (!element) return Promise.resolve(console.log('No element to anumate Pulse'))

    return new Promise(resolve => {
      element.classList.add('animation-pulse')
      // console.log('Animation Pulse started on:', element)

      setTimeout(() => resolve(true), 750);
    })
    .catch(e => console.log('Error in animatePulse:', e))
  }

  stopAnimatePulse(element) {
    if (!element) return Promise.resolve(console.log('No element to animate stopPulse'))

    return new Promise(resolve => {
      element.addEventListener('animationiteration', () => {
        // console.log('Animation stopPulse started on element:', element)
        element.classList.remove('animation-pulse')
      })
    })
    .catch(e => console.log('Error in animateHide:', e))
  }
}