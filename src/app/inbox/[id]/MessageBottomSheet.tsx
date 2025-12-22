import OptionList from "@components/ui/OptionList";
import { filterDocsInInfiniteQueryResult, sendMessage, unsendMessage } from "@lib/helpers/mutations";
import { getQueryKeys } from "@lib/utils";
import useGlobalStore from "@store/globalStore";
import { GenericDate, MereMessage, MessageReplyType } from "@type/internal";
import { MessageSchemaType } from "@type/schemas";
import { PropsWithChildren } from "react";
import { toast } from "sonner";

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

    const setReply = useGlobalStore<MessageReplyType | undefined>(`reply-${message?.room_id}`, undefined)[1];

    if (!message) return null;

    const { status, content, room_id, user_id, _id, createdAt } = message;
    const isCurrent = user_id === uid;


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
        sendMessage(room_id, user_id, message);

        close();
    }

    const handleReply = () => {
        setReply({ replied_content: content, replied_to: _id });

        close();
    }

    const handleUnsend = () => {
        unsendMessage(room_id, _id, user_id);

        close();
    }

    // To remove messages that couldn't sync because of error
    const handleRemoveMessgage = () => {
        filterDocsInInfiniteQueryResult(
            getQueryKeys("messages_rmid", { rmid: room_id }),
            [_id]
        );

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