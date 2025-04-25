import { AddIcon, SendIcon, XmarkIcon } from "@assets/Icons";
import { useCustomReducer } from "@lib/hooks";
import GiphyComponent from "./GiphyComponent";
import OptionMenu from "./OptionMenu";
import { createCommentOnPost } from "@lib/helpers/client";
import toast from "react-hot-toast";

type Props = {
    post_id: string;
    post_author: string;
    user?: any,
    reply: { replied_to: string, parent: string } | null,
    removeReply: () => void,
    callback: (arg: any) => void,
}

const ToggleButton = ({ label, state, callback }: { label: string, state: boolean, callback: () => void }) => {
    return (
        <button onClick={callback} className="w-full flex gap-4 flex-cntr-between px-4 py-2 capitalize">
            <span>{label}</span>
            <div className={`p-1 border ${state ? "border-secondary" : "border-gray40"} w-12 rounded-3xl flex ${state ? "justify-end" : "justify-start"}`}>
                <span className={`size-4 rounded-full ${state ? "bg-secondary" : "bg-gray-500"}`}></span>
            </div>
        </button>
    )
}

const CommentInput = ({ reply, user, removeReply, callback, post_id, post_author }: Props) => {

    if (!user) return (
        <footer className="py-4 bg-primary fixed bottom-0 max-w-screen-md w-full">
            <p className="text-center">You need to log-in to post a comment</p>
        </footer>
    )

    const { chosenGif, isGiphyOpened, nsfw, setter, spoiler } = useCustomReducer({
        isGiphyOpened: false,
        chosenGif: "",
        nsfw: false, spoiler: false
    });

    const getGIF = (data: any) => {
        setter({ chosenGif: data.images.fixed_height.webp, isGiphyOpened: false });
    }

    const postComment = async (e: React.FormEvent<HTMLFormElement> & { target: { reset: () => void, comment: { value: string } } }) => {
        e.preventDefault();
        e.stopPropagation();
        const content = e.target.comment.value;
        if (content.length < 2 && !chosenGif) return;
        const date = new Date();
        const comment = {
            post_author,
            post_id,
            content,
            upvote_count: 0,
            createdAt: date,
            updatedAt: date,
            attachment: chosenGif,
            nsfw, spoiler,
            ...reply
        };
        callback({
            ...comment,
            username: "user.username",
        });
        e.target.reset();
        setter({ chosenGif: '', nsfw: false, spoiler: false });
        const error = await createCommentOnPost(comment);
        console.log(error);
        if (error) toast.error(error);
    }

    return (
        <footer className="mt-4 py-2 bg-primary sticky -mb-20 bottom-0 max-w-screen-md w-full">
            {isGiphyOpened &&
                <section
                    onClick={() => setter({ isGiphyOpened: false })}
                    className="fixed inset-0 z-[11] backdrop-brightness-[0.25] flex flex-cntr-all">
                    <GiphyComponent callback={getGIF} />
                </section>
            }
            {reply &&
                <div className="flex gap-3 text-sm flex-cntr-between px-4 py-2 rounded-t-md border border-b-0 border-gray30">
                    <p className="line-clamp-1">
                        {reply.parent}
                    </p>
                    <button
                        onClick={removeReply}
                        className="smallBtn px-2 py-1 rounded-full bg-gray10"
                    >
                        <XmarkIcon classnames="size-3" />
                    </button>
                </div>
            }
            <div className="border-t space-y-3 pt-2 border-gray30">
                {chosenGif && (
                    <section>
                        <div className="relative w-fit">
                            <button
                                onClick={() => setter({ chosenGif: "" })}
                                className="smallBtn size-6 flex flex-cntr-all border border-gray30 bg-primary rounded-full absolute top-0 right-0 mt-1 mr-1">
                                <XmarkIcon classnames="size-3" />
                            </button>
                            <img src={chosenGif} alt="Chosen GIF" className="size-24 rounded-md border border-gray30" />
                        </div>
                    </section>
                )}
                <div className="flex items-center gap-2">
                    <OptionMenu controls="auto" ButtonElement={<AddIcon />} className="smallBtn border border-gray30 rounded-full p-2">
                        <li className="border-b border-gray20">
                            <button className="w-full py-2 px-4" onClick={() => setter({ isGiphyOpened: true })}>Gif</button>
                        </li>
                        <li className="border-b border-gray20">
                            <ToggleButton label="NSFW" state={nsfw} callback={() => setter({ nsfw: !nsfw })} />
                        </li>
                        <li className="border-b border-gray20">
                            <ToggleButton label="Spoiler" state={spoiler} callback={() => setter({ spoiler: !spoiler })} />
                        </li>
                    </OptionMenu>
                    <form
                        onSubmit={postComment}
                        className={`flex w-full items-center px-2 gap-2`}
                    >
                        <input
                            autoFocus
                            placeholder="Write you comment here..."
                            className={`bg-transparent flex-1 py-3`}
                            name="comment"
                        />
                        <button>
                            <SendIcon classnames="size-4 color-secondary" />
                        </button>
                    </form>
                </div>
            </div>
        </footer>
    )
}

export default CommentInput;