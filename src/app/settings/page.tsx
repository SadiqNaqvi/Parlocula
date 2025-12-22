"use client";

import { RightChevron } from "@assets/Icons";
import { BottomSheet, Navbar, Navigate, WarningModal } from "@components";
import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import { logoutUser } from "@lib/helpers/mutations";
import { useNavigation } from "@store/historystack";
import useCurrentUser from "@store/user";
import { PropsWithChildren } from "react";

const SectionList = ({ children, href, className = '' }: PropsWithChildren<{ href?: string, className?: string }>) => {

    if (href) return (
        <li className={`px-2 *:py-3 ${className}`}>
            <Navigate comp="link" goto={href} className="size-full flex flex-cntr-between">
                <div>{children}</div>
                <RightChevron className="size-4" />
            </Navigate>
        </li>
    )

    return (
        <li className={`px-2 *:py-3 ${className}`}>
            {children}
        </li>
    )
}

const Sections = ({ heading, children }: PropsWithChildren<{ heading: string }>) => (
    <section className="rounded-md">
        <h2 className="uppercase text-sm text-semibold p-2">{heading}</h2>
        <ul className="bg-primarylight">{children}</ul>
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

            <Sections heading="my account">

                <SectionList href="edit">Edit Profile</SectionList>

                <SectionList href="edit/username">{user.username}</SectionList>

                <SectionList href="edit/email">
                    <p className="line-clamp-1">{user.email}</p>
                </SectionList>

                <SectionList href="account_status">Account Status</SectionList>
            </Sections>

            <Sections heading="saved">
                <SectionList href="saved">Saved Posts</SectionList>
                <SectionList href="saved/comments">Saved Comments</SectionList>
                <SectionList href="saved/shelves">Saved Shelves</SectionList>
            </Sections>

            <Sections heading="people">
                <SectionList href="followers">Followers</SectionList>
                <SectionList href="following">Following</SectionList>
                <SectionList href="blocked">Blocked</SectionList>
            </Sections>

            <Sections heading="personalize">
                <SectionList href="notifications">Notifications</SectionList>
                <SectionList href="filter_content">Filter Content</SectionList>
                <SectionList href="data_saver">Data Saver</SectionList>
                <SectionList href="theme">App Theme</SectionList>
            </Sections>

            <Sections heading="related to app">
                <SectionList href="report">Report a Problem</SectionList>
                <SectionList href="feedback">Submit a Feedback, Request or Suggestion</SectionList>
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
                <SectionList href="deactivate_account" className="text-red-500">Deactivate Account</SectionList>
                <SectionList href="delete_account" className="text-red-500">Delete Account</SectionList>
            </Sections>

        </>
    )
}

export default SettingPage;