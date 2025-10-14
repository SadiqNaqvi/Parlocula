import OptionList from "@components/ui/OptionList";
import { removeMessageFromClient, useRemoveMessage, useRetryMessage } from "@lib/helpers/room/client";
import useGlobalState from "@store/globalStore";
import { GenericDate, MereMessage, MessageReplyType } from "@type/internal";
import { MessageSchemaType } from "@type/schemas";
import { PropsWithChildren } from "react";
import toast from "react-hot-toast";

const MessageDetailsSection = ({ createdAt, content, status, children }: PropsWithChildren<{ createdAt: GenericDate, content: string, status: string | undefined }>) => {

    return (
        <aside className="p-4 mb-2">
            <section className="bg-primarylight rounded-md p-3 mb-4">
                <ul className="flex gap-2 text-sm text-zinc-500">
                    <li>{new Date(createdAt).toLocaleString()}</li>
                    {status && (
                        <>
                            <li>•</li>
                            {/* <li>~</li> */}
                            <li>{status}</li>
                        </>
                    )}
                </ul>
                <div className="mt-3 line-clamp-2">{content}</div>
            </section>
            <ul className="bg-primarylight rounded-md py-4">{children}</ul>
        </aside>
    )

}

type Props = {
    message: MessageSchemaType & MereMessage | undefined,
    uid: string,
    close: () => void
}

const MessageBottomSheet = ({ uid, message, close }: Props) => {

    if (!message) return null;

    const { status, content, room_id, user_id, _id, createdAt } = message;
    const isCurrent = user_id === uid;

    const retry = useRetryMessage();
    const setReply = useGlobalState<MessageReplyType | undefined>(`reply-${room_id}`, undefined)[1];
    const unsendMutation = useRemoveMessage();

    const handleCopy = () => {
        if (navigator && "clipboard" in navigator) {
            navigator.clipboard.writeText(content)
                .then(() => toast.success("Content copied to clipboard"));
        } else {
            toast.error("Unable to copy text to clipboard");
        }

        close();
    }

    const handleRetry = () => {
        retry.mutate({ message, rmid: room_id, uid: user_id });

        close();
    }

    const handleReply = () => {
        setReply({ replied_content: content, replied_to: _id });

        close();
    }

    const handleUnsend = () => {
        unsendMutation.mutate({ msgid: _id, rmid: room_id, uid: user_id });

        close();
    }

    // To remove messages that couldn't sync because of error
    const handleRemoveMessgage = () => {
        removeMessageFromClient(_id, room_id);

        close();
    }

    if (!isCurrent) return (
        <MessageDetailsSection content={content} status={status} createdAt={createdAt}>
            <OptionList onClick={handleCopy}>Copy Text</OptionList>
            <OptionList onClick={handleReply}>Reply</OptionList>
        </MessageDetailsSection>
    )

    if (status === "sending") return (
        <MessageDetailsSection content={content} status={status} createdAt={createdAt}>
            <OptionList onClick={handleCopy}>Copy Text</OptionList>
        </MessageDetailsSection>
    )

    else if (status === "error") return (
        <MessageDetailsSection content={content} status={status} createdAt={createdAt}>
            <OptionList onClick={handleRetry}>Retry</OptionList>
            <OptionList onClick={handleRemoveMessgage}>Unsend</OptionList>
            <OptionList onClick={handleCopy}>Copy Text</OptionList>
        </MessageDetailsSection>
    )

    else return (
        <MessageDetailsSection content={content} status={status} createdAt={createdAt}>
            <OptionList onClick={handleReply}>Reply</OptionList>
            <OptionList onClick={handleCopy}>Copy Text</OptionList>
            <OptionList onClick={handleUnsend}>Unsend</OptionList>
        </MessageDetailsSection>
    )

}

export default MessageBottomSheet;