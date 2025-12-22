"use client";

import { GenericWrapper, InfiniteScroller, Navbar } from "@components";
import LoginModal from "@components/fallbacks/LoginModal";
import { CheckTile, Form, Input, ToggleButton } from "@components/form";
import { ShowError } from "@components/ui";
import { getItems, getShelf } from "@lib/helpers/common";
import { editShelfMutation } from "@lib/helpers/mutations";
import { checkEditedFields, getPoster, getQueryKeys } from "@lib/utils";
import { useNavigation } from "@store/historystack";
import useCurrentUser from "@store/user";
import { FullShelf, ShelfItemType } from "@type/internal";

type Props = { id: string };

const ItemCheckTile = ({ _id, title, poster }: ShelfItemType) => (
    <CheckTile
        type="checkbox"
        label={title}
        name={_id}
        poster={getPoster({ external: true, type: "poster", path: poster, size: "w92" })}
    />
)

const getQueryProps = ({ id }: Props) => ({
    queryKeys: getQueryKeys("shelf_sid", { sid: id }),
    queryFn: getShelf,
    args: [id],
});

const ShelfEditPage = ({ id }: Props) => {

    const { meta } = useCurrentUser();
    const navigation = useNavigation();

    if (!meta) return (
        <LoginModal
            redirectTo={`/shelf/${id}/edit`}
            title="Edit Shelf"
        />
    );

    const Component = (data: FullShelf) => {

        const { _id, shelf_type } = data;

        if (meta.user_id !== data.user_id) return (
            <ShowError
                heading="You're not allowed to edit this shelf."
                errCode="unauthorized_access"
            />
        )

        const submit = (updatedData: { name: string, isPrivate: boolean } & { [key: string]: boolean }) => {

            const { name, isPrivate, ...items } = updatedData;

            const editedFields = checkEditedFields(
                { name: data.name, isPrivate: data.isPrivate },
                { name, isPrivate }
            );

            const itemsToDelete = Object.entries(items).filter(([_, v]) => v).map(([k]) => k);

            if (!(itemsToDelete.length || Object.keys(editedFields).length)) return;

            const errors = editShelfMutation(id, meta.user_id, { ...editedFields, itemsToDelete });
            if (errors) return errors;

            navigation.replace(`/shelf/${id}`);
        }

        return (
            <>
                <Navbar
                    navTitle="Edit Shelf"
                    OptionButton={
                        <button type="submit" className="primary">Update</button>
                    }
                />
                
                <Form submit={submit}>

                    <header className="space-y-4 mb-6">

                        {shelf_type === "custom" && (
                            <Input
                                name="name"
                                label="Name"
                                placeholder="Eg: Horror movies to watch"
                                required
                                defaultValue={data.name}
                            />
                        )}

                        {/* Recommended Shelfs cannot be private */}
                        {shelf_type !== "recommended" && (
                            <ToggleButton
                                name="isPrivate"
                                label="Private"
                                checked={data.isPrivate}
                            />
                        )}

                    </header>

                    <section>
                        <h2 className="text-lg mb-4">Select items to delete:</h2>
                        <InfiniteScroller
                            Component={ItemCheckTile}
                            queryKeys={getQueryKeys("itemsOfShelf_sid_filter", { sid: _id, filter: "latest" })}
                            fetchData={(p) => getItems(_id, meta.user_id, p, "latest")}
                        />
                    </section>
                </Form>
            </>
        )
    }

    return <GenericWrapper component={Component} getQueryProps={getQueryProps} props={{ id }} />
}

export default ShelfEditPage;