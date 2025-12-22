"use client"

import { InfiniteScroller } from "@components";
import { ShelfBar } from "@components/ui";
import { getShelvesOfUser } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";
import { RequestedUser } from "@type/internal";
import { PredefinedShelves } from "@type/models";

type Props = {
  user: RequestedUser;
  page: number;
  filter: string;
};

const PredefinedShelvesList = ({ user }: { user: RequestedUser }) => (
  <ul className="mb-2 space-y-2">

    {user.predefinedShelves.map(({ _id, name, poster }) => (

      <li key={_id}>

        <ShelfBar
          _id={_id}
          name={name}
          poster={poster}
          shelf_type={name as PredefinedShelves}
        />

      </li>

    ))}

  </ul>
)

const Shelves = ({ filter, page, user }: Props) => {

  const uid = user._id;

  return (
    <section>

      <PredefinedShelvesList user={user} />

      <InfiniteScroller
        initialPage={page}
        className="space-y-2"
        queryKeys={getQueryKeys("shelvesOfUser_uid_filter", { uid, filter })}
        fetchData={(p) => getShelvesOfUser(uid, p, filter)}
        Component={ShelfBar}
        NotFoundSection={<></>}
      />

    </section>
  );
};

export default Shelves;
