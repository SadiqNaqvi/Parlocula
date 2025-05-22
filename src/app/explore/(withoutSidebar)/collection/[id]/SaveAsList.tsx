"use client";

import { ListForm, Modal } from "@components";

const SaveAsList = ({ title, medias }: { title: string, medias: any[] }) => {

    return (
        <>
            <Modal buttonChildren="Save As List" className="primary" id="save-as-list" >
                <ListForm defaultVals={{ name: title }} medias={medias} />
            </Modal>
        </>
    )
}

export default SaveAsList;