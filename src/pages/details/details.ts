import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { NavParams, Nav, NavController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';

import { NewsProvider, IPost } from '../../providers/news-provider';

@IonicPage()
@Component({
  selector: 'details-page',
  templateUrl: 'details.html'
})

export class DetailsPage {

  public post: IPost;
  public tags: any[] = [];

  constructor(
    public socialSharing: SocialSharing,
    public newsProvider: NewsProvider,
    public navParams: NavParams,
    public nav: Nav,
    public navCtrl: NavController
  ) {
    this.post = navParams.get('post');
    this.getTags()
  }

  //
  ionViewDidLoad() {
      this.setupImageListeners()
      this.setupIFrameListeners()
      this.setClickListeners()
  }

  //
  setupImageListeners() {
    // console.log('setupImageListeners')

    const currentPage = Array.from(document.querySelectorAll('details-page')).reverse()[0]
    const images = currentPage.querySelectorAll("img[id^='newImage']");

    // console.log('Images.length:', images.length)

    for (let i = 0; i < images.length; i++) {
      const newImage = images[i];

      newImage.addEventListener('load', (event) => this.imageHandler(event));
    }
  }

  imageHandler(event) {
    // console.log('Listener for image', event.target, 'triggered')

    const currentPage = Array.from(document.querySelectorAll('details-page')).reverse()[0]

    if (currentPage) {
      let tempImage = currentPage.querySelector('#tempImage' + event.target.id.split('newImage')[1])

      if (tempImage) {
        tempImage.setAttribute('hidden', 'true')
        event.target.removeAttribute('hidden')
      }

      event.target.removeEventListener('load', (event) => this.imageHandler(event))
    }
  }

  setupIFrameListeners() {
    // console.log('setupFrameListeners')

    const currentPage = Array.from(document.querySelectorAll('details-page')).reverse()[0]

    const iFrames = currentPage.querySelectorAll('iframe');

    if (iFrames.length) {
      for (let i = 0; i < iFrames.length; i++) {
        const newIFrame = iFrames[i];

        newIFrame.addEventListener('load', () => {

          const currentPage = Array.from(document.querySelectorAll('details-page')).reverse()[0]

          this.newsProvider.checkIntenetConnection()
            .then(connected => {
              console.log('Connected: ', connected)
              const tempIFrame = currentPage.querySelector('#tempIFrame' + i);
              const videoContainer = newIFrame.parentElement;

              if (connected) {
                console.log('Internet is connected: setting up the iFrame')
                if (tempIFrame) {
                  tempIFrame.setAttribute('hidden', 'true');
                  newIFrame.removeAttribute('hidden');
                  videoContainer.removeAttribute('hidden');
                };


              } else {
                console.log('Internet is disconnected: setting up the placeholder');
                videoContainer.parentNode.insertBefore(tempIFrame, videoContainer);
                videoContainer.parentNode.removeChild(videoContainer);
                tempIFrame.removeAttribute('hidden');
              }

            })
        })
      }
    }
  }

  setClickListeners() {
    // console.log('setClickListeners:')

    const currentPage = Array.from(document.querySelectorAll('details-page')).reverse()[0]

    const internalLinks = currentPage.querySelectorAll('a[data-href]')

    Array.from(internalLinks)
      .forEach(link => {
        link.addEventListener('click', (event) => this.linkHandler(event))
        // console.log('-> Event listeners for link', link['innerText'], 'set')
      })
  }

  offPlaceholder(event) {
    event.target.removeAttribute('hidden');

    event.target.parentElement.querySelector('.placeholder')
      .setAttribute('hidden', 'true');
  }

  //
  share(post: any) {
    this.socialSharing.shareWithOptions({
      subject: 'Новости Вьетнама: ' + post.title.rendered,
      url: post.link,
      chooserTitle: post.title.rendered
    })
    .catch((e) => {
      console.log('Error sharing post:', e)
    })
  }

  //
  getTags() {
    // console.log('Getting tags...');

    this.newsProvider.getTags(this.post)
      .subscribe(
        (tags: any[]) => {
          this.tags = tags
        },

        error => console.log("Getting tags error:", error)
    )
  }

  openTagPage(tag: any) {
    let activeItem = document.querySelector(`ion-menu ion-list ion-item.active`);
    // console.log('activeItem:', activeItem);

    if (activeItem) activeItem.classList.remove('active');

    this.nav.push('TagPage', { tag: { name: tag.name, id: tag.id } });
  }

  linkHandler(event) {
    // console.log('Link:', link)
    const link = event.target.getAttribute('data-href')

    const slug = link.split('/')
      .filter((chunk: string) => chunk.length)
      .reverse()[0]

    // console.log('Slug:', slug)

    this.newsProvider.getSinglePost(slug)
      .subscribe((data: IPost[]) => {
        const post: IPost = data[0]

        // console.log('Post:', post)

        if (post.type === 'post') {
          this.nav.push('DetailsPage', { post: data[0] })
        }
      },

      error => {
        console.log('Error getting single post:', error)
        setTimeout(() => this.newsProvider.presentToast('Нет сети'), 500)
      }
    )
  }
}
