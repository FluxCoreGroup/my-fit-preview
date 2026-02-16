// Shared email template for Pulse.ai
// Design inspired by best B2C SaaS practices (Strava, Headspace, Noom)

export const BRAND = {
  name: 'Pulse.ai',
  from: 'Pulse.ai <notifications@notifications.pulse-ai.app>',
  supportEmail: 'general@pulse-ai.app',
  baseUrl: 'https://www.pulse-ai.app',
  colors: {
    primary: '#3B82F6',
    primaryDark: '#1E40AF',
    secondary: '#6366F1',
    accent: '#22D3EE',
    success: '#10B981',
    warning: '#F59E0B',
    dark: '#0F172A',
    light: '#F8FAFC',
    text: '#334155',
    muted: '#64748B',
  }
};

export interface EmailData {
  recipientName: string;
  recipientEmail: string;
  subject: string;
  previewText: string;
  title: string;
  subtitle?: string;
  bodyContent: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  footerNote?: string;
  showStats?: boolean;
  stats?: Array<{ label: string; value: string; emoji?: string }>;
}

export function generateEmailHtml(data: EmailData): string {
  const {
    recipientName,
    previewText,
    title,
    subtitle,
    bodyContent,
    ctaText,
    ctaUrl,
    secondaryCtaText,
    secondaryCtaUrl,
    footerNote,
    showStats,
    stats
  } = data;

  const ctaButton = ctaText && ctaUrl ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0"
           style="margin:24px auto 12px auto;text-align:center">
      <tr>
        <td align="center" style="border-radius:14px;background:linear-gradient(135deg,${BRAND.colors.primary} 0%, ${BRAND.colors.primaryDark} 100%);box-shadow:0 4px 14px rgba(59,130,246,0.35);">
          <a href="${ctaUrl}"
             style="display:inline-block;padding:16px 32px;border-radius:14px;
                    font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
                    font-size:16px;font-weight:700;color:#ffffff;text-decoration:none">
            ${ctaText}
          </a>
        </td>
      </tr>
    </table>
  ` : '';

  const secondaryButton = secondaryCtaText && secondaryCtaUrl ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0"
           style="margin:8px auto;text-align:center">
      <tr>
        <td align="center">
          <a href="${secondaryCtaUrl}"
             style="display:inline-block;padding:12px 24px;
                    font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
                    font-size:14px;font-weight:600;color:${BRAND.colors.primary};text-decoration:none">
            ${secondaryCtaText}
          </a>
        </td>
      </tr>
    </table>
  ` : '';

  const statsSection = showStats && stats && stats.length > 0 ? `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="margin:20px 0;background:linear-gradient(135deg,${BRAND.colors.dark} 0%, #1E293B 100%);border-radius:16px;overflow:hidden">
      <tr>
        <td style="padding:20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              ${stats.map(stat => `
                <td align="center" style="padding:8px;width:${100/stats.length}%">
                  <div style="font-size:24px;margin-bottom:4px">${stat.emoji || ''}</div>
                  <div style="font-family:system-ui,-apple-system,sans-serif;font-size:22px;font-weight:800;color:#ffffff">${stat.value}</div>
                  <div style="font-family:system-ui,-apple-system,sans-serif;font-size:12px;color:${BRAND.colors.muted};text-transform:uppercase;letter-spacing:0.5px;margin-top:4px">${stat.label}</div>
                </td>
              `).join('')}
            </tr>
          </table>
        </td>
      </tr>
    </table>
  ` : '';

  const footerNoteHtml = footerNote ? `
    <p style="margin:16px 0 0;text-align:center;color:${BRAND.colors.muted};font-size:12px;line-height:18px;font-style:italic">
      ${footerNote}
    </p>
  ` : '';

  return `<!doctype html>
<html lang="fr" style="margin:0;padding:0;">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>${title} — Pulse.ai</title>
    <style>
      @media (max-width:480px){
        .container{width:100%!important;border-radius:0!important}
        .h1{font-size:24px!important;line-height:32px!important}
        .lead{font-size:15px!important;line-height:22px!important}
        .btn{display:block!important;width:100%!important}
        .stat-cell{display:block!important;width:100%!important;padding:12px 8px!important}
      }
      @media (prefers-color-scheme: dark) {
        .email-body { background: #0F172A !important; }
      }
    </style>
  </head>
  <body class="email-body" style="margin:0;padding:0;background:${BRAND.colors.dark};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
    <!-- Preview text -->
    <div style="display:none;max-height:0;opacity:0;overflow:hidden;mso-hide:all">
      ${previewText}
      ${'&nbsp;'.repeat(100)}
    </div>

    <!-- Main wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="background:linear-gradient(180deg,${BRAND.colors.primary} 0%, ${BRAND.colors.primaryDark} 50%, ${BRAND.colors.dark} 100%);">
      <tr>
        <td align="center" style="padding:40px 16px;">
          
          <!-- Container -->
          <table role="presentation" width="600" class="container" cellspacing="0" cellpadding="0" border="0"
                 style="max-width:600px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;
                        box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
            
            <!-- Header with logo -->
            <tr>
              <td style="padding:28px 28px 16px;text-align:center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto">
                  <tr>
                    <td style="width:40px;height:40px;background:linear-gradient(135deg,${BRAND.colors.primary} 0%, ${BRAND.colors.secondary} 100%);border-radius:12px;text-align:center;vertical-align:middle">
                      <span style="font-size:20px;line-height:40px">💪</span>
                    </td>
                    <td style="padding-left:12px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:22px;font-weight:800;color:${BRAND.colors.dark}">
                      ${BRAND.name}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Gradient bar -->
            <tr>
              <td style="height:4px;background:linear-gradient(90deg,${BRAND.colors.primary},${BRAND.colors.secondary},${BRAND.colors.accent})"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:32px 28px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${BRAND.colors.dark};">
                
                <!-- Title -->
                <h1 class="h1" style="margin:0 0 12px;text-align:center;font-size:28px;line-height:36px;font-weight:800">
                  ${title}
                </h1>
                
                ${subtitle ? `
                <p class="lead" style="margin:0 0 24px;text-align:center;color:${BRAND.colors.text};font-size:17px;line-height:26px">
                  ${subtitle}
                </p>
                ` : ''}

                ${statsSection}

                <!-- Body content -->
                <div style="color:${BRAND.colors.text};font-size:15px;line-height:24px">
                  ${bodyContent}
                </div>

                ${ctaButton}
                ${secondaryButton}
                ${footerNoteHtml}

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:${BRAND.colors.light};padding:24px 28px;text-align:center;
                         font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
                         border-top:1px solid #E2E8F0">
                <p style="margin:0 0 8px;color:${BRAND.colors.muted};font-size:13px;line-height:20px">
                  Une question ? <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.colors.primary};text-decoration:underline">${BRAND.supportEmail}</a>
                </p>
                <p style="margin:0;color:#94A3B8;font-size:11px;line-height:18px">
                  © 2025 ${BRAND.name} — Coach fitness IA personnalisé<br>
                  <a href="${BRAND.baseUrl}/legal" style="color:#94A3B8;text-decoration:underline">Mentions légales</a>
                  &nbsp;•&nbsp;
                  <a href="${BRAND.baseUrl}/settings" style="color:#94A3B8;text-decoration:underline">Préférences email</a>
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// Goal type translation helper
export function translateGoalType(goalType: string | string[] | null): string {
  const translateOne = (g: string): string => {
    switch (g) {
      case 'lose_weight': case 'weight-loss': return 'perdre du poids';
      case 'gain_muscle': case 'muscle-gain': return 'prendre du muscle';
      case 'maintain': case 'general-fitness': case 'wellness': return 'maintenir ta forme';
      case 'improve_endurance': case 'endurance': return 'améliorer ton endurance';
      case 'improve_strength': case 'strength': return 'gagner en force';
      default: return 'atteindre tes objectifs';
    }
  };
  if (!goalType) return 'atteindre tes objectifs';
  if (Array.isArray(goalType)) return goalType.map(translateOne).join(' et ');
  return translateOne(goalType);
}

// Experience level translation
export function translateExperienceLevel(level: string | null): string {
  switch (level) {
    case 'beginner': return 'débutant';
    case 'intermediate': return 'intermédiaire';
    case 'advanced': return 'avancé';
    default: return 'motivé';
  }
}

// Priority zones translation
export function translatePriorityZones(zones: string[] | null): string {
  if (!zones || zones.length === 0) return 'tout le corps';
  const translations: Record<string, string> = {
    'chest': 'pectoraux',
    'back': 'dos',
    'legs': 'jambes',
    'arms': 'bras',
    'shoulders': 'épaules',
    'core': 'abdos',
    'glutes': 'fessiers'
  };
  return zones.map(z => translations[z] || z).join(', ');
}
