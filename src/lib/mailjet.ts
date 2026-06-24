import { Client } from "node-mailjet";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type MailjetMessage = {
  From: { Email: string; Name: string };
  To: { Email: string }[];
  Subject: string;
  TextPart: string;
  HTMLPart: string;
};

type MailjetSendResponse = {
  Messages?: {
    Status?: string;
    Errors?: { ErrorMessage?: string }[];
  }[];
};

type MailjetConfigOk = {
  apiKey: string;
  secretKey: string;
  fromEmail: string;
  fromName: string;
};

function getMailjetConfig():
  | { error: string }
  | MailjetConfigOk {
  const apiKey = process.env.MAILJET_API_KEY?.trim();
  const secretKey = process.env.MAILJET_SECRET_KEY?.trim();
  const fromEmail = process.env.MAIL_FROM_EMAIL?.trim();
  const fromName = process.env.MAIL_FROM_NAME?.trim() || "Inimigos do Fim";

  if (!apiKey || !secretKey) {
    return { error: "Configure MAILJET_API_KEY e MAILJET_SECRET_KEY no servidor." };
  }
  if (!fromEmail) {
    return { error: "Configure MAIL_FROM_EMAIL com um remetente validado no Mailjet." };
  }

  return { apiKey, secretKey, fromEmail, fromName };
}

function getClient(apiKey: string, secretKey: string) {
  return new Client({ apiKey, apiSecret: secretKey });
}

export async function sendEmail(
  input: SendEmailInput
): Promise<{ error?: string }> {
  const config = getMailjetConfig();
  if ("error" in config) {
    return { error: config.error };
  }

  const mailjet = getClient(config.apiKey, config.secretKey);
  const body = {
    Messages: [
      {
        From: { Email: config.fromEmail, Name: config.fromName },
        To: [{ Email: input.to }],
        Subject: input.subject,
        TextPart: input.text,
        HTMLPart: input.html,
      },
    ],
  } satisfies { Messages: MailjetMessage[] };

  try {
    const result = await mailjet
      .post("send", { version: "v3.1" })
      .request(body);
    const response = result.body as MailjetSendResponse;
    const status = response.Messages?.[0]?.Status;
    if (status !== "success") {
      return { error: "O Mailjet não confirmou o envio do e-mail." };
    }
    return {};
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Falha ao enviar e-mail pelo Mailjet.";
    return { error: message };
  }
}

const BATCH_SIZE = 50;

export async function sendBulkEmails(
  emails: string[],
  subject: string,
  text: string,
  html: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const config = getMailjetConfig();
  if ("error" in config) {
    const errMsg = config.error;
    return { sent: 0, failed: emails.length, errors: [errMsg] };
  }

  const { apiKey, secretKey, fromEmail, fromName } = config;
  const mailjet = getClient(apiKey, secretKey);
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    const messages: MailjetMessage[] = chunk.map((email) => ({
      From: { Email: fromEmail, Name: fromName },
      To: [{ Email: email }],
      Subject: subject,
      TextPart: text,
      HTMLPart: html,
    }));

    try {
      const result = await mailjet
        .post("send", { version: "v3.1" })
        .request({ Messages: messages });
      const response = result.body as MailjetSendResponse;
      for (const msg of response.Messages ?? []) {
        if (msg.Status === "success") {
          sent += 1;
        } else {
          failed += 1;
          if (msg.Errors?.[0]?.ErrorMessage) {
            errors.push(msg.Errors[0].ErrorMessage);
          }
        }
      }
    } catch (err) {
      failed += chunk.length;
      errors.push(
        err instanceof Error ? err.message : "Falha no lote de envio Mailjet."
      );
    }
  }

  return { sent, failed, errors };
}

export function buildComunicadoHtml(assunto: string, mensagem: string) {
  const safeAssunto = escapeHtml(assunto);
  const safeBody = escapeHtml(mensagem).replace(/\n/g, "<br />");
  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family: system-ui, sans-serif; color: #0f172a; line-height: 1.5;">
  <div style="max-width: 640px; margin: 0 auto; padding: 24px;">
    <p style="font-size: 12px; color: #64748b; margin: 0 0 16px;">Inimigos do Fim — Comunicado</p>
    <h1 style="font-size: 20px; margin: 0 0 16px;">${safeAssunto}</h1>
    <div style="font-size: 15px;">${safeBody}</div>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="font-size: 12px; color: #94a3b8; margin: 0;">Mensagem enviada pela gestão do grupo.</p>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
