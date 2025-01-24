"use client";

import LoadingSpinner from "@components/ui/LoadingSpinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, HTMLAttributes, } from "react";
import { useForm, FormProvider } from "react-hook-form"

type FormProps = {
    schema: any,
    submit: (data: any) => Promise<{ path: string, message: string }[] | null | void>,
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
        if (errors && errors.length)
            errors.forEach((error) => setError(error.path, { message: error.message }))
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