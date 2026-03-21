import { NotFound } from "@components/ui";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "4😅4",
}

const GlobalNotFoundPage = () => {

    return (
        <main className="overflow-hidden">
            <NotFound
                title="Oops! Looks like you came across a new path"
                paras={[
                    "It happens when you type the url by yourself or it could be a typo by us",
                    "Either ways, let's explore the rest of Parlocula"
                ]}
                redirectToExplore
                fullScreen
            />
        </main>
    )

}

export default GlobalNotFoundPage;