const DropDown = ({ children, label, id }: { children: React.ReactNode, label: string, id: string }) => {
    return (
        <div className="group relative">
            {/* <div className="peer relative bg-gray-500"> */}
            <input type="checkbox" className="absolute opacity-0 peer pointer inset-0" />
            <button className="smallBtn inline-flex flex-cntr-all rounded-lg text-sm px-5 py-2.5 border border-gray30" type="button">
                {label}
                <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                </svg>
            </button>
            {/* </div> */}
            <div className="p-2 group-focus-within:peer-checked:bg-red-500">
                <ul id={id} className="z-10 w-full bg-primarylight rounded-lg">
                    {children}
                </ul>
            </div>
        </div >
    )
}

export default DropDown;