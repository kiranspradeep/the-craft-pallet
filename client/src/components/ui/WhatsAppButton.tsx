"use client";

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ width: "18px", height: "18px", fill: "#fff" }}
    >
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.16 1.6 5.98L0 24l6.33-1.66a11.9 11.9 0 0 0 5.73 1.46h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.42ZM12.07 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.76.99 1-3.67-.24-.38A9.86 9.86 0 0 1 2.16 11.9C2.16 6.45 6.6 2 12.06 2c2.64 0 5.12 1.03 6.98 2.9a9.8 9.8 0 0 1 2.88 6.98c0 5.46-4.44 9.92-9.85 9.92Zm5.44-7.38c-.3-.15-1.77-.87-2.04-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5a9.1 9.1 0 0 1-1.67-2.08c-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.12 3.23 5.14 4.53.72.31 1.29.5 1.73.65.73.23 1.4.2 1.92.12.59-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

export default function WhatsAppButton() {
  return (
    <>
      <style>{`
        .wa-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 60;
          display: flex;
          align-items: center;
          overflow: hidden;
          border-radius: 999px;
          background-color: #25D366;
          border: 1px solid rgba(37, 211, 102, 0.2);
          box-shadow: 0 8px 28px rgba(37, 211, 102, 0.3);
          height: 52px;
          width: 52px;
          cursor: pointer;
          text-decoration: none;
          transition:
            width 500ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 400ms ease,
            transform 400ms ease,
            background-color 300ms ease;
        }

        .wa-fab:hover {
          width: 210px;
          background-color: #20BD5A;
          box-shadow: 0 14px 40px rgba(37, 211, 102, 0.45);
          transform: translateY(-2px);
        }

        .wa-fab-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          flex-shrink: 0;
        }

        .wa-fab-icon-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background-color: rgba(255, 255, 255, 0.15);
          transition: background-color 300ms ease;
        }

        .wa-fab:hover .wa-fab-icon-inner {
          background-color: rgba(255, 255, 255, 0.22);
        }

        .wa-fab-label {
          white-space: nowrap;
          padding-right: 20px;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          letter-spacing: 0.03em;
          opacity: 0;
          transform: translateX(8px);
          transition:
            opacity 300ms ease 80ms,
            transform 300ms ease 80ms;
        }

        .wa-fab:hover .wa-fab-label {
          opacity: 1;
          transform: translateX(0);
        }

        @media (min-width: 768px) {
          .wa-fab {
            bottom: 28px;
            right: 28px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wa-fab,
          .wa-fab-icon-inner,
          .wa-fab-label {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <a
        href="https://wa.me/918086415357"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="wa-fab"
      >
        <span className="wa-fab-icon">
          <span className="wa-fab-icon-inner">
            <WhatsAppIcon />
          </span>
        </span>

        <span className="wa-fab-label">
          Chat on WhatsApp
        </span>
      </a>
    </>
  );
}