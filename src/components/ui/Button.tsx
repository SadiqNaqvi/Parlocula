import { Attributes, ButtonHTMLAttributes, DetailedHTMLProps, HTMLAttributes } from "react";

type Props = {
    title: string
} & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>


const Button = ({ id, title, children, ...args }: Props) => (
    <button
        aria-label={title}
        title={title}
        id={id}
        data-testid={id}
        {...args}
    >
        {children}
    </button>
)

export default Button;