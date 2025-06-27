"use client";

import { Ellipsis } from "@assets/Icons";
import { Navigate, OptionMenu } from "@components";
import OptionList from "@components/ui/OptionList";
import useCurrentUser from "@store/user";

const OptionsButton = ({ author, id }: { author: string, id: string }) => {

    const { user, isHydrated } = useCurrentUser();

    if (!isHydrated || !user) return null;

    else if (user._id === author) return (
        <OptionMenu ButtonElement={<Ellipsis />} id="options-picker">
            <Navigate comp="link" goto={`${id}/edit`} className="px-4 py-2 mb-2 w-full">Edit</Navigate>
            <OptionList className="text-red-500">Delete</OptionList>
        </OptionMenu>
    )

    else return (
        <OptionMenu ButtonElement={<Ellipsis />} id="options-picker">
            <OptionList>Report</OptionList>
            <OptionList>Flag as Inappropriate</OptionList>
            <OptionList>Flag as NSFW</OptionList>
            <OptionList>Flag as Spoiler</OptionList>
            <OptionList>Block User</OptionList>
        </OptionMenu>
    )

}

export default OptionsButton;