import { commentsCollection } from "../../../database/mongoDB"
import { MongoCommentType } from "../types"

const save = async (inputComment: MongoCommentType) => {
  const { insertedId } = await commentsCollection.insertOne(inputComment);
  return insertedId.toString();
}

const commentsCommandRepository = {
  save,
}

export { commentsCommandRepository }