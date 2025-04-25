"use client";

import { ListForm, Modal } from "@components";
import { useState } from "react";

const SaveAsList = ({ title, medias }: { title: string, medias: any[] }) => {

    const [open, toggle] = useState(false);

    return (
        <>
            <button className="primary" onClick={() => toggle(true)}>Save As List</button>
            <Modal open={open} close={() => toggle(false)}>
                <ListForm defaultVals={{ name: title }} medias={medias} />
            </Modal>
        </>
    )
}

export default SaveAsList;