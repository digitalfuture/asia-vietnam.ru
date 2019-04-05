import { Component, ViewChild } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { NavParams, Content, Nav, Platform } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';

import { NewsProvider, IPost, ICategory } from '../../providers/news-provider';
import { DbProvider } from '../../providers/db-provider';

@IonicPage()
@Component({
 selector: 'news-page',
  templateUrl: 'news.html'
})

export class NewsPage {
  @ViewChild(Content) content: Content

  public limit: number
  public step: number = 10
  public scrollButtonEnabled: boolean
  public scrollWatcher: any
  public searchInput: string = ''
  public searchIconVisible: boolean = false
  public infiniteIconVisible: boolean = true
  public searchTerm$ = new Subject<string>()
  public page: number = 1
  public searchResult: IPost[] = []
  public posts: IPost[] = []
  public category: ICategory
  private resetBackButtonAction: any = () => {}

  public spinnerVisible: boolean = false

  constructor(
    public nav: Nav,
    public navParams: NavParams,
    public newsProvider: NewsProvider,
    public dbProvider: DbProvider,
    private platform: Platform,
  ) {
    this.category = navParams.get('category') || { id: 3, name: 'Все новости' }
    this.limit = this.step;

    this.infiniteIconVisible = true

    this.refreshPosts()
    this.setupSearchPosts()
  }

  //
  // Life cycles
  ionViewDidEnter() {
    this.showInfiniteIcon()
    this.setScrollWatcher()

    if (!this.searchIconVisible && !this.infiniteIconVisible) {
      this.registerBackButtonAction()
    }
  }

  ionViewWillLeave() {
    this.removeScrollWatcher()
    this.resetBackButtonAction()
  }

  //
  // Events
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

  //
  // Posts
  loadMore(infiniteScroll) {
    infiniteScroll.complete()

    if (this.spinnerVisible) return

    if (this.searchInput.length) {
      return this.searchMore()
    }

    this.spinnerVisible = true

    this.page++;
    this.limit = this.step * this.page;

    console.log('Load more. Page:', this.page)
    this.newsProvider.getPosts(this.page, this.category.id)
      .subscribe(
        (data: any[]) => {
          const postsIds = this.posts.map((post: IPost) => post.id)

          // console.log('Before load:', this.posts.length)
          this.posts = this.posts.concat(data.filter((post: IPost) => {
            return !postsIds.includes(post.id)
          }))

          // console.log('After load:', this.posts.length)
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

  refreshPosts(refresher?) {
    this.page = 1
    this.limit = this.step

      return this.dbProvider.getPosts()
      .then((data: IPost[]) => {
        this.posts = data
        // console.log('From DB:', this.posts.length)
      })
      .then(() => this.newsProvider.getPosts(this.page, this.category.id))
      .then((res: any) => res.subscribe(
        (data: any[]) => {
          this.dbProvider.updatePosts(data)

          // console.log('Posts before update:', this.posts)
          const postsIds = this.posts.map((post: IPost) => post.id)

          this.posts = this.posts.concat(data.filter((post: IPost) => {
            return !postsIds.includes(post.id)
          }))

          this.hideInfiniteIcon()

          if (refresher) {
            refresher.complete()
          }
          // console.log('After refresh:', this.posts.length)
        },

        error => {
          if (refresher) {
            refresher.complete()
          }

          this.hideInfiniteIcon()

          if (error.status === 400) return

          console.log('Refresh data error:', error)

          if (refresher) {
            refresher.complete()
          }

          setTimeout(() => this.newsProvider.presentToast('Нет сети'), 500)
        }
      ))

  }

  filteredPosts() {
    return this.posts
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      .slice(0, this.limit)
  }

  viewPost(post) {
    this.nav.push('DetailsPage', { post });
  }

  //
  // Search
  getSearchResult() {
    return this.searchResult
      // .filter(post => post.categories.indexOf(this.category.id) != -1)
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      .slice(0, this.limit)
  }

  handleSearch() {
    this.page = 1
    this.limit = this.step
    this.searchResult = []
    this.spinnerVisible = true

    console.log('Handle search. Page:', this.page)
    this.searchTerm$.next(`search="${this.searchInput}"&page=${this.page}`)
  }

  setupSearchPosts() {
    this.newsProvider.searchByText(this.searchTerm$)
      .subscribe(
        data => {
          // console.log('Search result:', data)

          this.spinnerVisible = false
          const postsIds = this.searchResult.map((post: IPost) => post.id)

          this.searchResult = this.searchResult.concat(data.filter((post: IPost) => {
            return !postsIds.includes(post.id)
          }))
        },

        error => {
          this.spinnerVisible = false

          if (error.status === 400) return

          console.log('Error searching more data:', error)
          setTimeout(() => this.newsProvider.presentToast('Нет сети'), 500)
        }
      )
  }

  searchMore() {
    if (this.spinnerVisible) return

    this.spinnerVisible = true

    this.page++;
    this.limit = this.page * this.step;

    console.log('Search more. Page:', this.page)
    this.searchTerm$.next(`search="${this.searchInput}"&page=${this.page}`)
    // console.log('Search more...')
  }

  // Buttons
  registerBackButtonAction() {
    this.resetBackButtonAction = this.platform.registerBackButtonAction(() => {
      if (!this.searchIconVisible) {
        this.clickCancelButton()
      } else {
        this.resetBackButtonAction()
      }
    })
  }

  clickSearchButton() {
    // console.log('disabling search icon');
    this.registerBackButtonAction()

    this.searchIconVisible = false;

    setTimeout(() => {
      const inputElem = document.querySelector('input')
      if (inputElem) inputElem.focus()
    }, 750);
  }

  clickCancelButton() {
    this.page = 1
    this.limit = this.step

    this.scrollToTop()

    if (this.searchInput.length > 0) {
      // console.log('deleting search text');
      this.searchInput = '';
      this.searchResult = [];

      setTimeout(() => {
        const inputElem = document.querySelector('input')
        if (inputElem) inputElem.focus()
      }, 500);

    } else {

      // console.log('disabling cancel icon');
      this.searchIconVisible = true;
      this.resetBackButtonAction()

      setTimeout(() => this.showSearchIcon(), 0)
    }
  }

  // Animations
  showInfiniteIcon() {
    const icon = document.querySelector('.infinite-icon')
    this.animatePulse(icon)
  }

  hideInfiniteIcon() {
    const icon = document.querySelector('.infinite-icon')
    this.stopAnimatePulse(icon)
      .then(() => {
        this.infiniteIconVisible = false
        this.showSearchIcon()
      })
  }

  showSearchIcon() {
    this.searchIconVisible = true
    setTimeout(() => {
      const icon = document.querySelector('.search-icon')
      this.animateShow(icon)
    }, 0)
  }

  animateShow(element) {
    if (!element) return Promise.resolve(
      // console.log('Animation Show: no element')
    )

    return new Promise(resolve => {
        element.classList.add('animation-show');
        // console.log('Animation Show started on element:', element)
        setTimeout(() => resolve(true), 750);
    })
    .catch(e => console.log('Error in animateShow:', e))
  }

  animateHide(element) {
    if (!element) return Promise.resolve(
      // console.log('Animation Hide: no element')
    )

    return new Promise(resolve => {
      element.addEventListener('animationiteration', () => {
        // console.log('Animation Hide started on element:', element)
        element.classList.add('animate-hide')

        setTimeout(() => {
          element.classList.remove('animation-pulse')
          element.classList.remove('animation-show')
          element.classList.remove('animation-hide')

          resolve(true)
        }, 750)
      })
    })
    .catch(e => console.log('Error in animateHide:', e))
  }

  animatePulse(element) {
    if (!element) return Promise.resolve(
      // console.log('Animation Pulse: no element')
    )

    return new Promise(resolve => {
      element.classList.add('animation-pulse')
      // console.log('Animation Pulse started on:', element)

      setTimeout(() => resolve(true), 1500);
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
