const db = require('../db')

module.exports = {
  name: 'deleteadvisors',
  description: 'Delete all advisors for the channel or a pinged channel',
  aliases: ['delad'],
  shortUsage(prefix) {
    return `${prefix}delad`
  },
  longUsage(prefix) {
    return `${prefix}deleteadvisors`
  },
  forceNoDelete: true,
  category: 'Staff',
  permsAllowed: ['MANAGE_MESSAGES'],
  usersAllowed: ['217385992837922819'],
  execute: async function (message, argsStr, replyData) {
    let channel = message.channel
    if (message.mentions.channels.size > 0) {
      channel = message.mentions.channels.array()
      channel = channel[0]
    }

    const sql = 'SELECT * FROM advisors WHERE channel_id = $1'
    const values = [channel.id]
    const { rows } = await db.query(sql, values)

    if (rows.length < 0)
      throw `There's a problem... I didn't have advisors for ${channel}`

    const sqlgc = 'DELETE FROM advisors WHERE channel_id = $1'
    const valuesgc = [channel.id]
    await db.query(sqlgc, valuesgc)

    const members = []

    if (rows[0].advisors.length !== 0)
      rows[0].advisors.forEach(advisor => {
        const member = message.guild.members.cache.get(advisor)
        members.push(member.user.username)
      })

    replyData.content.push([`The advisors for ${channel} were removed:\n${members.join(', ')}`, {}])

    return replyData
  }
};