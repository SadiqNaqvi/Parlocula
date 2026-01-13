import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    condition: any;
    fallback?: React.ReactNode;
}>

const OptionalChildren = ({ condition, fallback, children }: Props) => Boolean(condition) ? children : fallback;

export default OptionalChildren;