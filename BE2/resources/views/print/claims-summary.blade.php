@php
    $total = $claimRequests->count();
    $pending = $claimRequests->where('status', 'pending')->count();
    $approved = $claimRequests->where('status', 'approved')->count();
    $released = $claimRequests->where('status', 'released')->count();
    $rejected = $claimRequests->where('status', 'rejected')->count();
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    @include('print.partials.styles')
    <title>Claims Summary Report</title>
</head>
<body>
    @include('print.partials.toolbar')

    <div class="print-page print-page--landscape">
        @include('print.partials.header', [
            'docType' => 'Claims Summary Report',
            'docId' => $total . ' Total Claims',
        ])

        <div class="doc-body">
            <div class="stats-row">
                <div class="stat-card">
                    <div class="stat-card__value">{{ $total }}</div>
                    <div class="stat-card__label">Total Claims</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__value" style="color:#b45309">{{ $pending }}</div>
                    <div class="stat-card__label">Pending</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__value" style="color:#1d4ed8">{{ $approved }}</div>
                    <div class="stat-card__label">Approved</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__value" style="color:#047857">{{ $released }}</div>
                    <div class="stat-card__label">Released</div>
                </div>
            </div>

            <div class="section" style="margin-bottom:0">
                <div class="section-title">All Claim Records @if($rejected > 0)<span style="font-weight:500;text-transform:none;letter-spacing:0;color:var(--dim)"> · {{ $rejected }} rejected</span>@endif</div>
                <div class="report-table-wrap">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Claimant</th>
                                <th>Item</th>
                                <th>Ref Code</th>
                                <th>Status</th>
                                <th>Approver</th>
                                <th>Approved</th>
                                <th>Released</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($claimRequests as $claimRequest)
                                <tr>
                                    <td class="cell-mono">#{{ $claimRequest->id }}</td>
                                    <td>
                                        {{ $claimRequest->claimant->name ?? 'N/A' }}
                                        @if($claimRequest->claimant?->email)
                                            <div class="cell-muted">{{ $claimRequest->claimant->email }}</div>
                                        @endif
                                    </td>
                                    <td>{{ $claimRequest->foundItem->item_name ?? 'N/A' }}</td>
                                    <td class="cell-mono">{{ $claimRequest->foundItem->reference_code ?? '—' }}</td>
                                    <td>{{ ucfirst($claimRequest->status) }}</td>
                                    <td>{{ $claimRequest->approver->name ?? '—' }}</td>
                                    <td class="cell-muted">{{ $claimRequest->approved_at?->format('M j, Y') ?? '—' }}</td>
                                    <td class="cell-muted">{{ $claimRequest->released_at?->format('M j, Y') ?? '—' }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="8" style="text-align:center;padding:32px;color:var(--muted)">No claim records found.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        @include('print.partials.footer')
    </div>
</body>
</html>
