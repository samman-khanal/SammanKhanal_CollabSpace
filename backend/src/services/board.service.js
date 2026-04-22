import Board from "../models/Board.model.js";
import { AppError } from "../utils/AppError.util.js";
//* Function for create board
export const createBoard = async ({
  workspaceId,
  name,
  userId,
  methodology
}) => Board.create({
  workspace: workspaceId,
  name,
  createdBy: userId,
  ...(methodology && {
    methodology
  })
});
//* Function for list boards
export const listBoards = async workspaceId => Board.find({
  workspace: workspaceId
}).sort({
  createdAt: -1
});
//* Function for get board
export const getBoard = async boardId => Board.findById(boardId);
//* Function for update board
export const updateBoard = async (boardId, patch) => {
  const updates = {};
  if (patch.name !== undefined) updates.name = patch.name;
  if (patch.methodology !== undefined) updates.methodology = patch.methodology;
  return Board.findByIdAndUpdate(boardId, updates, {
    new: true
  });
};
//* Function for delete board
export const deleteBoard = async boardId => {
  const board = await Board.findByIdAndDelete(boardId);
  if (!board) throw new AppError("Board not found", 404);
  return {
    deleted: true,
    boardId: String(board._id),
    workspaceId: String(board.workspace)
  };
};