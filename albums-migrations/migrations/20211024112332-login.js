module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    await db.collection('user').updateMany({}, { $rename: { pass: "password" } })
    return db.collection('user').updateMany({}, { $rename: { fullName: "name" } })
    // await db.collection('user').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    await db.collection('user').updateMany({}, { $rename: { password: "pass" } })
    return db.collection('user').updateMany({}, { $rename: { name: "fullName" } })
  }
};
