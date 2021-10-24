module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    await db.collection('game').updateMany({}, { $rename: { users: "players" } })
    await db.collection('game').updateMany({}, { $rename: { whoPlay: "turn" } })
    return db.collection('game').updateMany({}, { $rename: { run: "state" } })
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    await db.collection('game').updateMany({}, { $rename: { players: "users" } })
    await db.collection('game').updateMany({}, { $rename: { turn: "whoPlay" } })
    return db.collection('game').updateMany({}, { $rename: { state: "run" } })
  }
};
