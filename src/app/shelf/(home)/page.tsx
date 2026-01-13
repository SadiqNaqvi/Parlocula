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
        { label: "👁 Public", path: "public" },
        { label: "🤫 Private", path: "private" },
        { label: "🤝 Collaborative", path: "collaborate" },
        { label: "✉ Invited", path: "invited" },
        { label: "✔ Saved", path: "/me/saved/shelfs" },
    ];

    return (
        <>
            <Navbar navTitle="Shelves" />
            <section>
                <ul className="bg-primarylight">
                    {links.map(({ label, path }) => (
                        <li key={path}>
                            <Navigate
                                comp="link" type="button" goto={path}
                                className="size-full p-2 flex flex-cntr-between">
                                <span className="capitalize">{label}</span>
                                <span><RightChevron className="size-5" /></span>
                            </Navigate>
                        </li>
                    ))}
                </ul>
            </section>
            <section>
                <h2 className="text-uppercase text-sm p-2" >Pre-Defined Shelves</h2>
                <ul className="bg-primarylight">
                    {user.predefinedShelves.map(({ name, _id }) => (
                        <li key={_id}>
                            <Navigate
                                comp="link" type="button" goto={`/shelf/${_id}`}
                                className="size-full p-2 flex flex-cntr-between">
                                <span className="capitalize">{name}</span>
                                <span><RightChevron className="size-5" /></span>
                            </Navigate>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    )

}

export default ShelvesPage;