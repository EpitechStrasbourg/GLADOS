import { Logger } from "@/lib/logger"

const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "epitechDiscordBot@gmail.com",
    pass: "hxbdgtpckzlcrjhg",
  },
})

export default async (to: string, verificationCode: number) => {
  const mailOptions = {
    from: "epitechDiscordBot@gmail.com",
    to: to,
    subject: "Verification - Epitech Roles Manager",
    text: "Here is your code: " + verificationCode,
  }

  transporter.sendMail(mailOptions, function (error: any, info: any) {
    if (error) {
      Logger.error("error", `Error sending email: ${error}`)
      return 84
    } else {
      Logger.debug("info", `Email sent: ${info.response}`)
      return 0
    }
  })
}
