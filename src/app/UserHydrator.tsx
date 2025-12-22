'use client';

import { setUserOnRefreshOrLogin } from '@lib/helpers/user';
import { getQueryClient } from '@lib/providers/queryClient';
import { getQueryKeys } from '@lib/utils';
import useCurrentUser, { UserMetaData } from '@store/user';
import { TokenPayload, User as UserType } from '@type/internal';
import { useEffect } from 'react';

const UserHydrator = ({ user }: { user: TokenPayload | null }) => {

    const { clearUser, getUserFromHash } = useCurrentUser();

    useEffect(() => {
        if (!user) return clearUser();

        const { username } = user;

        let cleanUpFunc: () => void;

        const queryClient = getQueryClient();
        const qkeys = getQueryKeys("user_username", { username });

        // This would return the user object or undefined. It would return undefined only if the user opened the web app offline.
        const prefetchedUser = queryClient.getQueryData<UserType>(qkeys);

        // Update user hash with the freshly fetched user data.
        if (prefetchedUser) {
            cleanUpFunc = setUserOnRefreshOrLogin(prefetchedUser, user.filterContent);
        }
        else {
            // For offline
            const localUser = getUserFromHash();

            // The Local Storage (indexed db here) may got cleared but we know that the user exists.
            if (!localUser) return;

            cleanUpFunc = setUserOnRefreshOrLogin(localUser, user.filterContent)
            queryClient.setQueryData(qkeys, localUser);
        }

        return cleanUpFunc;

    }, [user, clearUser, getUserFromHash]);

    return null;
}

export default UserHydrator;
