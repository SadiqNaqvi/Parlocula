import { RightChevron } from "@assets/Icons";
import { Navbar, Navigate } from "@components";
import { getUserFromToken } from "@lib/auth/utils";
import { getCurrentUser } from "@lib/helpers/common";
import { fetchQuery, getQueryClient } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { Link, CurrentUser } from "@type/internal";
import { cookies } from "next/headers";

const ShelvesPage = async () => {

    const jar = await cookies();
    const meta = await getUserFromToken(jar);
    if (!meta) return null;

    const { user_id, username } = meta;

    const user = await fetchQuery<CurrentUser>({
        queryClient: getQueryClient(),
        queryFn: () => getCurrentUser(user_id, jar),
        queryKey: getQueryKeys("user_username", { username }),
    });

    if (!user) return null;

    const links: Link[] = [
        { label: "👁 Public", path: "/shelf/public" },
        { label: "🤫 Private", path: "/shelf/private" },
        { label: "🤝 Collaborative", path: "/shelf/collaborate" },
        { label: "✉ Invited", path: "/shelf/invited" },
        { label: "✔ Saved", path: "/settings/saved/shelves" },
    ];

    return (
        <>
            <Navbar navTitle="Shelves" />

            <section className="px-2">
                <ul className="border border-gray40 rounded-md">
                    {user.predefinedShelves.map(({ name, _id }) => (
                        <li key={_id}>
                            <Navigate
                                comp="link" type="button" goto={`/shelf/${_id}`}
                                className="size-full px-2 py-3 flex flex-cntr-between"
                            >

                                <span className="capitalize">{name}</span>

                                <span>
                                    <RightChevron className="size-5" />
                                </span>
                            </Navigate>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="px-2">
                <h2 className="parloHeading p-2">Your Shelves</h2>
                <ul className="border border-gray40 rounded-md">
                    {links.map(({ label, path }) => (
                        <li key={path}>
                            <Navigate
                                comp="link" type="button" goto={path}
                                className="size-full px-2 py-3 flex flex-cntr-between"
                            >
                                <span className="capitalize">{label}</span>

                                <span>
                                    <RightChevron className="size-5" />
                                </span>

                            </Navigate>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    )

}

export default ShelvesPage;