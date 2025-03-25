import { DynamicComponent } from "@components";
import { UserProfile } from "@components/ui";
import { getPostsOfUser, getUserByUsername } from "@lib/actions/actions";
import { refineSearchParams } from "@lib/utils";
import { GeneralGetReturn } from "@type/internal";

type Props = { params: { username: string }, searchParams: { p?: string, f?: string, t?: string } }

export const generateMetadata = async ({ params: { username } }: Props) => {
    const { result, success } = await getUserByUsername(username);
    if (!success) return { title: "Popcorn Paragon" }
    if (!result) return { title: "Wrong Way! Popcorn Paragon" }
    return { title: `${result.username} - Popcorn Paragon`, description: result.bio }
}

const getUserAndPosts = async ({ params, searchParams }: Props): Promise<GeneralGetReturn> => {
    const { username } = params;
    const user = await getUserByUsername(username);
    if (!user.success || !user.result) return user;
    // else if (!user.result.post_count)
    //     return { ...user, result: { user: user.result, posts: null } }

    const { filter, page } = refineSearchParams("userPosts", searchParams.p, searchParams.f)
    const posts = await getPostsOfUser(username, page, filter);
    return {
        success: true,
        errCode: null,
        result: { user: user.result, posts: posts.result }
    }
}

const Page = DynamicComponent((data, props) => {

    return <UserProfile {...data} />
}, getUserAndPosts)

export default Page;