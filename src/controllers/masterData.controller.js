import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const createMasterDataController = (Model, label) => ({
  list: asyncHandler(async (req, res) => {
    const items = await Model.find({ office: req.user.office }).sort("-createdAt");
    return res.json(new ApiResponse(200, items, `${label} list fetched.`));
  }),

  add: asyncHandler(async (req, res) => {
    try {
      const item = await Model.create({ ...req.body, office: req.user.office });
      return res.status(201).json(new ApiResponse(201, item, `${label} added successfully!`));
    } catch (error) {
      return res.status(500).json(new ApiError(500, "Something went wrong!", error.message));
    }
  }),

  update: asyncHandler(async (req, res) => {
    try {
      const item = await Model.findOneAndUpdate({ _id: req.body.id, office: req.user.office }, req.body, { new: true });
      if (!item) return res.status(404).json(new ApiError(404, `${label} not found.`));
      return res.json(new ApiResponse(200, item, `${label} updated successfully!`));
    } catch (error) {
      return res.status(500).json(new ApiError(500, "Something went wrong!", error.message));
    }
  }),

  remove: asyncHandler(async (req, res) => {
    try {
      const item = await Model.findOneAndDelete({ _id: req.params.id, office: req.user.office });
      if (!item) return res.status(404).json(new ApiError(404, `${label} not found.`));
      return res.json(new ApiResponse(200, {}, `${label} deleted successfully!`));
    } catch (error) {
      return res.status(500).json(new ApiError(500, `Failed to delete. Record may be referenced elsewhere.`, error.message));
    }
  }),
});