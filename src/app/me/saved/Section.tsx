"use client";
import { InfiniteScroller, Navbar } from "@components";
import { CommentTile, PostTile } from "@components/ui";
import ListTile from "@components/ui/ListTile";
import { getSavedContent } from "@lib/helpers/common";
import { getQueryKeys, queryFunction } from "@lib/utils";

const SavedSection = ({ type, uid }: { type: "post" | "comment" | "list", uid: string }) => {

    const Component = type === "post" ? PostTile : type === "comment" ? CommentTile : ListTile;

    return (
        <>
            <Navbar navTitle={`saved ${type}`} />
            <section>
                <InfiniteScroller
                    Component={Component}
                    fetchData={(p) => queryFunction(getSavedContent, [uid, type, p])}
                    queryKeys={getQueryKeys(`saved_${type}s_uid`, { uid })}
                    notFoundMessage={{ title: "Oops! Nothing could be found.", paras: [`Save a ${type} to see it here`] }}
                />
            </section>
        </>
    )
}

export default SavedSection;