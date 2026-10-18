import * as React from "react";
import type { BrandDiff } from "../types";

export interface DigestEmailProps {
  userName: string;
  brands: BrandDiff[];
  dashboardUrl: string;
  rerunUrl: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
}

// Brand colors
const colors = {
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  bgLight: "#f9fafb",
  border: "#e5e7eb",
};

function getCompetitorMessage(direction: string): string {
  switch (direction) {
    case "up":
      return "moved up in AI recommendations";
    case "down":
      return "dropped in visibility";
    case "new":
      return "is newly appearing in AI results";
    default:
      return "stayed steady";
  }
}

function getDeltaArrow(delta: number): string {
  if (delta > 0) return "↑";
  if (delta < 0) return "↓";
  return "→";
}

function getDeltaColor(delta: number): string {
  if (delta > 0) return colors.success;
  if (delta < 0) return colors.danger;
  return colors.textSecondary;
}

export function DigestEmail({
  userName,
  brands,
  dashboardUrl,
  rerunUrl,
  unsubscribeUrl,
  preferencesUrl,
}: DigestEmailProps): React.ReactElement {
  const firstName = userName.split(" ")[0] || userName;
  const totalScoreDelta = brands.reduce((sum, b) => sum + b.scoreDelta, 0);
  const trend = totalScoreDelta > 0 ? "📈" : totalScoreDelta < 0 ? "📉" : "➡️";
  const dateString = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your 30-Day AI Visibility Digest {trend}</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media only screen and (max-width: 600px) {
            .engine-cell { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
            .engine-table { width: 100% !important; }
          }
        `,
          }}
        />
      </head>
      <body
        style={{
          backgroundColor: "#f3f4f6",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          margin: 0,
          padding: "20px 0",
        }}
      >
        <table
          role="presentation"
          style={{
            backgroundColor: "#ffffff",
            margin: "0 auto",
            maxWidth: "600px",
            width: "100%",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Header */}
          <tr>
            <td
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                padding: "32px 24px",
                textAlign: "center",
              }}
            >
              <img
                src="https://zeeklabs.ai/zeeklabs-logo-white.png"
                width="40"
                height="40"
                alt="ZeekLabs"
                style={{ marginBottom: "16px" }}
              />
              <h1
                style={{
                  color: "#ffffff",
                  fontSize: "24px",
                  fontWeight: "700",
                  margin: "0 0 8px",
                }}
              >
                Your 30-Day AI Visibility Digest
              </h1>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  margin: "0",
                }}
              >
                {dateString}
                {brands.length === 1
                  ? ` • ${brands[0].brandName}`
                  : ` • ${brands.length} Brands`}
              </p>
            </td>
          </tr>

          {/* Greeting */}
          <tr>
            <td style={{ padding: "24px" }}>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: colors.textPrimary,
                  margin: "0 0 8px",
                }}
              >
                Hi {firstName},
              </p>
              <p
                style={{
                  fontSize: "15px",
                  color: colors.textSecondary,
                  lineHeight: "1.6",
                  margin: "0",
                }}
              >
                Here&apos;s how your brand performed across AI engines this
                month. AI recommendations change constantly — a lot can shift in
                30 days.
              </p>
            </td>
          </tr>

          {/* Per-brand sections */}
          {brands.map((brand) => (
            <tr key={brand.brandId}>
              <td style={{ padding: "0 24px 24px" }}>
                {brands.length > 1 && (
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: colors.textPrimary,
                      borderBottom: `2px solid ${colors.primary}`,
                      paddingBottom: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    {brand.brandName}
                  </h2>
                )}

                {/* Overall Score Card */}
                <table
                  role="presentation"
                  style={{
                    width: "100%",
                    background:
                      "linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)",
                    borderRadius: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <tr>
                    <td style={{ padding: "24px", textAlign: "center" }}>
                      <p
                        style={{
                          fontSize: "14px",
                          color: colors.textSecondary,
                          margin: "0 0 8px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Overall AI Visibility Score
                      </p>
                      <p
                        style={{
                          fontSize: "48px",
                          fontWeight: "700",
                          color: colors.primary,
                          margin: "0",
                        }}
                      >
                        {brand.currentScore}%
                      </p>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          margin: "8px 0 0",
                          color: getDeltaColor(brand.scoreDelta),
                        }}
                      >
                        {getDeltaArrow(brand.scoreDelta)}{" "}
                        {Math.abs(brand.scoreDelta)} points from last month
                      </p>
                    </td>
                  </tr>
                </table>

                {/* Engine Breakdown */}
                <table
                  role="presentation"
                  className="engine-table"
                  style={{ width: "100%", marginBottom: "16px" }}
                >
                  <tr>
                    {brand.mentions.map((engine) => (
                      <td
                        key={engine.engine}
                        className="engine-cell"
                        style={{
                          width: "33.33%",
                          padding: "0 4px",
                          verticalAlign: "top",
                        }}
                      >
                        <table
                          role="presentation"
                          style={{
                            width: "100%",
                            backgroundColor: colors.bgLight,
                            borderRadius: "8px",
                          }}
                        >
                          <tr>
                            <td
                              style={{ padding: "16px 12px", textAlign: "center" }}
                            >
                              <p
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  color: colors.textSecondary,
                                  textTransform: "uppercase",
                                  margin: "0 0 8px",
                                }}
                              >
                                {engine.engine}
                              </p>
                              <p
                                style={{
                                  fontSize: "24px",
                                  fontWeight: "700",
                                  margin: "0",
                                  color: getDeltaColor(engine.delta),
                                }}
                              >
                                {getDeltaArrow(engine.delta)} {engine.current}
                              </p>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: colors.textSecondary,
                                  margin: "4px 0",
                                }}
                              >
                                mentions
                              </p>
                              <p
                                style={{
                                  fontSize: "11px",
                                  color: colors.textSecondary,
                                  margin: "0",
                                }}
                              >
                                {engine.delta !== 0
                                  ? `was ${engine.previous}`
                                  : "unchanged"}
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    ))}
                  </tr>
                </table>

                {/* Sentiment Shift */}
                <table
                  role="presentation"
                  style={{
                    width: "100%",
                    backgroundColor: colors.bgLight,
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <tr>
                    <td style={{ padding: "16px" }}>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: colors.textPrimary,
                          margin: "0 0 12px",
                        }}
                      >
                        Sentiment Shift
                      </p>
                      <p
                        style={{
                          fontSize: "14px",
                          color: colors.textSecondary,
                          margin: "0 0 4px",
                        }}
                      >
                        Positive: {brand.sentiment.previous.positive}% →{" "}
                        {brand.sentiment.current.positive}%
                        {brand.sentiment.current.positive >
                        brand.sentiment.previous.positive
                          ? " ↑"
                          : brand.sentiment.current.positive <
                            brand.sentiment.previous.positive
                          ? " ↓"
                          : ""}
                      </p>
                      <p
                        style={{
                          fontSize: "14px",
                          color: colors.textSecondary,
                          margin: "0 0 4px",
                        }}
                      >
                        Neutral: {brand.sentiment.previous.neutral}% →{" "}
                        {brand.sentiment.current.neutral}%
                      </p>
                      <p
                        style={{
                          fontSize: "14px",
                          color: colors.textSecondary,
                          margin: "0",
                        }}
                      >
                        Negative: {brand.sentiment.previous.negative}% →{" "}
                        {brand.sentiment.current.negative}%
                        {brand.sentiment.current.negative <
                        brand.sentiment.previous.negative
                          ? " ↓"
                          : brand.sentiment.current.negative >
                            brand.sentiment.previous.negative
                          ? " ↑"
                          : ""}
                      </p>
                    </td>
                  </tr>
                </table>

                {/* Competitor Watch */}
                {brand.competitorMovement.length > 0 && (
                  <table
                    role="presentation"
                    style={{
                      width: "100%",
                      backgroundColor: colors.bgLight,
                      borderRadius: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <tr>
                      <td style={{ padding: "16px" }}>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: colors.textPrimary,
                            margin: "0 0 12px",
                          }}
                        >
                          Competitor Watch
                        </p>
                        {brand.competitorMovement.slice(0, 3).map((comp, i) => (
                          <p
                            key={i}
                            style={{
                              fontSize: "14px",
                              color: colors.textSecondary,
                              margin: "0 0 8px",
                              lineHeight: "1.5",
                            }}
                          >
                            {comp.direction === "up"
                              ? "📈"
                              : comp.direction === "down"
                              ? "📉"
                              : "🎉"}{" "}
                            {comp.name} {getCompetitorMessage(comp.direction)}
                          </p>
                        ))}
                      </td>
                    </tr>
                  </table>
                )}

                {/* Recommendations */}
                {brand.recommendations.length > 0 && (
                  <table role="presentation" style={{ width: "100%" }}>
                    <tr>
                      <td>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: colors.textPrimary,
                            margin: "0 0 12px",
                          }}
                        >
                          Top Recommendations
                        </p>
                        {brand.recommendations.slice(0, 3).map((rec, i) => (
                          <p
                            key={i}
                            style={{
                              fontSize: "14px",
                              color: colors.textSecondary,
                              margin: "0 0 8px",
                              lineHeight: "1.5",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                backgroundColor: colors.primary,
                                color: "#ffffff",
                                fontSize: "12px",
                                fontWeight: "600",
                                textAlign: "center",
                                lineHeight: "20px",
                                marginRight: "8px",
                              }}
                            >
                              {i + 1}
                            </span>
                            {rec}
                          </p>
                        ))}
                      </td>
                    </tr>
                  </table>
                )}
              </td>
            </tr>
          ))}

          {/* CTA Section */}
          <tr>
            <td
              style={{
                backgroundColor: colors.bgLight,
                padding: "32px 24px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: colors.textPrimary,
                  margin: "0 0 8px",
                }}
              >
                🔄 Time for a fresh analysis?
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: colors.textSecondary,
                  lineHeight: "1.6",
                  margin: "0 0 20px",
                }}
              >
                AI engines update their knowledge constantly. Run a new analysis
                to see exactly where you stand today and get updated
                recommendations.
              </p>
              <table role="presentation" style={{ margin: "0 auto" }}>
                <tr>
                  <td>
                    <a
                      href={rerunUrl}
                      style={{
                        backgroundColor: colors.primary,
                        color: "#ffffff",
                        padding: "14px 28px",
                        borderRadius: "8px",
                        fontSize: "15px",
                        fontWeight: "600",
                        textDecoration: "none",
                        display: "inline-block",
                        marginBottom: "12px",
                      }}
                    >
                      Re-run Analysis →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingTop: "12px" }}>
                    <a
                      href={dashboardUrl}
                      style={{
                        backgroundColor: "transparent",
                        color: colors.primary,
                        padding: "12px 24px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        textDecoration: "none",
                        display: "inline-block",
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      View Full Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          {/* Divider */}
          <tr>
            <td>
              <hr
                style={{
                  border: "none",
                  borderTop: `1px solid ${colors.border}`,
                  margin: 0,
                }}
              />
            </td>
          </tr>

          {/* Footer */}
          <tr>
            <td style={{ padding: "24px", textAlign: "center" }}>
              <img
                src="https://zeeklabs.ai/zeeklabs-logo.svg"
                width="32"
                height="32"
                alt="ZeekLabs"
                style={{ marginBottom: "12px" }}
              />
              <p
                style={{
                  fontSize: "13px",
                  color: colors.textSecondary,
                  margin: "0 0 12px",
                }}
              >
                AI Visibility Monitoring for Modern Brands
              </p>
              <p style={{ fontSize: "13px", margin: "0 0 16px" }}>
                <a
                  href={preferencesUrl}
                  style={{ color: colors.primary, textDecoration: "none" }}
                >
                  Manage preferences
                </a>
                {" • "}
                <a
                  href={unsubscribeUrl}
                  style={{ color: colors.primary, textDecoration: "none" }}
                >
                  Unsubscribe
                </a>
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: colors.textSecondary,
                  lineHeight: "1.5",
                  margin: "0 0 8px",
                }}
              >
                CLIKBOUND PRIVATE LIMITED
                <br />
                HNO 318, Nivant House, Virar (West), Maharashtra — 401301
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: colors.textSecondary,
                  margin: "0",
                }}
              >
                © 2026 ZeekLabs.ai
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

export function generatePlainText(props: Omit<DigestEmailProps, "to">): string {
  const { userName, brands, dashboardUrl, rerunUrl } = props;
  const firstName = userName.split(" ")[0] || userName;

  let text = `Hi ${firstName},\n\n`;
  text += `Here's your 30-day AI visibility digest.\n\n`;

  for (const brand of brands) {
    text += `${brand.brandName}\n`;
    text += `${"─".repeat(30)}\n`;
    text += `Overall Score: ${brand.currentScore}% (${brand.scoreDelta > 0 ? "+" : ""}${brand.scoreDelta})\n\n`;

    text += `Mentions by Engine:\n`;
    for (const m of brand.mentions) {
      text += `  • ${m.engine}: ${m.current} (was ${m.previous})\n`;
    }
    text += `\n`;

    text += `Sentiment:\n`;
    text += `  • Positive: ${brand.sentiment.previous.positive}% → ${brand.sentiment.current.positive}%\n`;
    text += `  • Neutral: ${brand.sentiment.previous.neutral}% → ${brand.sentiment.current.neutral}%\n`;
    text += `  • Negative: ${brand.sentiment.previous.negative}% → ${brand.sentiment.current.negative}%\n\n`;

    if (brand.competitorMovement.length > 0) {
      text += `Competitor Watch:\n`;
      brand.competitorMovement.slice(0, 3).forEach((comp) => {
        text += `  • ${comp.name} ${getCompetitorMessage(comp.direction)}\n`;
      });
      text += `\n`;
    }

    if (brand.recommendations.length > 0) {
      text += `Top Recommendations:\n`;
      brand.recommendations.slice(0, 3).forEach((rec, i) => {
        text += `  ${i + 1}. ${rec}\n`;
      });
      text += `\n`;
    }
  }

  text += `Ready for a fresh analysis? AI engines update constantly.\n`;
  text += `Re-run analysis: ${rerunUrl}\n`;
  text += `View dashboard: ${dashboardUrl}\n\n`;
  text += `— The ZeekLabs Team\n`;

  return text;
}
