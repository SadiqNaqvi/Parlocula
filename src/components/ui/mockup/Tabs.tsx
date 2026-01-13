
const MockupTabs = <T extends string,>({ tabs, active, onClick }: { tabs: Record<string, string>, active: T, onClick?: (t: T) => void }) => (

    <ul className="flex gap-3 overflow-x-auto noScroll">
        {Object.entries(tabs).map(([k, v]) => (
            <li
                key={k}
                onClick={() => onClick?.(k as T)}
                className={`flex-1 min-w-fit p-2 text-center *:py-2 border-b-2 border-transparent ${active === k ? "border-secondary cursor-not-allowed" : "border-gray30 cursor-pointer"}`}>
                {v}
            </li>
        ))}
    </ul>

);

export default MockupTabs;