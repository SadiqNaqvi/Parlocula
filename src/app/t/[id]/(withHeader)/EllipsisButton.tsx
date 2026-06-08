"use client";

import { Ellipsis } from "@assets/Icons";
import { OptionMenu } from "@components";
import ReportSheet from "@components/sheets/ReportSheet";
import OptionList, { NestedSheetTrigger } from "@components/ui/OptionList";
import useCurrentUser from "@store/user";

type Props = {
    creator: string,
    tid: string,
}

const EllipsisButton = ({ creator, tid }: Props) => {

    const { meta } = useCurrentUser();

    if (!meta) return null;

    else if (meta.user_id === creator) return (
        <OptionMenu
            buttonTitle="View Options"
            ButtonElement={<Ellipsis />}
        >
            <OptionList link={`${tid}/settings/edit`}>Edit</OptionList>
        </OptionMenu>
    )

    else return (
        <OptionMenu
            buttonTitle="View Options"
            ButtonElement={<Ellipsis />}
        >
            <NestedSheetTrigger button="Report">
                <ReportSheet uid={meta.user_id} id={tid} type="thread" ext_id={undefined} />
            </NestedSheetTrigger>
        </OptionMenu>
    )

}

export default EllipsisButton;