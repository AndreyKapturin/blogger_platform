import { sendEmail } from "../utils/email/emailUtils"

const sendConfirmationCode = async (
  recipientAddress: string,
  confirmationCode: string
) => {
  return sendEmail(
    recipientAddress,
    'Email confirmation',
    _createConfurmationCodeMailHTML(confirmationCode)
  )
}

const _createConfurmationCodeMailHTML = (confirmationCode: string) => {
  return (
    `<h1>Thank for your registration</h1>
      <p>To finish registration please follow the link below:
      <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
    </p>`
  )
}

export { sendConfirmationCode }