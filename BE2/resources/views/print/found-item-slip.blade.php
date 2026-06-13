<!DOCTYPE html>
<html lang="en">
<head>
    @include('print.partials.styles')
    <title>Found Item Slip — {{ $foundItem->reference_code }}</title>
</head>
<body>
    @include('print.partials.toolbar')

    <div class="print-page print-page--label label-slip">
        @include('print.partials.header', [
            'docType' => 'Found Item Label',
            'docId' => $foundItem->reference_code,
            'status' => $foundItem->status,
        ])

        <div class="doc-body doc-body--compact">
            <div class="label-ref">
                <div class="label-ref__code">{{ $foundItem->reference_code }}</div>
                <div class="label-ref__hint">Reference Code · Attach to physical item</div>
            </div>

            @if($foundItem->qr_code_path)
                <div class="label-qr">
                    <img src="{{ asset('storage/' . $foundItem->qr_code_path) }}" alt="QR Code for {{ $foundItem->reference_code }}">
                    <div class="label-qr__scan">Scan to look up this item</div>
                </div>
            @endif

            <div class="label-details">
                <div class="detail-item">
                    <div class="detail-label">Item Name</div>
                    <div class="detail-value">{{ $foundItem->item_name }}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Category</div>
                    <div class="detail-value">{{ $foundItem->category?->name ?? 'N/A' }}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Color</div>
                    <div class="detail-value">{{ $foundItem->color ?? 'N/A' }}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date Found</div>
                    <div class="detail-value">{{ $foundItem->date_found?->format('M j, Y') ?? 'N/A' }}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Found Location</div>
                    <div class="detail-value">{{ $foundItem->found_location ?? 'N/A' }}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Storage Location</div>
                    <div class="detail-value">{{ $foundItem->storage_location ?? 'N/A' }}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Logged By</div>
                    <div class="detail-value">{{ $foundItem->staff?->name ?? 'N/A' }}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">{{ ucfirst(str_replace('_', ' ', $foundItem->status)) }}</div>
                </div>
            </div>

            @if($foundItem->description)
                <div class="section" style="margin-top:16px;margin-bottom:0">
                    <div class="section-title">Description</div>
                    <div class="text-block" style="font-size:12px;padding:10px 12px">{{ $foundItem->description }}</div>
                </div>
            @endif

            @if($foundItem->image_path)
                <div class="media-row" style="margin-top:16px">
                    <div class="media-card">
                        <div class="media-card__label">Item Photo</div>
                        <img src="{{ asset('storage/' . $foundItem->image_path) }}" alt="Found item photo">
                    </div>
                </div>
            @endif

            <div class="label-cut">✂ Cut along dashed line · FindBack Lost &amp; Found</div>
        </div>

        @include('print.partials.footer')
    </div>
</body>
</html>
