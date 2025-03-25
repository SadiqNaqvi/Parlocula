"use client";

import LoadingSpinner from "@components/ui/LoadingSpinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, HTMLAttributes, } from "react";
import { useForm, FormProvider } from "react-hook-form"
import { ZodIssue } from "zod";

type FormProps = {
    schema: any,
    submit: (data: any) => Promise<{ path: string, message: string }[] | string | null | void | undefined | ZodIssue[]>,
    defaultVals?: any
} & HTMLAttributes<HTMLFormElement>

const Form = forwardRef(({ children, schema, submit, defaultVals = {}, ...args }: FormProps, ref?: React.LegacyRef<HTMLFormElement>) => {

    const formMethod = useForm({
        resolver: zodResolver(schema),
        defaultValues: defaultVals
    });
    const { handleSubmit, setError, formState: { errors, isSubmitting } } = formMethod;

    const submitForm = async (data: any) => {
        if (isSubmitting) return;
        const errors = await submit(data);
        if (errors) {
            if (typeof errors === "string")
                setError("custom", { message: errors })
            else if (errors.length)
                errors.forEach((error) => {
                    if (typeof error.path === "string")
                        setError(error.path, { message: error.message })
                    else setError(error.path.join('.'), { message: error.message })
                })
        }
    }

    return (
        <>
            {isSubmitting &&
                <div className="absolute inset-0 backdrop-brightness-[25%] z-[10] cursor-not-allowed">
                    <LoadingSpinner />
                </div>
            }
            <FormProvider {...formMethod}>
                <form ref={ref} {...args} onSubmit={handleSubmit(submitForm)}>
                    {children}
                    {errors.custom &&
                        <p className="text-center text-red-500 text-sm my-4">{errors.custom.message as string}</p>
                    }
                </form>
            </FormProvider>
        </>
    )
})

export default Form;