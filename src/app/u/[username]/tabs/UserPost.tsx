import { InfiniteScroller } from "@components";
import { NotFound, PostTile } from "@components/ui";
import { getPostsOfUser } from "@lib/actions/actions";
import { infiniteScrollerResponse } from "@lib/utils";

const fetchData = async (username: string, page: number, filter: string) => {
    const { errCode, result, success } = await getPostsOfUser(username, page, filter);
    if (!success) throw new Error(errCode);
    return infiniteScrollerResponse(result, page);
}

type Props = {
    username: string,
    postCount: number,
    initialData: any,
    isCurrentUser: boolean,
    page: number, filter: string
}

const UserPost = ({ username, postCount, initialData, isCurrentUser, filter, page }: Props) => {

    const notFoundMessage = isCurrentUser ?
        {
            title: "Create your first post",
            paras: ["Click on the add icon and start posting."]
        }
        :
        {
            title: "Nothing to see here",
            paras: ["The person has not posted anyhting yet"]
        };

    if (!postCount) return (
        <NotFound {...notFoundMessage} />
    )


    return (
        <InfiniteScroller
            initialPage={page}
            initialData={initialData}
            queryKeys={[filter, `posts-of-${username}`, `${page}`]}
            fetchData={(p) => fetchData(username, p, filter)}
            Component={PostTile}
            notFoundMessage={notFoundMessage}
        />
    )
}

export default UserPost;