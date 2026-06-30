// ============================================================================
// Email Service — Resend integracija
// ============================================================================
// IZOLOVAN fajl: sva logika za mejlove živi ovde i SAMO ovde.
// Ostatak aplikacije poziva funkcije iz ovog fajla — nikad direktno Resend.
//
// CENTRALNI PREKIDAČ: ENABLE_EMAILS u .env fajlu
//   ENABLE_EMAILS=true  → mejlovi se šalju
//   ENABLE_EMAILS=false → mejlovi se preskaču, sve ostalo radi normalno
//
// SIGURNOST:
//   - API ključ se čita ISKLJUČIVO iz env varijabli, nikad hardkodovan
//   - Greška u slanju mejla NIKAD ne prekida tok aplikacije (try/catch + void)
//   - Nikakvi lični podaci se ne loguju (samo status i prva 3 slova emaila)
//   - Resend instanca se pravi lazy (samo kad je potrebna)
//
// MEJLOVI KOJI SE ŠALJU:
//   1. sendAppointmentApprovedEmail   — frizer odobri termin
//   2. sendAppointmentRejectedEmail   — frizer odbije termin
//   3. sendCancellationConfirmationEmail — klijent otkaže
//   4. sendCancellationRequestedEmail — zahtev za otkazivanje (<18h)
//   5. sendAppointmentReminderEmail   — podsetnik jutro na dan termina (cron)
// ============================================================================

import { Resend } from "resend";
import { format } from "date-fns";
import { srLatn } from "date-fns/locale";

// ---------------------------------------------------------------------------
// Centralni prekidač
// ---------------------------------------------------------------------------
const ENABLE_EMAILS = process.env.ENABLE_EMAILS === "true";

// ---------------------------------------------------------------------------
// FROM adresa — menja se jednom ovde kad klijent dobije mejl salona
// ---------------------------------------------------------------------------
const FROM_EMAIL = "onboarding@resend.dev"; // ← Zamena sa: rezervacije@imesalona.rs

// ---------------------------------------------------------------------------
// URL sajta — za dugme "Proveri termin"
// ---------------------------------------------------------------------------
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Lazy inicijalizacija Resend-a
// ---------------------------------------------------------------------------
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("[EMAIL SERVICE] RESEND_API_KEY nije postavljen u .env fajlu.");
  }
  return new Resend(apiKey);
}

// ---------------------------------------------------------------------------
// Tipovi podataka za mejlove
// ---------------------------------------------------------------------------
export interface AppointmentEmailData {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  staffName: string;
  startTime: Date;
  endTime: Date;
  price: number;
}


// ---------------------------------------------------------------------------
// HTML Template — osnova svakog mejla
// ---------------------------------------------------------------------------
function buildEmailTemplate({
  title,
  subtitle,
  statusColor,
  statusIcon,
  bodyHtml,
  clientName,
}: {
  title: string;
  subtitle: string;
  statusColor: string;
  statusIcon: string;
  bodyHtml: string;
  clientName: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- LOGO -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#ffffff;border-radius:12px;padding:10px 20px;">
                    <span style="font-size:20px;font-weight:800;color:#0a0a0a;letter-spacing:-0.5px;">
                      ✂ [Ime Salona]
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CARD -->
          <tr>
            <td style="background-color:#141414;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden;">

              <!-- STATUS BANNER -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${statusColor};padding:24px 32px;text-align:center;">
                    <div style="font-size:36px;margin-bottom:8px;">${statusIcon}</div>
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${title}</h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${subtitle}</p>
                  </td>
                </tr>
              </table>

              <!-- BODY -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 24px;color:#e0e0e0;font-size:15px;line-height:1.6;">
                      Poštovani/a <strong style="color:#ffffff;">${clientName}</strong>,
                    </p>
                    ${bodyHtml}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;color:#555;font-size:12px;line-height:1.7;">
                Ovaj mejl je automatski generisan — molimo vas da na njega ne odgovarate.<br />
                Za promenu ili otkazivanje termina posetite <a href="${SITE_URL}/status" style="color:#888;">naš sajt</a>.
              </p>
              <p style="margin:12px 0 0;color:#333;font-size:11px;">
                © ${new Date().getFullYear()} [Ime Salona]. Sva prava zadržana.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ---------------------------------------------------------------------------
// Detalji termina — tabela koja se ponavlja u svim mejlovima
// ---------------------------------------------------------------------------
function buildAppointmentDetailsHtml(data: AppointmentEmailData): string {
  const dateStr = format(data.startTime, "EEEE, dd. MMMM yyyy.", { locale: srLatn });
  const startStr = format(data.startTime, "HH:mm");
  const endStr = format(data.endTime, "HH:mm");

  return `
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#1e1e1e;border-radius:12px;border:1px solid #2a2a2a;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 16px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
            Detalji termina
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">
                <span style="color:#888;font-size:13px;">📋 Usluga</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:right;">
                <span style="color:#ffffff;font-size:13px;font-weight:600;">${data.serviceName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">
                <span style="color:#888;font-size:13px;">✂ Frizer</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:right;">
                <span style="color:#ffffff;font-size:13px;">${data.staffName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">
                <span style="color:#888;font-size:13px;">📅 Datum</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:right;">
                <span style="color:#ffffff;font-size:13px;">${dateStr}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">
                <span style="color:#888;font-size:13px;">🕐 Vreme</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:right;">
                <span style="color:#ffffff;font-size:13px;font-weight:600;">${startStr} – ${endStr}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="color:#888;font-size:13px;">💰 Cena</span>
              </td>
              <td style="padding:8px 0;text-align:right;">
                <span style="color:#ffffff;font-size:13px;">${data.price.toLocaleString("sr-RS")} RSD</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

// ============================================================================
// MEJL 1 — Termin odobren
// ============================================================================
export async function sendAppointmentApprovedEmail(
  data: AppointmentEmailData
): Promise<void> {
  if (!ENABLE_EMAILS) {
    console.log("[EMAIL SERVICE] Mejlovi isključeni — preskačem sendAppointmentApprovedEmail");
    return;
  }
  try {
    const resend = getResendClient();
    const bodyHtml = `
      ${buildAppointmentDetailsHtml(data)}
      <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 8px;">
        Odlično! Vaš termin je <strong style="color:#22c55e;">zvanično potvrđen</strong>.
        Jedva čekamo da vas vidimo!
      </p>
      <p style="color:#666;font-size:13px;line-height:1.7;margin:0;">
        Podsetnik ćete dobiti jutro na dan termina.
      </p>
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.clientEmail,
      subject: `✅ Termin potvrđen | [Ime Salona]`,
      html: buildEmailTemplate({
        title: "Termin potvrđen!",
        subtitle: "Vidimo se uskoro",
        statusColor: "#15803d",
        statusIcon: "✅",
        bodyHtml,
        clientName: data.clientName,
      }),
    });
    console.log(`[EMAIL SERVICE] Odobrenje poslato: ${data.clientEmail.slice(0, 3)}***`);
  } catch (error) {
    console.error("[EMAIL SERVICE] Greška pri slanju odobrenja:", error);
  }
}

// ============================================================================
// MEJL 2 — Termin odbijen
// ============================================================================
export async function sendAppointmentRejectedEmail(
  data: AppointmentEmailData
): Promise<void> {
  if (!ENABLE_EMAILS) {
    console.log("[EMAIL SERVICE] Mejlovi isključeni — preskačem sendAppointmentRejectedEmail");
    return;
  }
  try {
    const resend = getResendClient();
    const bodyHtml = `
      ${buildAppointmentDetailsHtml(data)}
      <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0;">
        Nažalost, vaš termin <strong style="color:#ef4444;">nije mogao biti potvrđen</strong>
        zbog zauzetosti rasporeda. Molimo vas da odaberete drugi termin na našem sajtu.
      </p>
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.clientEmail,
      subject: `❌ Termin odbijen | [Ime Salona]`,
      html: buildEmailTemplate({
        title: "Termin odbijen",
        subtitle: "Molimo zakazujte drugi termin",
        statusColor: "#991b1b",
        statusIcon: "❌",
        bodyHtml,
        clientName: data.clientName,
      }),
    });
    console.log(`[EMAIL SERVICE] Odbijanje poslato: ${data.clientEmail.slice(0, 3)}***`);
  } catch (error) {
    console.error("[EMAIL SERVICE] Greška pri slanju odbijanja:", error);
  }
}

// ============================================================================
// MEJL 3 — Otkazivanje potvrđeno
// ============================================================================
export async function sendCancellationConfirmationEmail(
  data: AppointmentEmailData
): Promise<void> {
  if (!ENABLE_EMAILS) {
    console.log("[EMAIL SERVICE] Mejlovi isključeni — preskačem sendCancellationConfirmationEmail");
    return;
  }
  try {
    const resend = getResendClient();
    const bodyHtml = `
      ${buildAppointmentDetailsHtml(data)}
      <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0;">
        Vaš termin je <strong style="color:#94a3b8;">uspešno otkazan</strong>.
        Slobodno zakazujte novi termin na našem sajtu.
      </p>
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.clientEmail,
      subject: `Otkazivanje termina potvrđeno | [Ime Salona]`,
      html: buildEmailTemplate({
        title: "Otkazivanje potvrđeno",
        subtitle: "Vaš termin je otkazan",
        statusColor: "#334155",
        statusIcon: "🚫",
        bodyHtml,
        clientName: data.clientName,
      }),
    });
    console.log(`[EMAIL SERVICE] Potvrda otkazivanja poslata: ${data.clientEmail.slice(0, 3)}***`);
  } catch (error) {
    console.error("[EMAIL SERVICE] Greška pri slanju potvrde otkazivanja:", error);
  }
}

// ============================================================================
// MEJL 4 — Zahtev za otkazivanje primljen (<18h)
// ============================================================================
export async function sendCancellationRequestedEmail(
  data: AppointmentEmailData
): Promise<void> {
  if (!ENABLE_EMAILS) {
    console.log("[EMAIL SERVICE] Mejlovi isključeni — preskačem sendCancellationRequestedEmail");
    return;
  }
  try {
    const resend = getResendClient();
    const bodyHtml = `
      ${buildAppointmentDetailsHtml(data)}
      <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0;">
        Vaš zahtev za otkazivanje je <strong style="color:#f59e0b;">primljen</strong>.
        Pošto je do termina ostalo manje od 18 sati, frizer mora da odobri otkazivanje.
        Bićete obavešteni o odluci.
      </p>
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.clientEmail,
      subject: `⏳ Zahtev za otkazivanje primljen | [Ime Salona]`,
      html: buildEmailTemplate({
        title: "Zahtev primljen",
        subtitle: "Čeka odobrenje frizera",
        statusColor: "#92400e",
        statusIcon: "⏳",
        bodyHtml,
        clientName: data.clientName,
      }),
    });
    console.log(`[EMAIL SERVICE] Zahtev za otkazivanje poslat: ${data.clientEmail.slice(0, 3)}***`);
  } catch (error) {
    console.error("[EMAIL SERVICE] Greška pri slanju zahteva za otkazivanje:", error);
  }
}

// ============================================================================
// MEJL 5 — Podsetnik (šalje cron jutro na dan termina)
// ============================================================================
export async function sendAppointmentReminderEmail(
  data: AppointmentEmailData
): Promise<void> {
  if (!ENABLE_EMAILS) {
    console.log("[EMAIL SERVICE] Mejlovi isključeni — preskačem sendAppointmentReminderEmail");
    return;
  }
  try {
    const resend = getResendClient();
    const startStr = format(data.startTime, "HH:mm");
    const endStr = format(data.endTime, "HH:mm");

    const bodyHtml = `
      <table width="100%" cellpadding="0" cellspacing="0"
             style="background-color:#1e1e1e;border-radius:12px;border:1px solid #2a2a2a;margin-bottom:24px;">
        <tr>
          <td style="padding:24px;text-align:center;">
            <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">
              Danas u
            </p>
            <p style="margin:0;color:#ffffff;font-size:42px;font-weight:800;letter-spacing:-1px;">
              ${startStr}
            </p>
            <p style="margin:4px 0 0;color:#666;font-size:13px;">${startStr} – ${endStr}</p>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0"
             style="background-color:#1e1e1e;border-radius:12px;border:1px solid #2a2a2a;margin-bottom:24px;">
        <tr>
          <td style="padding:16px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">
                  <span style="color:#888;font-size:13px;">📋 Usluga</span>
                </td>
                <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:right;">
                  <span style="color:#ffffff;font-size:13px;font-weight:600;">${data.serviceName}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;">
                  <span style="color:#888;font-size:13px;">✂ Frizer</span>
                </td>
                <td style="padding:8px 0;text-align:right;">
                  <span style="color:#ffffff;font-size:13px;">${data.staffName}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="color:#666;font-size:13px;line-height:1.7;margin:0;text-align:center;">
        Ukoliko niste u mogućnosti da dođete, molimo vas da termin otkažete što pre.
      </p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.clientEmail,
      subject: `⏰ Podsetnik: Danas imate termin u ${startStr} | [Ime Salona]`,
      html: buildEmailTemplate({
        title: "Podsetnik za danas!",
        subtitle: `Vaš termin je danas u ${startStr}`,
        statusColor: "#1e3a5f",
        statusIcon: "⏰",
        bodyHtml,
        clientName: data.clientName,
      }),
    });
    console.log(`[EMAIL SERVICE] Podsetnik poslat: ${data.clientEmail.slice(0, 3)}***`);
  } catch (error) {
    console.error("[EMAIL SERVICE] Greška pri slanju podsetnika:", error);
  }
}
