"use client";

import { RightChevron } from "@assets/Icons";
import { BottomSheet, Navbar, Navigate, WarningModal } from "@components";
import { ParloFooter } from "@components/ui";
import InstallPrompt from "@components/ui/InstallPrompt";
import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import { logoutUser } from "@lib/helpers/mutations";
import { useNavigation } from "@store/historystack";
import useCurrentUser from "@store/user";
import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

const SectionList = ({ children, href, className = '' }: PropsWithChildren<{ href?: string, className?: string }>) => {

    if (href) return (
        <li className={twMerge("px-2 py-3", className)}>
            <Navigate comp="link" goto={href} className="size-full flex flex-cntr-between">
                <div>{children}</div>
                <RightChevron className="size-4" />
            </Navigate>
        </li>
    )

    return (
        <li className={`px-2 py-3 ${className}`}>
            {children}
        </li>
    )
}

const Sections = ({ heading, children }: PropsWithChildren<{ heading: string }>) => (
    <section className="space-y-3 mb-4 px-2 last:mb-0">
        <h2 className="parloHeading pl-2">{heading}</h2>
        <ul className="border rounded-lg border-gray30">{children}</ul>
    </section>
)

const SettingPage = () => {

    const { user, isHydrated } = useCurrentUser();
    const navigation = useNavigation();

    if (!isHydrated) return <FullPageLoadingSpinner path={["Settings"]} />
    else if (!user) return null;

    const handleLogout = () => {
        logoutUser();
        navigation.replace('/join')
    }

    return (
        <>
            <Navbar navTitle="Settings" />

            <InstallPrompt />

            <Sections heading="my account">

                <SectionList href="/settings/edit">Edit Profile</SectionList>

                <SectionList href="/settings/edit/username">{user.username}</SectionList>

                <SectionList href="/settings/edit/email">
                    <p className="line-clamp-1">{user.email}</p>
                </SectionList>

                <SectionList href="/settings/account_status">Account Status</SectionList>
            </Sections>

            <Sections heading="saved">
                <SectionList href="/settings/saved">Saved Posts</SectionList>
                <SectionList href="/settings/saved/comments">Saved Comments</SectionList>
                <SectionList href="/settings/saved/shelves">Saved Shelves</SectionList>
            </Sections>

            <Sections heading="people">
                <SectionList href="/settings/followers">Followers</SectionList>
                <SectionList href="/settings/following">Following</SectionList>
                <SectionList href="/settings/blocked">Blocked</SectionList>
            </Sections>

            <Sections heading="personalize">
                <SectionList href="/settings/notifications">Notifications</SectionList>
                <SectionList href="/settings/filter_content">Filter Content</SectionList>
                <SectionList href="/settings/data_saver">Data Saver</SectionList>
                <SectionList href="/settings/theme">App Theme</SectionList>
            </Sections>

            <Sections heading="related to app">
                <SectionList href="/settings/report">Report a Problem</SectionList>
                <SectionList href="/settings/feedback">Submit a Feedback, Request or Suggestion</SectionList>
                <SectionList href="/app/terms_and_conditions">Terms and Conditions</SectionList>
                <SectionList href="/app/privacy_policy">Privacy Policy</SectionList>
                <SectionList href="/app/about">About Parlocula</SectionList>
            </Sections>

            <Sections heading="actions for your account">
                <SectionList>
                    <BottomSheet button="Logout">
                        <WarningModal
                            action="logout"
                            dangerButton="Logout"
                            dangerFunc={handleLogout}
                        />
                    </BottomSheet>
                </SectionList>
                <SectionList href="/settings/deactivate_account" className="text-red-500">Deactivate Account</SectionList>
                <SectionList href="/settings/delete_account" className="text-red-500">Delete Account</SectionList>
            </Sections>
            <ParloFooter />
        </>
    )
}

export default SettingPage;