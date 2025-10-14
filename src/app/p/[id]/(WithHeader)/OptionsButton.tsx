"use client";

import { Ellipsis } from "@assets/Icons";
import { Navigate, OptionMenu } from "@components";
import BottomSheetTrigger from "@components/BottomSheet";
import { CloseAndTrigger, Popover } from "@components/FancyboxModal";
import ReportSheet from "@components/ReportSheet";
import OptionList, { NestedSheetTrigger } from "@components/ui/OptionList";
import useCurrentUser from "@store/user";
import { Drawer } from "vaul";

const OptionsButton = ({ author, id }: { author: string, id: string }) => {

    const { meta } = useCurrentUser();

    if (!meta) return null;

    else if (meta.user_id === author) return (
        <OptionMenu ButtonElement={<Ellipsis />}>
            <OptionList link={`${id}/edit`}>Edit</OptionList>
            <OptionList className="text-red-500">Delete</OptionList>
        </OptionMenu>
    )

    else return (
        <>
            <OptionMenu ButtonElement={<Ellipsis />}>
                <NestedSheetTrigger button="Report">
                    <ReportSheet id={id} type="post" />
                </NestedSheetTrigger>
                <OptionList>Block User</OptionList>
            </OptionMenu>
        </>
    )

}

export default OptionsButton;