import { Navigate } from "@components";
import { getUserFromToken } from "@lib/auth/utils";
import generateDynamicMetadata from "@lib/seo/metadata";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = generateDynamicMetadata({}, true);

const IndexPage = async () => {

  const user = await getUserFromToken(await cookies());
  if (user) redirect('/home');

  return (
    <>
      <div className="patternBackground"></div>
      <header className="size-screen px-4 relative flex gap-4 flex-col flex-cntr-all">
        <div>
          <h1 className="text-4xl font-semibold text-center">Parlocula</h1>
          <p className="text-center">The Cinematic Planet</p>
        </div>

        <div className="flex gap-2 flex-col sm:flex-row fixed sm:static bottom-0 w-full sm:w-fit sm:mx-auto p-4 bg-zinc-500/40 sm:bg-transparent rounded-t-md">
          <Navigate
            comp="link"
            goto="/join"
            type="button"
            data-testid="join-button"
            className="btn primary">
            Join as a Fan
          </Navigate>
          <Navigate
            comp="link"
            goto="/home"
            type="button"
            data-testid="join-as-guest-button"
            className="btn secondary">
            Explore as Guest
          </Navigate>
        </div>
      </header>
    </>
  );
}

export default IndexPage;
