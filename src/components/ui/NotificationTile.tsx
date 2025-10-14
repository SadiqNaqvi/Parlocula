import Navigate from "@components/Navigate";
import { NotificationType } from "@type/schemas";

const NotificationTile = ({ message, type, request_type, status }: NotificationType) => {
    return (
        <article className="px-2 py-4 wrap-anywhere">
            <p>
                {message.map((m, i) => {
                    if (m.type === "text") return m.text + ' ';
                    else return <Navigate key={i} comp="link" className="no-underline inline font-semibold" goto={m.path}>{m.label + ' '}</Navigate>
                })}
            </p>
            <div>
                {type === "request" && status === "pending" && (
                    <div className="flex mt-4 gap-2">
                        <button className="flex-1 primary">Accept</button>
                        <button className="flex-1 secondary">Deny</button>
                    </div>
                )}
                {type === "request" && status !== "pending" && (
                    <p className={`text-sm ${status === "accepted" ? "text-green-500" : "text-red-500"}`}>Status: {status}</p>
                )}
            </div>
        </article>
    )
}

export default NotificationTile;