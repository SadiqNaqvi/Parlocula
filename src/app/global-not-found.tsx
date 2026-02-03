import { Navbar } from "@components"
import { NotFound } from "@components/ui"
import { Metadata } from "next"
import "@/app/globals.css";

export const metadata: Metadata = {
    title: "4😅4 - Parlocula",
}

const GlobalNotFoundPage = () => {

    return (
        <html lang="en">
            {/* {*<body className={`${fontFam.className}`}>} */}
            <body>
                <main className="flex flex-col overflow-hidden">
                    <Navbar />
                    <div className="flex-1 flex flex-cntr-all px-2 sm:px-0">
                        <NotFound
                            title="Oops! Looks like you came across a new path"
                            paras={[
                                "It happens when you type the url by yourself or it could be a typo by us",
                                "Either ways, let's explore the rest of Parlocula"
                            ]}
                            redirectToExplore
                        />
                    </div>
                </main>
            </body>
        </html>
    )

}

export default GlobalNotFoundPage;