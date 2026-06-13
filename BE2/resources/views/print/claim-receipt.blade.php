<!DOCTYPE html>
<html lang="en">
<head>
    @include('print.partials.styles')
    <title>Claim Receipt #{{ $claimRequest->id }}</title>
</head>
<body>
    @include('print.partials.toolbar')

    <div class="print-page">
        @include('print.partials.header', [
            'docType' => 'Claim Receipt',
            'docId' => 'CLM-' . str_pad($claimRequest->id, 5, '0', STR_PAD_LEFT),
            'status' => $claimRequest->status,
        ])

        <div class="doc-body">
            @if($claimRequest->pickup_code)
                <div class="highlight-box">
                    <div class="highlight-box__label">Pickup Code — Present at collection</div>
                    <div class="highlight-box__value">{{ $claimRequest->pickup_code }}</div>
                    @if($claimRequest->pickup_code_expires_at)
                        <div class="highlight-box__sub">Expires {{ $claimRequest->pickup_code_expires_at->format('M j, Y · g:i A') }}</div>
                    @endif
                </div>
            @endif

            <div class="section">
                <div class="section-title">Claim Details</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Claim ID</div>
                        <div class="detail-value">#{{ $claimRequest->id }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Date Submitted</div>
                        <div class="detail-value">{{ $claimRequest->created_at?->format('M j, Y · g:i A') ?? 'N/A' }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Approved By</div>
                        <div class="detail-value">{{ $claimRequest->approver?->name ?? 'Pending' }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Approved At</div>
                        <div class="detail-value">{{ $claimRequest->approved_at?->format('M j, Y · g:i A') ?? 'N/A' }}</div>
                    </div>
                    @if($claimRequest->released_at)
                        <div class="detail-item">
                            <div class="detail-label">Released At</div>
                            <div class="detail-value">{{ $claimRequest->released_at->format('M j, Y · g:i A') }}</div>
                        </div>
                    @endif
                </div>
            </div>

            <div class="section">
                <div class="section-title">Claimant</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Full Name</div>
                        <div class="detail-value">{{ $claimRequest->claimant->name }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Email</div>
                        <div class="detail-value">{{ $claimRequest->claimant->email }}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Found Item</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Item Name</div>
                        <div class="detail-value">{{ $claimRequest->foundItem->item_name }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Reference Code</div>
                        <div class="detail-value detail-value--mono">{{ $claimRequest->foundItem->reference_code }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Category</div>
                        <div class="detail-value">{{ $claimRequest->foundItem->category?->name ?? 'N/A' }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Found Location</div>
                        <div class="detail-value">{{ $claimRequest->foundItem->found_location ?? 'N/A' }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Storage Location</div>
                        <div class="detail-value">{{ $claimRequest->foundItem->storage_location ?? 'N/A' }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Logged By</div>
                        <div class="detail-value">{{ $claimRequest->foundItem->staff?->name ?? 'N/A' }}</div>
                    </div>
                </div>
            </div>

            @if($claimRequest->proof_details)
                <div class="section">
                    <div class="section-title">Proof of Ownership</div>
                    <div class="text-block">{{ $claimRequest->proof_details }}</div>
                </div>
            @endif

            @if($claimRequest->proof_image_path)
                <div class="section">
                    <div class="section-title">Proof Image</div>
                    <div class="media-row">
                        <div class="media-card">
                            <img src="{{ asset('storage/' . $claimRequest->proof_image_path) }}" alt="Proof of ownership">
                        </div>
                    </div>
                </div>
            @endif

            <div class="sig-row">
                <div class="sig-line">Claimant Signature</div>
                <div class="sig-line">Staff / Admin Signature</div>
            </div>
        </div>

        @include('print.partials.footer')
    </div>
</body>
</html>
