const unflatten = comments => {
  const hashTable = Object.create(null)
  comments.forEach(
    comment => (hashTable[comment.id] = { ...comment, childComments: [] })
  )
  const commentTree = []
  comments.forEach(comment => {
    if (comment.parentCommentId)
      hashTable[comment.parentCommentId].childComments.push(
        hashTable[comment.id]
      )
    else commentTree.push(hashTable[comment.id])
  })
  return commentTree
}

const countChildren = comment => {
  if (!comment.childComments || comment.childComments.length === 0) return 0
  let count = 0
  comment.childComments.forEach(c => {
    count++
    c.childCount = countChildren(c)
    count += c.childCount
  })
  return count
}

export const createCommentTree = flatComments => {
  flatComments = unflatten(flatComments)
  flatComments.forEach(c => (c.childCount = countChildren(c)))
  return flatComments
}

export const getParticipants = flatComments =>
  flatComments
    .filter(c => !!c.author)
    .map(c => c.author)
    .filter(
      (user, index, self) => self.findIndex(t => t.id === user.id) === index
    )
