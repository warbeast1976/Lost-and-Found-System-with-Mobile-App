<!DOCTYPE html>
<html lang="en">
<head>
    @include('print.partials.styles')
    <title>Lost Item Report — {{ $lostItem->item_name }}</title>
</head>
<body>
    @include('print.partials.toolbar')

    <div class="print-page">
        @include('print.partials.header', [
            'docType' => 'Lost Item Report',
            'docId' => 'LST-' . str_pad($lostItem->id, 5, '0', STR_PAD_LEFT),
            'status' => $lostItem->status,
        ])

        <div class="doc-body">
            <div class="section">
                <div class="section-title">Reporter</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Full Name</div>
                        <div class="detail-value">{{ $lostItem->user->name ?? 'N/A' }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Email</div>
                        <div class="detail-value">{{ $lostItem->user->email ?? 'N/A' }}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Item Details</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Item Name</div>
                        <div class="detail-value">{{ $lostItem->item_name }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Category</div>
                        <div class="detail-value">{{ $lostItem->category?->name ?? 'N/A' }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Color</div>
                        <div class="detail-value">{{ $lostItem->color ?? 'N/A' }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Date Lost</div>
                        <div class="detail-value">{{ $lostItem->date_lost?->format('M j, Y') ?? 'N/A' }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Last Seen Location</div>
                        <div class="detail-value">{{ $lostItem->last_seen_location ?? 'N/A' }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Report Status</div>
                        <div class="detail-value">{{ ucfirst(str_replace('_', ' ', $lostItem->status)) }}</div>
                    </div>
                </div>
            </div>

            @if($lostItem->description)
                <div class="section">
                    <div class="section-title">Description</div>
                    <div class="text-block">{{ $lostItem->description }}</div>
                </div>
            @endif

            @if($lostItem->image_path)
                <div class="section">
                    <div class="section-title">Reference Photo</div>
                    <div class="media-row">
                        <div class="media-card">
                            <img src="{{ asset('storage/' . $lostItem->image_path) }}" alt="Lost item photo">
                        </div>
                    </div>
                </div>
            @endif

            <div class="section" style="margin-top:32px;margin-bottom:0">
                <div class="text-block" style="font-size:12px;color:var(--muted);background:var(--accent-bg);border-color:#bfdbfe">
                    Keep this report for your records. If a matching found item is located, you will be notified through the FindBack platform. Report ID: LST-{{ str_pad($lostItem->id, 5, '0', STR_PAD_LEFT) }}
                </div>
            </div>
        </div>

        @include('print.partials.footer')
    </div>
</body>
</html>
