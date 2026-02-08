'use client';

import { setUserOnRefreshOrLogin } from '@lib/helpers/user';
import { getQueryClient } from '@lib/providers/queryClient';
import { getQueryKeys } from '@lib/utils';
import useCurrentUser from '@store/user';
import { CurrentUser, TokenPayload } from '@type/internal';
import { useEffect } from 'react';

const UserHydrator = ({ payload, currentUser }: { payload: TokenPayload | null, currentUser: CurrentUser | null }) => {

    const { user, meta } = useCurrentUser();

    // useEffect(() => console.log("user in userHydrator", user), [user]);
    // useEffect(() => console.log("meta in userHydrator", meta), [meta]);

    useEffect(() => {
        if (!payload) return;

        const { username } = payload;

        const queryClient = getQueryClient();
        const qkeys = getQueryKeys("user_username", { username });
        let userToStore: CurrentUser | null = null;

        // Update user hash with the freshly fetched user data.
        if (currentUser) {
            userToStore = currentUser;
        }
        else {

            // For offline
            // The Local Storage (indexed db here) may got cleared but we know that the user exists.
            if (!user) return;

            userToStore = user;
            queryClient.setQueryData(qkeys, user);
        }

        return setUserOnRefreshOrLogin(userToStore, payload.filterContent)

    }, []);

    return null;
}

export default UserHydrator;
