importScripts('lunr/lunr-2.0.1.js');
importScripts('lunr/lunr.stemmer.support.js');
importScripts('lunr/lunr.ru.js');
importScripts('lunr/lunr.multi.js');


// This is a listener on the worker for incoming messages.  
self.addEventListener('message', function (e) {
  // e.data has the data passed to this worker.  

  let startTime = Date.now();
  console.log('Indexing started');

  const index = lunr(function () {

    this.use(lunr.multiLanguage('en', 'ru'));

    this.ref('id');
    this.field('title');
    this.field('content');

    for (const post of e.data) {
      this.add({
        "id": post.id,
        "title": post.title.rendered,
        "content": post.content.rendered
      }, false);
    }
  })

  // Now we send a message back to the script that created this worker.  
  self.postMessage(JSON.stringify(index.toJSON()));

  console.log('Indexing finished with time:', (Date.now() - startTime) / 1000, 'sec');

  // Memory footprint can be large with a lot of data copied around. This kills the worker. 

  self.close();
}, false);
