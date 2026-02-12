"use client";

import { CheckBoxIcon, EmptyBoxIcon } from "@assets/Icons";
import { Navigate } from "@components";
import { BlogHeading1, BlogHeading3, BlogList, BlogSection, BlogSubSection } from "@components/blog";
import { RefObject, useRef, useState } from "react";

type ReasonProps = {
    title: string,
    description: {
        preList?: string,
        descriptions?: string[],
        postList?: string,
    } | undefined,
    href?: string,
    buttonLabel?: string,
}

const Reason = ({ description, title, active, href, buttonLabel, textareaRef, onClick }: ReasonProps & { textareaRef?: RefObject<HTMLTextAreaElement>, active: boolean, onClick: (reason: string) => void }) => {

    const handleClick = () => {
        onClick(title);
    }

    if (description) return (
        <li className="p-2 border border-gray20">

            <button
                onClick={handleClick}
                className="flex flex-cntr-between gap-2">
                <span>{title}</span>
                <span>
                    {active ? (
                        <CheckBoxIcon />
                    ) : (
                        <EmptyBoxIcon />
                    )}
                </span>
            </button>

            <BlogSubSection className={active ? "block" : "hidden"}>

                {description.preList && (
                    <p>{description.preList}</p>
                )}

                {description.descriptions && (
                    <ul>
                        {description.descriptions.map((desc, i) => (
                            <BlogList key={i}>{desc}</BlogList>
                        ))}
                    </ul>

                )}{description.postList && (
                    <p>{description.postList}</p>
                )}

                {href && buttonLabel && (
                    <div className="py-2">
                        <Navigate comp="link" goto={href} className="w-full sm:w-fit sm:mx-auto border border-gray30 bg-gray20">
                            {buttonLabel}
                        </Navigate>
                    </div>
                )}
            </BlogSubSection>
        </li>
    )

    return (
        <li className="p-2 border border-gray20">
            <button
                onClick={handleClick}
                className="flex flex-cntr-between gap-2">
                <span>{title}</span>
                <span>
                    {active ? (
                        <CheckBoxIcon />
                    ) : (
                        <EmptyBoxIcon />
                    )}
                </span>
            </button>
            <div className={active ? "block" : "hidden"}>
                <textarea
                    ref={textareaRef}
                    className="w-full min-h-12"
                    placeholder="Please at least give us some idea on why are you leaving Parlocula." />
            </div>
        </li>
    )
}

const listOfReasons: ReasonProps[] = [
    {
        title: "I need a break from social media.",
        description: {
            preList: "Try deactivating your account.",
            postList: "Your profile becomes invisible, you stop receiving notifications, and you can return anytime without losing your data."
        },
        buttonLabel: "Deactivate",
        href: "/settings/deactivate_account",
    },
    {
        title: "I'm not enjoying the content I see.",
        description: {
            preList: "Improve your feed by:",
            descriptions: [
                "Following threads and taleons you care about",
                "Unfollowing content you don't like",
                "Adding taleons you like in Favourite Shelf",
                "Enabling/Disabling Content Filtering",
            ],
            postList: "Your experience becomes more personal with just a few tweaks."
        },
        buttonLabel: "Explore content you may like",
        href: "/explore"
    },
    {
        title: "I'm getting unwanted messages or requests.",
        description: {
            preList: "On Parlocula, nobody can message you directly without sending a request first. But still you can:",
            descriptions: [
                "Decline message requests",
                "Block the sender",
                "Report violations",
            ],
            postList: "This prevents harassment before it begins. But if this continues, report us with screenshots and with their username.",
        },
    },
    {
        title: "I'm receiving negative or rude interactions.",
        description: {
            preList: "To maintain a healthier experience:",
            descriptions: [
                "Block or report users",
                "Mute threads or topics",
                "Use Content Filteration to control what you see",
            ],
            postList: "You don't need to delete your account to protect your peace.",
        },
        buttonLabel: "Filter Content",
        href: "/settings/filter_content"
    },
    {
        title: "I don't like how my profile looks / I want to start fresh.",
        description: {
            preList: "You can simply:",
            descriptions: [
                "Update your name, username, or profile picture",
                "Edit or delete posts",
                "Remove older comments or reactions",
                "Clean your shelves",
            ],
            postList: "You don't need a brand-new account — just refresh the one you have.",
        },
        buttonLabel: "Edit Profile",
        href: "/settings/edit"
    },
    {
        title: "I have too many shelves / too much clutter.",
        description: {
            preList: "You can:",
            descriptions: [
                "Delete old shelves",
                "Merge content",
                "Just ignore old shelves",
                "Use system shelves for tracking your journey",
            ],
            postList: "A quick cleanup is easier than starting from zero.",
        },
        buttonLabel: "Let's clean your shelves",
        href: "/shelf"
    },
    {
        title: "My feed is full of NSFW contents.",
        description: {
            preList: "You can:",
            descriptions: [
                "Enable Content Filtering",
                "Leave Threads or Users who post NSFW content",
            ],
            postList: "No need to delete your account — just protect your viewing experience.",
        },
        buttonLabel: "Filter Content",
        href: "/settings/filter_content"
    },
    {
        title: "I accidentally followed the wrong threads or communities.",
        description: {
            preList: "Simply leave or mute them",
            postList: "Your feed resets to what you actually like.",
        },
        buttonLabel: "Mute Threads",
        href: "/thread/joined"
    },
    {
        title: "I'm concerned about my data.",
        description: {
            preList: "Parlocula does not sell or share your data with third parties.",
        }
    },
    {
        title: "I have multiple accounts.",
        description: {
            preList: "You can simply deactivate the ones you don't use and keep your main account active.",
        }
    },
    {
        title: "I don't feel connected to the Parlocula community.",
        description: {
            preList: "Try following:",
            descriptions: [
                "Genres you love",
                "Artists you admire",
                "Characters or universes you're passionate about",
                "New threads created by people with similar tastes",
            ],
            postList: "Parlocula grows stronger as you explore it.",
        },
        buttonLabel: "Let's Explore Together",
        href: "/explore"
    },
    {
        title: "I made a post/comment I regret.",
        description: {
            preList: "You can delete or edit them individually without deleting your entire account.",
        }
    },
    {
        title: "Something else",
        description: undefined,
    }
]

const ReasonSection = ({ callback }: { callback: (reason: string) => void }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const returnReason = () => {
        if (!selectedReason) return;
        else if (selectedReason === "Something else") {
            if (!textareaRef.current) return;
            callback(textareaRef.current.innerText || "")
        } else {
            callback(selectedReason);
        }
    }

    return (
        <>
            <header>
                <BlogHeading1>Why Are You Deleting Your Account?</BlogHeading1>
                <BlogSubSection>
                    <BlogHeading3>Help us understand what{"'"}s going on</BlogHeading3>
                    <p>Before you delete your account, tell us what made you consider leaving Parlocula.</p>
                </BlogSubSection>
            </header>

            <BlogSection>
                <p>Choosing a reason may reveal solutions that can fix your problem without losing your account forever.</p>
                <ul>
                    {listOfReasons.map((reason) => (
                        <Reason
                            {...reason}
                            active={reason.title === selectedReason}
                            onClick={setSelectedReason}
                            key={reason.title}
                            textareaRef={textareaRef}
                        />
                    ))}
                </ul>
            </BlogSection>

            <footer className="px-2 py-4">
                <button className="primary w-full sm:w-fit sm:mx-auto" disabled={!selectedReason.length} onClick={returnReason}>
                    Continue
                </button>
            </footer>
        </>
    )
}

export default ReasonSection;
