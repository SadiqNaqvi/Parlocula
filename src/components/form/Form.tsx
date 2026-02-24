"use client";

import { OptionalChildren } from "@components/ui";
import LoadingSpinner from "@components/ui/loading/LoadingSpinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, HTMLAttributes, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ZodIssue } from "zod";

export type FormSubmitReturnType = { path: string, message: string }[] | string | false | null | void | undefined | ZodIssue[]

type FormProps = {
    schema?: any,
    submit: (data: any) => FormSubmitReturnType | Promise<FormSubmitReturnType>,
    defaultVals?: any
    hideLoading?: boolean,
    skipReset?: boolean;
} & HTMLAttributes<HTMLFormElement>

const FormContainer = ({ children, schema, submit, defaultVals, hideLoading, skipReset, ...args }: FormProps, ref?: React.LegacyRef<HTMLFormElement>) => {

    const formMethod = useForm({
        resolver: schema ? zodResolver(schema) : undefined,
        defaultValues: defaultVals
    });

    const { handleSubmit, setError, formState: { errors, isSubmitting }, reset, clearErrors } = formMethod;

    useEffect(() => { if(Object.keys(errors).length) console.log(errors) }, [errors]);

    const submitForm = async (data: any) => {
        clearErrors();
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
        } else if (!skipReset && errors !== false) reset();
    }


    return (
        <>
            <OptionalChildren condition={isSubmitting && !hideLoading}>
                <div style={{ margin: 0, padding: 0 }} className="fullScreen flex flex-cntr-all fixed customize inset-0 backdrop-brightness-[25%] z-[10] cursor-not-allowed">
                    <LoadingSpinner spinnerClassName="border-l-zinc-100" />
                </div>
            </OptionalChildren>
            <FormProvider {...formMethod}>
                <form ref={ref} {...args} onSubmit={handleSubmit(submitForm)}>
                    {children}
                    <OptionalChildren condition={errors.custom?.message}>
                        <p className="text-center text-red-500 text-sm my-4">{errors.custom?.message as string}</p>
                    </OptionalChildren>
                </form>
            </FormProvider>
        </>
    )
}

const Form = forwardRef(FormContainer);

Form.displayName = "Form";

export default Form;