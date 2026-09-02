import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Read-only, public — filtered by req.office (set by office-resolve middleware)
export const createPublicMasterDataController = (Model, label) => ({
  list: asyncHandler(async (req, res) => {
    const items = await Model.find({ office: req.office._id })
      .select("-office -createdAt -updatedAt -__v")
      .sort("name");
    return res.json(new ApiResponse(200, items, `${label} list fetched.`));
  }),
});