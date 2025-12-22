import { getHandler } from "@lib/helpers/handlers";
import { shelvesAggregationPipeline } from "@lib/pipelines";
import { getPageParams } from "@lib/utils";
import Collaborator from "@model/collaborators";

// Get all the shelves where the current user is a collaborator;
export const GET = getHandler(async (r, params) => {

    const page = getPageParams(r) - 1;
    const { cuid } = params;

    const response = await Collaborator.aggregate(
        shelvesAggregationPipeline({
            filters: [
                { $match: { user_id: cuid, type: "collaborator" } },
            ],
            page,
            localFieldForLookup: "shelf_id",
            sort: { createdAt: -1 },
        })
    );

    return {
        success: true,
        result: response[0] ?? { data: [], total: 0 }
    }

});