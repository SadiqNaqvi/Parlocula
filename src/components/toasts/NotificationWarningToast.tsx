import Navigate from "@components/Navigate"

const NotificationWarningToast = () => {

    return (
        <div className="p-2 space-y-2 border border-gray30">
            <h4>Push Notification is not enabled!</h4>
            <p>We will not be able to notify you with the updates related to you.</p>
            <Navigate comp="button" goto="/settings/notification" className="secondary w-full sm:w-fit">View</Navigate>
        </div>
    )

}

export default NotificationWarningToast;