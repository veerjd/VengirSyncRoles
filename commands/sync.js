module.exports = {
  name: 'sync',
  description: 'Provide a category id, channel id or channel ping and it\'ll sync with the other',
  aliases: ['sc'],
  shortUsage(prefix) {
    return `${prefix}sc 576549951480397844`
  },
  longUsage(prefix) {
    return `${prefix}sync 576549951480397844`
  },
  forceNoDelete: true,
  category: 'hidden',
  permsAllowed: ['MANAGE_CHANNELS'],
  usersAllowed: ['217385992837922819'],
  execute: async function (message, argsStr, replyData) {
    if (argsStr.length < 2)
      throw 'Please just provide a category id'
    const argsArray = argsStr.split(/ +/)
    let channelId

    if (message.mentions.channels.size > 0)
      channelId = message.mentions.channels.first().id
    else
      channelId = argsArray[0]

    const input = message.client.channels.cache.get(channelId)

    if (!input)
      throw 'The input is wrong. Make sure you ping a channel or provide a channel/category id.'

    if (input.type === 'category') {
      const channels = input.children.array()

      for (const channel of channels) {
        const lockedChannel = await channel.lockPermissions()
        replyData.content.push([`:white_check_mark: <#${lockedChannel.id}>`, {}])
      }
    } else {
      const lockedChannel = await input.lockPermissions()
      replyData.content.push([`:white_check_mark: <#${lockedChannel.id}>`, {}])
    }
    return replyData
  }
};