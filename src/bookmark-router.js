/* eslint-disable strict */
const express = require('express');
const uuid = require('uuid/v4');
const { isWebUri } = require('valid-url');
const logger = require('./logger');
const xss = require('xss');
const store = require('./store');
const BookmarksService = require('./bookmarks-service');


//get and POST will go here

const bookmarksRouter = express.Router();
const bodyParser = express.json();

const serializeBookmark = (bookmark) => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: parseInt(bookmark.rating)
});

bookmarksRouter.route('/bookmarks')
  .get((req, res, next) => {
    // move implementation logic into here
    BookmarksService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => {
        res.json(bookmarks.map(serializeBookmark));
      })
      .catch(next);
  })

  .post(bodyParser, (req, res, next)=>{
    // move implementation logic into here
    for (const keys of ['title', 'url', 'rating', 'description']) {
      if (!req.body[keys]) {
        logger.error(`${keys} is required`);
        return res.status(400)
          .send({
            error: { message: `${keys} is required`}
          });
      }
    }
    
    const { title, url, rating, description } = req.body;

    const ratingValue = Number(rating);
      
    if (!ratingValue.isNaN() || ratingValue < 0 || ratingValue 5) {
  return res.status(400).send({
    error: { message: `${rating} must be a number 1 thru 5!` }
  })
    }

    if (!isWebUri(url)) {
      logger.error(`Invalid url '${url}' supplied`);
      return res.status(400) 
        .send('url must be valid');
    }
      
    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`Invalid rating '${rating}' supplied`);
      return res.status(400)
        .send('rating needs to be a number 0 - 5');
    }
    
    const newBookmark = { id: uuid(), title, url, description, rating };

    store.bookmarks.push(newBookmark);

    logger.info(`bookmark ${newBookmark.id} added`);
    res.status(201)
      .location(`http://localhost:8000/bookmarks/${newBookmark.id}`)
      .json(newBookmark);
  });

bookmarksRouter.route('/bookmarks/:bookmarkId')
  .get((req, res) => {
    const { bookmarkId } = req.params;
    const bookmark = store.bookmarks.find(m => m.id === bookmarkId);

    if (!bookmark) {
      logger.error(`bookmark with ${bookmarkId} not found`);
      return res.status(404)
        .send('bookmark not found');
    }
    res.json(bookmark);
  })
    
  .delete (
    (req, res)=>{
      const { bookmarkId } = req.params;
      const bookmarkIndex = store.bookmarks.findIndex(b => b.id === bookmarkId);

      if (bookmarkIndex === -1) {
        logger.error(`bookmark with id ${bookmarkId} not found`);
        return res.status(404)
          .send('not found');
      }
      store.bookmarks.splice(bookmarkIndex, 1);
      logger.info(`bookmark with id ${bookmarkId} deleted`);

      res.status(204)
        .end();
    }
  );



module.exports = bookmarksRouter;