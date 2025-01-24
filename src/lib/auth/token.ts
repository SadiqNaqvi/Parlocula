import jwt, { Secret } from "jsonwebtoken";
import { cookies } from "next/headers";

export const generateToken = (details: any) => {
  const token = jwt.sign(details, process.env.JWT_SECRET as Secret, {
    expiresIn: "1h",
  });
  cookies().set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  return token;
};

export const verifyToken = (token: string) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as Secret, {
      ignoreExpiration: true,
    });
    return payload;
  } catch (err) {
    console.log("Error verifying token:", err);
    return null;
  }
};
