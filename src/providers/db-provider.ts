import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';

@Injectable()
export class DbProvider {

  public db;

  constructor() { }

  initDB() {
    return new Promise(resolve => {
      this.db = new PouchDB('posts', { auto_compaction: true})
      // .then(data => { this.db = data });

      // this.db.info().then(function (info) {
      //   console.log(info);
      // })

      resolve(true)
    })
  }

  destroyDb() {
    return this.db.destroy().then(() => {
      console.log('DB destroyed.')
    })
  }

  updatePosts(posts) {
    // console.log('Updating DB:', posts)
    // console.log('DB: update posts:', posts.length)
    const preparedPosts = posts.map(post => ({
      _id: 'post_' + post.id,
      post
    }))

    this.clearPosts()
      .then(() => this.db.bulkDocs(preparedPosts))
  }

  clearPosts() {
    // console.log('Cropping DB.')

    return this.db.allDocs({ include_docs: true })
      .then(data => data.rows.filter(row => row.doc.post))
      .then(rows => rows.forEach(row => this.db.remove(row.doc)))
      .catch(error => console.log('Crop DB error:', error))
  }

  getPosts() {
    return this.db.allDocs({ include_docs: true })
      .then(data => data.rows.filter(row => row.doc.post))
      .then(rows => rows.map(row => row.doc.post))
      .catch(error => console.log('Get posts from DB error:', error))
  }

  getCategories() {
    // console.log('Getting categories...');
    return this.db.allDocs({ include_docs: true })
      .then(data => data.rows.filter(row => row.doc.category))
      .then(rows => rows.map(row => row.doc.category))
      .then(rows => rows.sort((a, b) => a.id - b.id))
  }

  clearCategories() {
    return this.db.allDocs({ include_docs: true })
      .then(data => {
        return data.rows
          .filter(row => row.doc.category)
          .forEach(row => this.db.remove(row.doc))
      })
  }

  updateCategories(categories: any[]) {
    // console.log("Setting categories...");
    const preparedPosts = categories.map(category => {
      return {
        _id: 'category_' + category.id,
        category
      }
    })

    this.clearCategories()
      .then(() => this.db.bulkDocs(preparedPosts))
  }
}
