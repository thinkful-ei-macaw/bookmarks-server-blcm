/* eslint-disable strict */
const BookmarksService = {
  getBookmarks(knex) {
    return knex.select('*')
      .from('bookmarks');
  },
  getBookmarkId(knex, id) {
    return knex.from('bookmarks')
      .select('*')
      .where('id', id)
      .first();
  },
  addBookmark(knex, newBookmark) {
    return knex.insert(newBookmark)
      .into('bookmarks')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteBookmark(knex, id) {
    return knex('bookmarks')
      .where({ id })
      .del();
  },
  updateBookmark(knex, id, newBookmarkFields) {
    return knex('bookmarks')
      .where({ id })
      .update(newBookmarkFields);
  }
};

module.exports = BookmarksService;