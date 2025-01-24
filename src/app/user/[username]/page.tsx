import { UserProfile, NotFound, ShowError } from "@components/ui";
import { verifyToken } from "@lib/auth";
import { GeneralSingleReturn, User } from "@type/internal";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-static";

const fetchUser = async (username: string): Promise<GeneralSingleReturn<User>> => {
    try {
        return await fetch(`${process.env.__NEXT_PRIVATE_ORIGIN || ""}/api/user/${username}`, {
            next: {
                revalidate: 60 * 60 * 24 * 7,
                tags: [`userdata-${username}`]
            }, cache: "force-cache"
        })
            .then(res => res.json());
    } catch (err) {
        console.log(`Error fetching user data of ${username}:`, err);
        return { result: null, error: "Looks like your internet connection is not stable! Please check your connection and try again.", success: false }
    }
}

const checkIfUserIsCurrentUser = (user: User | null) => {
    if (!user) return;
    const token = cookies().get("token")?.value;
    if (!token) return;
    const payload = verifyToken(token);
    if (!payload || typeof payload === "string") return;
    if (payload.user_id === user._id) redirect("/me");
}

export const generateMetadata = async ({ params: { username } }: { params: { username: string } }) => {
    const { result, success } = await fetchUser(username);
    if (!success) return { title: "Popcorn Paragon" }
    if (!result) return { title: "Wrong Way! Popcorn Paragon" }
    return { title: `${result.username} - Popcorn Paragon`, description: result.bio }
}

const Page = async ({ params }: { params: { username: string } }) => {
    const { username } = params;

    const { result, error, success } = await fetchUser(username);
    checkIfUserIsCurrentUser(result);

    if (!success)
        return <ShowError heading="Failed to fetch the resource you're looking for." paras={[error]} />

    if (!result)
        return (
            <section className="size-full flex flex-cntr-all">
                <NotFound title="User Not Found!" paragraph={[`Reasons: "${username}" might have changed their username, disabled or deleted their account.`]} />
            </section>
        )

    return <UserProfile user={result} />
}

export default Page;