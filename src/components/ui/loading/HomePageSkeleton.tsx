import { PostListSkeleton } from "./PostBarSkeleton";
import { NavbarSkeleton } from "./tools";
import { VerticalTaleonCardSkeletonList } from "./VerticalTaleonCardSkeleton";

const HomePageSkeleton = () => (
    <>
        <NavbarSkeleton removeBackButton />
        <PostListSkeleton count={2} />
        <VerticalTaleonCardSkeletonList className="px-2 my-2" />
        <PostListSkeleton count={2} />
    </>
)

export default HomePageSkeleton;