@php
    $statusClass = match(strtolower($status ?? '')) {
        'pending', 'under_review' => 'status-badge--pending',
        'approved' => 'status-badge--approved',
        'released', 'available', 'resolved' => 'status-badge--released',
        'rejected' => 'status-badge--rejected',
        default => 'status-badge--default',
    };
@endphp
<div class="doc-header">
    <div class="doc-brand">
        <div class="doc-logo">FB</div>
        <div>
            <div class="doc-brand-name">FindBack</div>
            <div class="doc-brand-tagline">Lost &amp; Found Management</div>
        </div>
    </div>
    <div class="doc-meta">
        <div class="doc-type">{{ $docType ?? 'Document' }}</div>
        @if(!empty($docId))
            <div class="doc-id">{{ $docId }}</div>
        @endif
        @if(!empty($status))
            <div style="margin-top:8px">
                <span class="status-badge {{ $statusClass }}">{{ ucfirst(str_replace('_', ' ', $status)) }}</span>
            </div>
        @endif
        <div class="doc-date">Generated {{ now()->format('M j, Y · g:i A') }}</div>
    </div>
</div>
