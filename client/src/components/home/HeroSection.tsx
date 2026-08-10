"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const handles = [
  {
    username: "@craft.pallet_",
    href: "https://www.instagram.com/craft.pallet_/",
    followers: "7K+",
  },
  {
    username: "@the_craft.pallet_",
    href: "https://www.instagram.com/the_craft.pallet_/",
    followers: "3K+",
  },
];

const heroBannerSrc = "/images/hero-banner.png"; // replace with your image

export default function HeroSection() {
  return (
    <>
      <style>{`
        .hero-full {
          position: relative;
          width: 100%;
          min-height: 88vh;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          background-color: var(--brand-soft);
        }

        .hero-full-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .hero-full-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(30, 28, 26, 0.82) 0%,
            rgba(30, 28, 26, 0.55) 30%,
            rgba(30, 28, 26, 0.18) 62%,
            rgba(30, 28, 26, 0.05) 100%
          );
        }

        .hero-full-inner {
          position: relative;
          z-index: 2;
          width: 100%;
          padding-top: 140px;
          padding-bottom: 56px;
        }

        .hero-full-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.72);
          margin-bottom: 20px;
        }

        .hero-full-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(44px, 7vw, 88px);
          font-weight: 500;
          line-height: 1.02;
          letter-spacing: -0.035em;
          color: #fff;
          margin-bottom: 24px;
          max-width: 14ch;
        }

        .hero-full-sub {
          font-size: 16px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.82);
          max-width: 460px;
          margin-bottom: 40px;
        }

        .hero-btn-light {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 48px;
          padding: 14px 30px;
          background-color: #fff;
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border-radius: var(--radius-btn);
          transition: background-color 250ms ease, transform 250ms ease;
        }
        .hero-btn-light:hover {
          background-color: #F2EFEA;
          transform: translateY(-1px);
        }

        .hero-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 48px;
          padding: 13px 30px;
          background-color: transparent;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: var(--radius-btn);
          transition: background-color 250ms ease, border-color 250ms ease;
        }
        .hero-btn-outline:hover {
          background-color: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.7);
        }

        /* ── Bottom strip ── */
        .hero-strip {
          position: relative;
          z-index: 2;
          margin-top: 56px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.16);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
        }

        .hero-strip-stats {
          display: flex;
          align-items: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .hero-strip-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .hero-strip-value {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .hero-strip-label {
          font-size: 11px;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.6);
        }

        .hero-strip-handles {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .hero-handle-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          border-radius: var(--radius-badge);
          border: 1px solid rgba(255, 255, 255, 0.24);
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: background-color 250ms ease, border-color 250ms ease;
          white-space: nowrap;
        }
        .hero-handle-pill:hover {
          background-color: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .hero-handle-count {
          color: rgba(255, 255, 255, 0.6);
          font-weight: 400;
        }

        @media (max-width: 900px) {
          .hero-full { min-height: 82vh; }
          .hero-full-inner { padding-top: 120px; padding-bottom: 44px; }
          .hero-strip { margin-top: 40px; }
          .hero-strip-stats { gap: 28px; }
        }

        @media (max-width: 640px) {
          .hero-full { min-height: 88vh; }
          .hero-full-inner { padding-top: 100px; padding-bottom: 36px; }
          .hero-full-title { max-width: 100%; }
          .hero-full-sub { margin-bottom: 32px; }
          .hero-strip {
            flex-direction: column;
            align-items: flex-start;
            gap: 22px;
          }
          .hero-strip-value { font-size: 19px; }
        }
      `}</style>

      <section className="hero-full">
        {/* Background image */}
        <img
          src={heroBannerSrc}
          alt="Handcrafted personalised photo keepsakes by The Craft Pallet"
          className="hero-full-image"
        />

        {/* Gradient overlay */}
        <div className="hero-full-overlay" />

        {/* Content */}
        <div className="hero-full-inner">
          <div className="tcp-container">
            <div className="animate-fade-up">
              <p className="hero-full-eyebrow">
                Handcrafted Personalised Gifts
              </p>

              <h1 className="hero-full-title">
                A Collection Made for{" "}
                <em
                  style={{
                    fontStyle: "italic",
                    fontWeight: 500,
                  }}
                >
                  Memories.
                </em>
              </h1>

              <p className="hero-full-sub">
                Thoughtfully crafted personalised gifts for the moments worth
                keeping. Premium polaroids, photo prints, and more.
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <Link href="/products" className="hero-btn-light">
                  Shop Collection
                  <ArrowRight size={15} strokeWidth={2} />
                </Link>

                <Link href="/#about" className="hero-btn-outline">
                  Our Story
                </Link>
              </div>
            </div>

            {/* Bottom strip */}
            <div className="hero-strip">
              {/* Stats */}
              <div className="hero-strip-stats">
                <div className="hero-strip-item">
                  <span className="hero-strip-value">11,000+</span>
                  <span className="hero-strip-label">
                    Instagram followers
                  </span>
                </div>

                <div className="hero-strip-item">
                  <span className="hero-strip-value">1000+</span>
                  <span className="hero-strip-label">Happy customers</span>
                </div>

                <div className="hero-strip-item">
                  <span className="hero-strip-value">7–10</span>
                  <span className="hero-strip-label">Days delivery(inside kerala)</span>
                </div>
              </div>

              {/* Instagram handles */}
              <div className="hero-strip-handles">
                {handles.map((handle) => (
                  <a
                    key={handle.username}
                    href={handle.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-handle-pill"
                  >
                    <InstagramIcon size={13} />
                    {handle.username}
                    <span className="hero-handle-count">
                      {handle.followers}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// "use client";

// import Link from "next/link";
// import { ArrowRight, Users } from "lucide-react";

// function InstagramIcon({ size = 18 }: { size?: number }) {
//   return (
//     <svg
//       width={size}
//       height={size}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.75"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
//       <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
//       <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
//     </svg>
//   );
// }

// const handles = [
//   {
//     username: "@craft.pallet_",
//     href: "https://www.instagram.com/craft.pallet_/",
//     followers: "7,545",
//     label: "Main",
//   },
//   {
//     username: "@the_craft.pallet_",
//     href: "https://www.instagram.com/the_craft.pallet_/",
//     followers: "3,463",
//     label: "Gifts",
//   },
// ];

// export default function HeroSection() {
//   const totalFollowers = "11,000+";

//   return (
//     <section
//       style={{
//         backgroundColor: "var(--bg)",
//         padding: "120px 0 140px",
//       }}
//     >
//       <style>{`
//         @media (min-width: 1024px) {
//           .hero-grid {
//             grid-template-columns: 1fr 1fr !important;
//             gap: 100px !important;
//           }
//         }
//         @media (max-width: 640px) {
//           .hero-section-wrap {
//             padding: 80px 0 100px !important;
//           }
//         }
//       `}</style>

//       <div className="tcp-container">
//         <div
//           className="hero-grid"
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr",
//             gap: "64px",
//             alignItems: "center",
//           }}
//         >
//           {/* ── Left — Text ── */}
//           <div className="animate-fade-up">
//             <p className="tcp-eyebrow">Handcrafted Personalised Gifts</p>

//             <h1
//               style={{
//                 fontFamily: "'Playfair Display', serif",
//                 fontSize: "clamp(42px, 6vw, 72px)",
//                 fontWeight: 500,
//                 lineHeight: 1.06,
//                 letterSpacing: "-0.03em",
//                 color: "var(--text-primary)",
//                 marginBottom: "28px",
//               }}
//             >
//               A Collection
//               <br />
//               Made for{" "}
//               <em
//                 style={{
//                   fontStyle: "italic",
//                   fontWeight: 500,
//                   color: "var(--brand)",
//                 }}
//               >
//                 Memories.
//               </em>
//             </h1>

//             <p
//               style={{
//                 fontSize: "16px",
//                 lineHeight: 1.75,
//                 color: "var(--text-secondary)",
//                 marginBottom: "48px",
//                 maxWidth: "440px",
//               }}
//             >
//               Thoughtfully crafted personalised gifts for the moments worth
//               keeping. Premium polaroids, photo prints, and more.
//             </p>

//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "20px",
//                 flexWrap: "wrap",
//               }}
//             >
//               <Link href="/products" className="btn-primary">
//                 Shop Collection
//                 <ArrowRight size={15} strokeWidth={2} />
//               </Link>
//               <Link href="/#about" className="btn-ghost">
//                 Our Story
//                 <ArrowRight size={14} strokeWidth={2} />
//               </Link>
//             </div>

//             <p
//               style={{
//                 marginTop: "48px",
//                 fontSize: "12px",
//                 color: "var(--text-tertiary)",
//                 letterSpacing: "0.04em",
//               }}
//             >
//               500+ customers · 7–10 day delivery · Made in India
//             </p>
//           </div>

//           {/* ── Right — Instagram social proof ── */}
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               gap: "16px",
//             }}
//           >
//             {/* Combined follower count */}
//             <div
//               style={{
//                 padding: "28px 32px",
//                 borderRadius: "var(--radius-card)",
//                 backgroundColor: "var(--surface)",
//                 border: "1px solid var(--border-soft)",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "20px",
//               }}
//             >
//               <div
//                 style={{
//                   width: "52px",
//                   height: "52px",
//                   borderRadius: "var(--radius-card)",
//                   background:
//                     "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   color: "#fff",
//                   flexShrink: 0,
//                 }}
//               >
//                 <InstagramIcon size={22} />
//               </div>

//               <div style={{ flex: 1 }}>
//                 <p
//                   style={{
//                     fontFamily: "'Playfair Display', serif",
//                     fontSize: "32px",
//                     fontWeight: 600,
//                     color: "var(--text-primary)",
//                     letterSpacing: "-0.03em",
//                     lineHeight: 1,
//                     marginBottom: "4px",
//                   }}
//                 >
//                   {totalFollowers}
//                 </p>
//                 <p
//                   style={{
//                     fontSize: "12px",
//                     color: "var(--text-tertiary)",
//                     letterSpacing: "0.04em",
//                     fontWeight: 500,
//                   }}
//                 >
//                   Instagram followers across both handles
//                 </p>
//               </div>

//               <Users
//                 size={14}
//                 strokeWidth={1.75}
//                 style={{ color: "var(--text-tertiary)", flexShrink: 0 }}
//               />
//             </div>

//             {/* Individual handle cards */}
//             {handles.map((handle) => (
//               <InstagramHandleCard key={handle.username} handle={handle} />
//             ))}

//             {/* Bottom note */}
//             <div
//               style={{
//                 padding: "16px 20px",
//                 borderRadius: "var(--radius-input)",
//                 border: "1px solid var(--border-soft)",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "12px",
//               }}
//             >
//               <div
//                 style={{
//                   width: "6px",
//                   height: "6px",
//                   borderRadius: "999px",
//                   backgroundColor: "var(--success)",
//                   flexShrink: 0,
//                 }}
//               />
//               <p
//                 style={{
//                   fontSize: "12px",
//                   color: "var(--text-secondary)",
//                   lineHeight: 1.5,
//                 }}
//               >
//                 Follow us on Instagram for behind-the-scenes, new arrivals,
//                 and customer stories.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// /* ── Handle card — hover handled via CSS class ─────────────────────────── */

// function InstagramHandleCard({
//   handle,
// }: {
//   handle: {
//     username: string;
//     href: string;
//     followers: string;
//     label: string;
//   };
// }) {
//   return (
//     <>
//       <style>{`
//         .ig-handle-card {
//           padding: 20px 24px;
//           border-radius: var(--radius-card);
//           background-color: var(--surface);
//           border: 1px solid var(--border-soft);
//           display: flex;
//           align-items: center;
//           gap: 16px;
//           text-decoration: none;
//           transition: border-color 250ms ease;
//         }
//         .ig-handle-card:hover {
//           border-color: var(--brand);
//         }
//       `}</style>

//       <a
//         href={handle.href}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="ig-handle-card"
//       >
//         {/* Instagram gradient icon */}
//         <div
//           style={{
//             width: "40px",
//             height: "40px",
//             borderRadius: "var(--radius-input)",
//             background:
//               "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             color: "#fff",
//             flexShrink: 0,
//           }}
//         >
//           <InstagramIcon size={17} />
//         </div>

//         {/* Handle info */}
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <p
//             style={{
//               fontSize: "14px",
//               fontWeight: 600,
//               color: "var(--text-primary)",
//               letterSpacing: "-0.01em",
//               marginBottom: "2px",
//             }}
//           >
//             {handle.username}
//           </p>
//           <p
//             style={{
//               fontSize: "12px",
//               color: "var(--text-tertiary)",
//               letterSpacing: "0.02em",
//             }}
//           >
//             {handle.label} account
//           </p>
//         </div>

//         {/* Follower count */}
//         <div style={{ textAlign: "right", flexShrink: 0 }}>
//           <p
//             style={{
//               fontFamily: "'Playfair Display', serif",
//               fontSize: "20px",
//               fontWeight: 600,
//               color: "var(--text-primary)",
//               letterSpacing: "-0.02em",
//               lineHeight: 1,
//               marginBottom: "2px",
//             }}
//           >
//             {handle.followers}
//           </p>
//           <p
//             style={{
//               fontSize: "11px",
//               color: "var(--text-tertiary)",
//               letterSpacing: "0.04em",
//             }}
//           >
//             followers
//           </p>
//         </div>
//       </a>
//     </>
//   );
// }