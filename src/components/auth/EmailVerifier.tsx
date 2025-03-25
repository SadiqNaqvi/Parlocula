import { LeftChevron } from "@assets/Icons";
import { Form, Input } from "@components/form";
import { useCustomReducer } from "@lib/hooks";
import { emailSchema } from "@lib/schemas";
import { z } from "zod";

const schema = z.object({
    email: emailSchema,
});

const EmailVerifier = ({ callback }: { callback: (email: string) => Promise<string | undefined> }) => {

    const { email, otp, expiry, canSendOTP, otpCount, error, page, setter } = useCustomReducer({
        email: "", otp: 0, expiry: 0, canSendOTP: true, otpCount: 0, error: "", page: 0
    });

    const setError = (error: string) => {
        setter({ error })
        setTimeout(() => setter({ error: "" }), 1000 * 10);
    }

    const otpSchema = z.object({
        otp: z.string()
            .min(6, "Invalid OTP! Please enter 6 digit OTP")
            .transform((val) => parseInt(val))
            .refine(val => !isNaN(val), "Invalid OTP! Please enter a valid OTP")
            .refine(() => new Date(expiry) > new Date(), "The sent OTP has expired! Please resend OTP")
    });

    const verifyOTP = async (data: { otp: number }) => {
        const otpInput = data.otp;
        if (otpInput !== otp) {
            if (otpCount >= 3)
                return "Unable to verify your email. Please try again after 24 hours.";
            else {
                setter({ otpCount: 2 });
                return "Wrong OTP! Please resend the OTP and try again.";
            }
        }
        return await callback(email);
    }

    const sendOTP = () => {
        if (otpCount >= 3) {
            setError("You've already reached your OTP limits for today. Try again in 24 hours.");
            return;
        };

        // Save this otp count somewhere
        setter({ canSendOTP: false, otpCount: otpCount + 1 });
        setTimeout(() => setter({ canSendOTP: true }), 1000 * 60 * 2);

        //Send 6 Digit otp to the user to verify their email.
        setter({ otp: 123321, expiry: Date.now() + 1000 * 60 * 5 });
    }

    const submit = async (data: any) => {
        setter({ email: data.email, page: 1 });
        sendOTP();
    }

    return (
        <>
            {page ?
                <>
                    <div className="flex mb-2 gap-4">
                        <button className="iconBtn my-auto" onClick={() => setter({ page: 0 })}>
                            <LeftChevron />
                        </button>
                        <h2 className="text-3xl text-center font-semibold">Verify Your Email</h2>
                    </div>
                    <p className="mb-8 text-center text-sm text-zinc-500">Enter 6 digit verification code that has been sent to {email}</p>

                    <Form schema={otpSchema} submit={verifyOTP}>
                        <Input
                            maxLength={6}
                            name="otp"
                            placeholder="XXXXXX"
                            autoFocus
                        />
                        <button className="primary w-full mt-4">Verify</button>
                    </Form>
                    <div className="my-4">
                        {otpCount < 3 ?
                            canSendOTP ?
                                <button className="text-center smallBtn w-full" onClick={sendOTP}>Resend OTP</button>
                                :
                                <p className="text-sm text-center text-slate-500">You can resend an OTP in 2 mins.</p>
                            :
                            <p className="text-sm text-center">You've reached the limit to send OTPs for now. Please try again after an hour.</p>
                        }
                    </div>
                    <div className="my-4">
                        {error &&
                            <p className="text-sm text-center text-red-500">{error}</p>
                        }
                    </div>
                </>
                :
                <>
                    <h2 className="text-3xl uppercase text-center mb-8">Welcome</h2>
                    <Form
                        className="space-y-4"
                        submit={submit}
                        schema={schema}>
                        <Input
                            name="email"
                            defaultValue={email}
                            autoFocus
                            type="email"
                            className="bg-transparent w-full"
                            placeholder="Email"
                        />
                        <button className="primary w-full">Continue</button>
                    </Form>
                </>
            }
        </>
    )
}

export default EmailVerifier;