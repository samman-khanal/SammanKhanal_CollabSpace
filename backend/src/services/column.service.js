import Column from "../models/Column.model.js";
//* Function for create column
export const createColumn = async ({
  boardId,
  title
}) => {
  const count = await Column.countDocuments({
    board: boardId
  });
  return Column.create({
    board: boardId,
    title,
    order: count
  });
};
//* Function for list columns
export const listColumns = async boardId => Column.find({
  board: boardId
}).sort({
  order: 1
});
//* Function for update column
export const updateColumn = async (columnId, patch) => Column.findByIdAndUpdate(columnId, {
  title: patch.title
}, {
  new: true
});
//* Function for delete column
export const deleteColumn = async columnId => {
  await Column.deleteOne({
    _id: columnId
  });
  return {
    deleted: true
  };
};
//* Function for reorder columns
export const reorderColumns = async ({
  boardId,
  orderedIds
}) => {
  //* Function for ops
  const ops = orderedIds.map((id, idx) => ({
    updateOne: {
      filter: {
        _id: id,
        board: boardId
      },
      update: {
        order: idx
      }
    }
  }));
  await Column.bulkWrite(ops);
  return {
    reordered: true
  };
};