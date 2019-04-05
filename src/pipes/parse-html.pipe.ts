import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { SecurityContext } from "@angular/core";

@Pipe({ name: "parseHtml" })

export class ParseHtml implements PipeTransform {
  constructor( private sanitized: DomSanitizer ) { }

  transform(html) {
    html = this.clearAttributes(html)
    html = this.getLinks(html)
    html = this.getImages(html)
    html = this.setImagesPlaceholder(html)
    html = this.getIframes(html)
    html = this.setIframesPlaceholder(html)
    html = this.setQuotes(html)

    return html
  }

  clearAttributes(html: string) {
    let template = document.createElement('div');
    template.innerHTML = html;

    let elements = template.querySelectorAll('*');

    let attributes = ['width', 'height', 'style', 'class'];

    attributes.forEach( attribute => {
      for (let i = 0; i < elements.length; i++) {
        elements[i].removeAttribute(attribute);
      }
    })

    return template.innerHTML
  }

  getLinks(html: string) {
    let template = document.createElement('div');
    template.innerHTML = html;

    let links = template.querySelectorAll('a');

    for (let i = 0; i < links.length; i++) {

      if (links[i].href.search('//asia-vietnam.ru/') != -1) {
        // console.log('Internal link:', links[i])
        links[i].setAttribute('data-href', links[i].href.split('?')[0].split("#")[0])
        links[i].setAttribute('onclick', 'return false;')
        links[i].setAttribute('href', '#')
      } else {
        // console.log('External link:', links[i])
        links[i].setAttribute('onclick', `window.open('${links[i].href.split('?')[0].split("#")[0]}', '_system', 'location=yes'); return false;`)
        links[i].setAttribute('href', "#")
        links[i].setAttribute('target', '_blank');
      }
    }

    return template.innerHTML
  }

  getImages(html: string) {
    let template = document.createElement('div')
    template.innerHTML = html;

    let images = template.querySelectorAll('img')

    for (let i = 0; i < images.length; i++) {
      let oldImage = images[i];
      let newImage = document.createElement('img')

      newImage.setAttribute('src', oldImage.src)

      oldImage.parentNode.replaceChild(newImage, oldImage)
    }
    return template.innerHTML
  }

  setImagesPlaceholder(html: string) {
    let placeholder = 'assets/images/placeholder.png';
    let template = document.createElement('div');
    template.innerHTML = html;

    let images = template.querySelectorAll('img');

    for (let i = 0; i < images.length; i++) {
      let newImage = images[i];
      newImage.setAttribute('hidden', 'true');
      newImage.id = 'newImage' + i;

      let tempImage = document.createElement('img');
      tempImage.setAttribute('src', placeholder);
      tempImage.id = 'tempImage' + i;

      newImage.parentNode.insertBefore(tempImage, newImage);
    }

    return template.innerHTML
  }

  getIframes(html: string) {

    let template = document.createElement('div');
    template.innerHTML = html;

    let iframes = template.querySelectorAll('iframe');

    for (let i = 0; i < iframes.length; i++) {

      let oldIframe = iframes[i];

      let newIframe = document.createElement('iframe');

      newIframe.setAttribute('src', oldIframe.src);
      newIframe.setAttribute('frameborder', '0');
      newIframe.setAttribute('allowfullscreen', 'true');

      let newIframeContainer = document.createElement('div');
      newIframeContainer.classList.add('video-container');

      newIframeContainer.appendChild(newIframe);

      oldIframe.parentNode.replaceChild(newIframeContainer, oldIframe);
    }

    return template.innerHTML
  };

  setIframesPlaceholder(html: string) {
    const placeholder = 'assets/images/placeholder.png';
    const template = document.createElement('div');
    template.innerHTML = html;

    const iFrames = template.querySelectorAll('iframe');

    for (let i = 0; i < iFrames.length; i++) {
      let newIFrame = iFrames[i];
      newIFrame.setAttribute('hidden', 'true');
      newIFrame.id = 'newIFrame' + i;

      let tempIFrame = document.createElement('img');
      tempIFrame.setAttribute('src', placeholder);
      tempIFrame.id = 'tempIFrame' + i;

      let videoContainer = newIFrame.parentElement;
      videoContainer.setAttribute('hidden', 'true');
      videoContainer.parentNode.insertBefore(tempIFrame, videoContainer);
    }

    return template.innerHTML
  }

  setQuotes(html: string) {
    const template = document.createElement('div');
    template.innerHTML = html;

    let quotes = template.querySelectorAll('blockquote');

    let iconSrc = document.querySelector("ion-icon[name='quote'");

    for (let i = 0; i < quotes.length; i++) {
      let text = quotes[i].querySelector('p');

      let icon = iconSrc.cloneNode(true);
      let span = document.createElement('span');
      span.appendChild(icon);
      span.querySelector('ion-icon').removeAttribute('hidden');

      quotes[i].insertBefore(icon, text);
    }

    return template.innerHTML
  }

  untrustedHtml(html: string) {
    return this.sanitized.sanitize(SecurityContext.HTML, html)
  }
}