export type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
// export { default as Image } from "next/image";
import Image from "next/image"
export {
  usePathname,
  useSearchParams,
  useRouter,
  useParams,
} from "next/navigation";

export { default as Link } from "next/link";

export { Image };
