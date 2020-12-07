const db = require('../db')

module.exports = {
  name: 'setadvisor',
  description: 'Set players as advisor for the game/channel it\'s used in',
  aliases: ['setad', 'set'],
  shortUsage(prefix) {
    return `${prefix}setadvisor #channel-ping @TheShow @ulthripe`
  },
  longUsage(prefix) {
    return `${prefix}setad #channel-ping @TheShow @ulthripe`
  },
  forceNoDelete: true,
  category: 'Staff',
  permsAllowed: ['MANAGE_MESSAGES'],
  usersAllowed: ['217385992837922819'],
  execute: async function (message, argsStr, replyData) {
    if (message.mentions.users.size < 1)
      throw 'You need to ping at least one player'

    const userIds = []

    message.mentions.users.forEach(user => {
      userIds.push(user.id)
    })

    const dbData = []
    let channels = [message.channel]
    if (message.mentions.channels.size > 0)
      channels = message.mentions.channels

    channels.forEach(channel => {
      const data = {
        channel_id: channel.id
      }
      const eIndex = channel.name.search(/(e\d\d)\w+/g) + 1
      data.game_id = Number(channel.name.substring(eIndex, eIndex + 5)) || 0
      data.userIds = userIds

      dbData.push(data)
    })

    dbData.forEach(async row => {
      const sqlgc = 'SELECT * FROM advisors WHERE channel_id = $1'
      const valuesgc = [row.channel_id]
      const ressel = await db.query(sqlgc, valuesgc)

      if (!ressel.rows[0]) {
        const sql = 'INSERT INTO advisors (channel_id, elo_number, advisors) VALUES ($1, $2, $3)'
        const values = [row.channel_id, row.game_id, row.userIds]
        await db.query(sql, values)
      } else {
        const sql = 'UPDATE advisors SET advisors = $1 WHERE channel_id = $2'
        const values = [row.userIds, row.channel_id]
        await db.query(sql, values)
      }
    })

    replyData.content.push([`The ${message.mentions.users.size} players you specified were set as Advisors in the ${channels.length} games/channels!`, {}])

    return replyData
  }
};