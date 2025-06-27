"use client"

import { InfiniteScroller } from "@components";
import ListTile, { UsersListTile } from "@components/ui/ListTile";
import { getListsOfUser } from "@lib/helpers/common";
import { generateInitialData, getQueryKeys, queryFunction } from "@lib/utils";
import useCurrentUser from "@store/user";
import { useQueryClient } from "@tanstack/react-query";
import { RequestedUser } from "@type/internal";
import { UsersListType } from "@type/other";

type Props = {
  username: string;
  page: number;
  filter: string;
};

const Lists = ({ filter, page, username }: Props) => {

  const queryClient = useQueryClient();

  const data = queryClient.getQueryData<RequestedUser>(getQueryKeys("user_username", { username }))

  const { user, lists } = useCurrentUser();
  if (!data) return null;

  const requestedUser = user?._id === data._id ? user : data;

  return (
    <>
      {user?._id === requestedUser._id &&
        <ul className="mb-2 space-y-2">
          {requestedUser.predefine_lists.map(({ _id, name, poster }) => (
            <li key={_id}>
              <UsersListTile _id={_id} name={name as UsersListType} poster={poster} />
            </li>
          ))}
          {["saved", "private"].map(l => (
            <li key={l}>
              <UsersListTile _id={l} name={l as UsersListType} />
            </li>
          ))}
        </ul>
      }

      <InfiniteScroller
        initialPage={page}
        className="space-y-2"
        queryKeys={getQueryKeys("listsOfUser_username_filter", { username, filter })}
        fetchData={(p) => queryFunction(getListsOfUser, [username, p, filter])}
        initialData={user?._id === requestedUser._id ? generateInitialData(lists) : undefined}
        Component={ListTile}
        NotFoundSection={null}
      />
    </>
  );
};

export default Lists;
