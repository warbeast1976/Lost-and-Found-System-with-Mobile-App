<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
    :root {
        --ink:        #09090b;
        --muted:      #71717a;
        --dim:        #a1a1aa;
        --border:     #e4e4e7;
        --surface:    #fafafa;
        --accent:     #2563eb;
        --accent-bg:  #eff6ff;
        --success:    #10b981;
        --success-bg: #ecfdf5;
        --warning:    #f59e0b;
        --warning-bg: #fffbeb;
        --danger:     #ef4444;
        --danger-bg:  #fef2f2;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 13px;
        line-height: 1.5;
        color: var(--ink);
        background: #f4f4f5;
        -webkit-font-smoothing: antialiased;
    }

    /* ---- Screen toolbar ---- */
    .print-toolbar {
        position: sticky;
        top: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 24px;
        background: #fff;
        border-bottom: 1px solid var(--border);
        box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }

    .print-toolbar__hint {
        margin-left: auto;
        font-size: 12px;
        color: var(--muted);
    }

    .print-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        transition: background .15s;
    }

    .print-btn svg { width: 16px; height: 16px; flex-shrink: 0; }

    .print-btn--primary {
        background: var(--ink);
        color: #fff;
    }
    .print-btn--primary:hover { background: #27272a; }

    .print-btn--secondary {
        background: #fff;
        color: var(--ink);
        border: 1px solid var(--border);
    }
    .print-btn--secondary:hover { background: var(--surface); }

    /* ---- Page shell ---- */
    .print-page {
        max-width: 820px;
        margin: 32px auto;
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 10px;
        box-shadow: 0 4px 24px rgba(0,0,0,.08);
        overflow: hidden;
    }

    .print-page--label {
        max-width: 420px;
    }

    .print-page--landscape {
        max-width: 1100px;
    }

    /* ---- Header ---- */
    .doc-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 24px;
        padding: 28px 32px 24px;
        border-bottom: 2px solid var(--ink);
    }

    .doc-brand {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .doc-logo {
        width: 36px;
        height: 36px;
        background: var(--ink);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: 800;
        font-size: 14px;
        letter-spacing: -.5px;
        flex-shrink: 0;
    }

    .doc-brand-name {
        font-size: 18px;
        font-weight: 800;
        letter-spacing: -.3px;
        line-height: 1.2;
    }

    .doc-brand-tagline {
        font-size: 11px;
        color: var(--muted);
        font-weight: 500;
        margin-top: 2px;
    }

    .doc-meta {
        text-align: right;
        flex-shrink: 0;
    }

    .doc-type {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .08em;
        color: var(--accent);
        margin-bottom: 4px;
    }

    .doc-id {
        font-size: 20px;
        font-weight: 800;
        letter-spacing: -.02em;
        font-variant-numeric: tabular-nums;
    }

    .doc-date {
        font-size: 11px;
        color: var(--muted);
        margin-top: 4px;
    }

    /* ---- Body ---- */
    .doc-body {
        padding: 28px 32px;
    }

    .doc-body--compact {
        padding: 20px 24px;
    }

    /* ---- Status badge ---- */
    .status-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .04em;
    }

    .status-badge--pending   { background: var(--warning-bg); color: #b45309; }
    .status-badge--approved  { background: var(--accent-bg);  color: #1d4ed8; }
    .status-badge--released  { background: var(--success-bg); color: #047857; }
    .status-badge--rejected  { background: var(--danger-bg);  color: #b91c1c; }
    .status-badge--available { background: var(--success-bg); color: #047857; }
    .status-badge--default   { background: var(--surface);   color: var(--muted); border: 1px solid var(--border); }

    /* ---- Highlight box (pickup code, ref code) ---- */
    .highlight-box {
        text-align: center;
        padding: 20px 24px;
        border: 2px dashed var(--border);
        border-radius: 10px;
        background: var(--surface);
        margin-bottom: 24px;
    }

    .highlight-box__label {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .1em;
        color: var(--muted);
        margin-bottom: 8px;
    }

    .highlight-box__value {
        font-size: 32px;
        font-weight: 800;
        letter-spacing: .12em;
        font-variant-numeric: tabular-nums;
        color: var(--ink);
        font-family: 'Courier New', Courier, monospace;
    }

    .highlight-box__sub {
        font-size: 11px;
        color: var(--muted);
        margin-top: 8px;
    }

    /* ---- Sections ---- */
    .section {
        margin-bottom: 24px;
    }

    .section:last-child { margin-bottom: 0; }

    .section-title {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .1em;
        color: var(--muted);
        margin-bottom: 12px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--border);
    }

    /* ---- Detail grid ---- */
    .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px 24px;
    }

    .detail-grid--3 {
        grid-template-columns: 1fr 1fr 1fr;
    }

    .detail-item {}

    .detail-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .06em;
        color: var(--dim);
        margin-bottom: 2px;
    }

    .detail-value {
        font-size: 13px;
        font-weight: 500;
        color: var(--ink);
        word-break: break-word;
    }

    .detail-value--mono {
        font-family: 'Courier New', Courier, monospace;
        font-weight: 700;
        color: var(--accent);
    }

    /* ---- Proof / description block ---- */
    .text-block {
        padding: 14px 16px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 13px;
        color: var(--ink);
        white-space: pre-wrap;
    }

    /* ---- Images ---- */
    .media-row {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        margin-top: 4px;
    }

    .media-card {
        flex: 0 0 auto;
    }

    .media-card__label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .06em;
        color: var(--dim);
        margin-bottom: 8px;
    }

    .media-card img {
        display: block;
        max-width: 180px;
        max-height: 180px;
        object-fit: cover;
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 6px;
        background: #fff;
    }

    .media-card img.qr-img {
        max-width: 160px;
        max-height: 160px;
        object-fit: contain;
        padding: 8px;
    }

    /* ---- Label slip (found item) ---- */
    .label-slip .doc-header {
        padding: 20px 24px 16px;
        border-bottom: 1px solid var(--border);
    }

    .label-slip .doc-body {
        padding: 20px 24px;
    }

    .label-ref {
        text-align: center;
        margin-bottom: 16px;
    }

    .label-ref__code {
        font-size: 22px;
        font-weight: 800;
        letter-spacing: .08em;
        font-family: 'Courier New', Courier, monospace;
        color: var(--accent);
    }

    .label-ref__hint {
        font-size: 10px;
        color: var(--muted);
        margin-top: 4px;
        text-transform: uppercase;
        letter-spacing: .08em;
    }

    .label-qr {
        text-align: center;
        padding: 16px;
        border: 2px solid var(--ink);
        border-radius: 10px;
        margin-bottom: 16px;
        background: #fff;
    }

    .label-qr img {
        display: inline-block;
        width: 140px;
        height: 140px;
        object-fit: contain;
    }

    .label-qr__scan {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .08em;
        color: var(--muted);
        margin-top: 10px;
    }

    .label-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }

    .label-cut {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 2px dashed var(--dim);
        text-align: center;
        font-size: 9px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .12em;
        color: var(--dim);
    }

    /* ---- Report stats row ---- */
    .stats-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 24px;
    }

    .stat-card {
        padding: 14px 16px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        text-align: center;
    }

    .stat-card__value {
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -.02em;
        line-height: 1;
    }

    .stat-card__label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .06em;
        color: var(--muted);
        margin-top: 6px;
    }

    /* ---- Table ---- */
    .report-table-wrap {
        overflow: hidden;
        border: 1px solid var(--border);
        border-radius: 8px;
    }

    .report-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
    }

    .report-table thead {
        background: var(--ink);
        color: #fff;
    }

    .report-table th {
        padding: 10px 12px;
        text-align: left;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .06em;
        white-space: nowrap;
    }

    .report-table td {
        padding: 9px 12px;
        border-bottom: 1px solid var(--border);
        vertical-align: top;
    }

    .report-table tbody tr:last-child td { border-bottom: none; }
    .report-table tbody tr:nth-child(even) { background: var(--surface); }

    .report-table .cell-mono {
        font-family: 'Courier New', Courier, monospace;
        font-size: 11px;
        color: var(--accent);
        font-weight: 600;
    }

    .report-table .cell-muted { color: var(--muted); font-size: 11px; }

    /* ---- Footer ---- */
    .doc-footer {
        padding: 16px 32px;
        border-top: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 10px;
        color: var(--dim);
    }

    .doc-footer__brand {
        font-weight: 700;
        color: var(--muted);
    }

    /* ---- Signature line ---- */
    .sig-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        margin-top: 32px;
        padding-top: 8px;
    }

    .sig-line {
        border-top: 1px solid var(--ink);
        padding-top: 8px;
        font-size: 11px;
        color: var(--muted);
    }

    /* ---- Print media ---- */
    @media print {
        body { background: #fff; }

        .no-print { display: none !important; }

        .print-page {
            max-width: none;
            margin: 0;
            border: none;
            border-radius: 0;
            box-shadow: none;
        }

        .print-page--landscape {
            max-width: none;
        }

        .doc-body, .doc-header, .doc-footer {
            padding-left: 0;
            padding-right: 0;
        }

        .report-table tbody tr:nth-child(even) {
            background: #f9f9f9;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .report-table thead {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .status-badge, .stat-card, .highlight-box, .label-qr {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    }

    @page {
        margin: 18mm 16mm;
    }

    @page landscape {
        size: landscape;
        margin: 14mm 12mm;
    }

    .print-page--landscape {
        page: landscape;
    }
</style>
