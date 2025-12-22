import { Link } from "@type/internal";
import LinkTile from "./LinkTile";

const LinksSection = ({ links }: { links: Link[] }) => (
    <ul className="px-4 my-4 flex gap-4 overflow-x-auto noScroll">
        {links.map(link => (
            <li key={link.path}>
                <LinkTile {...link} />
            </li>
        ))}
    </ul>
)

export default LinksSection;