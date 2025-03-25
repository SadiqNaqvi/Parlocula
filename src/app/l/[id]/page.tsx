import { DynamicComponent } from "@components";
import { ListPage } from "@components/ui";
import { getList, getItems } from "@lib/actions/actions";
import { refineSearchParams } from "@lib/utils";

const getListAndItems = async ({ params, searchParams }: { params: { id: string }, searchParams: { p?: string, f?: string } }) => {
    const { id } = params;
    const { page, filter } = refineSearchParams("items", searchParams?.p, searchParams?.f);
    const list = getList(id);
    const items = getItems(id, page, filter);
    const [listRes, itemsRes] = await Promise.all([list, items])
    const { success, errCode, result } = listRes;
    if (!success) return { success, errCode };
    return {
        success, result: {
            list: result,
            items: itemsRes.result ?? []
        }
    }
}

const Page = DynamicComponent((data, { params, searchParams }) => {
    const { filter } = refineSearchParams("items", searchParams?.p, searchParams?.f);
    return <ListPage data={data} filter={filter} />
}, getListAndItems)

export default Page;