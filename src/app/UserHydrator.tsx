'use client';

import { setUserOnRefreshOrLogin } from '@lib/helpers/user';
import { getQueryClient } from '@lib/providers/queryClient';
import { getQueryKeys } from '@lib/utils';
import useCurrentUser from '@store/user';
import { CurrentUser, TokenPayload } from '@type/internal';
import { useEffect } from 'react';

const UserHydrator = ({ payload }: { payload: TokenPayload | null }) => {

    const { clearUser, user } = useCurrentUser();

    useEffect(() => {
        if (!payload) return clearUser();

        const { username } = payload;

        let cleanUpFunc: () => void;

        const queryClient = getQueryClient();
        const qkeys = getQueryKeys("user_username", { username });

        // This would return the user object or undefined. It would return undefined only if the user opened the web app offline.
        const prefetchedUser = queryClient.getQueryData<CurrentUser>(qkeys);

        // Update user hash with the freshly fetched user data.
        if (prefetchedUser) {
            cleanUpFunc = setUserOnRefreshOrLogin(prefetchedUser, payload.filterContent);
        }
        else {

            // For offline
            // The Local Storage (indexed db here) may got cleared but we know that the user exists.
            if (!user) return;

            cleanUpFunc = setUserOnRefreshOrLogin(user, payload.filterContent)
            queryClient.setQueryData(qkeys, user);
        }

        return cleanUpFunc;

    }, [payload, clearUser, user]);

    return null;
}

export default UserHydrator;
