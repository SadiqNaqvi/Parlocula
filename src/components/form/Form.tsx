"use client";

import LoadingSpinner from "@components/ui/LoadingSpinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, HTMLAttributes, } from "react";
import { useForm, FormProvider } from "react-hook-form"
import { ZodIssue } from "zod";

export type FormSubmitReturnType = { path: string, message: string }[] | string | null | void | undefined | ZodIssue[]

type FormProps = {
    schema?: any,
    submit: (data: any) => FormSubmitReturnType | Promise<FormSubmitReturnType>,
    defaultVals?: any
    hideLoading?: boolean
} & HTMLAttributes<HTMLFormElement>

const FormContainer = ({ children, schema, submit, defaultVals, hideLoading, ...args }: FormProps, ref?: React.LegacyRef<HTMLFormElement>) => {

    const formMethod = useForm({
        resolver: schema ? zodResolver(schema) : undefined,
        defaultValues: defaultVals
    });

    const { handleSubmit, setError, formState: { errors, isSubmitting }, reset } = formMethod;

    const submitForm = async (data: any) => {
        if (isSubmitting) return;
        const errors = await submit(data);
        if (errors) {
            if (Array.isArray(errors))
                errors.forEach((error) => {
                    if (typeof error.path === "string")
                        setError(error.path, { message: error.message })
                    else setError(error.path.join('.'), { message: error.message })
                })
            else setError("custom", { message: errors })
        } else reset();
    }

    return (
        <>
            {isSubmitting && !hideLoading && (
                <div style={{ margin: 0, padding: 0 }} className="fixed inset-0 backdrop-brightness-[25%] z-[10] cursor-not-allowed">
                    <LoadingSpinner />
                </div>
            )}
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
}

const Form = forwardRef(FormContainer)

export default Form;