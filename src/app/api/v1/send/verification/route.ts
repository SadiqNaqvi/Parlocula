import { render } from "@react-email/components";
import { randomInt } from "crypto";
import { createTransport } from "nodemailer";
import EmailVerification from "@components/EmailTemplate/EmailVerification";

export const POST = async () => {

  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const code = randomInt(100000, 1000000);

  const emailHtml = await render(
    EmailVerification({ verificationCode: `${code}` })
  );

  const options = {
    from: process.env.GOOGLE_EMAIL,
    to: "naqvisadiq6@gmail.com",
    subject: "Verify your email",
    html: emailHtml,
  };

  await transporter.sendMail(options);
};
