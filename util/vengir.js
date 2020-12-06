module.exports.doesMemberHaveVengirOnMain = function(mainMember, mainVengir) {
  if(mainMember.roles.cache.has(mainVengir.id)) // If he has Vengir role on Main
    return true
  else
    return false
}

module.exports.ifVengirOnMain = function(vengirMember, vengirVengir, vengirNotVengir) {
  const memberRoleManager = vengirMember.roles.cache
  let roleToAdd
  let roleToRemove

  if(memberRoleManager.has(vengirVengir.id)) {
    if(memberRoleManager.has(vengirNotVengir.id)) {
      roleToRemove = vengirNotVengir
    }
  } else {
    roleToAdd = vengirVengir
    if(memberRoleManager.has(vengirNotVengir.id)) {
      roleToRemove = vengirNotVengir
    }
  }
  return [roleToAdd, roleToRemove]
}

module.exports.ifNotVengirOnMain = function(vengirMember, vengirVengir, vengirNotVengir) {
  const memberRoleManager = vengirMember.roles.cache
  let roleToAdd
  let roleToRemove

  if(memberRoleManager.has(vengirNotVengir.id)) {
    if(memberRoleManager.has(vengirVengir.id)) {
      roleToRemove = vengirVengir
    }
  } else {
    roleToAdd = vengirNotVengir
    if(memberRoleManager.has(vengirVengir.id)) {
      roleToRemove = vengirVengir
    }
  }
  return [roleToAdd, roleToRemove]
}

module.exports.addAndRemoveRoles = function(vengirMember, roleToAdd, roleToRemove, vengirVengir, vengirNotVengir, vengirLogsChannel) {
  const memberRoleManager = vengirMember.roles

  if(roleToAdd)
    memberRoleManager.add(roleToAdd)
      .then(() => {
        if(roleToAdd.id === vengirVengir)
          vengirLogsChannel.send(`**${vengirMember.user.username}** joined the rebel forces and was knighted kind folk!`)
        if(roleToAdd.id === vengirNotVengir)
          vengirLogsChannel.send(`**${vengirMember.user.username}** was disgraced by leaving our fierce and beloved tribe, slash him.`)
      }).catch(err => vengirLogsChannel.send(`Error:\`\`\`${err} for ${vengirMember.user.tag}\`\`\``))
  if(roleToRemove)
    memberRoleManager.remove(roleToRemove)
      .then().catch(err => vengirLogsChannel.send(`Error:\`\`\`${err} for ${vengirMember.user.tag}\`\`\``))
}