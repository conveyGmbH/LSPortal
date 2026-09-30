import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getDashboardData from '@salesforce/apex/LeadSyncLogController.getDashboardData';
import retrySync from '@salesforce/apex/LeadSyncLogController.retrySync';

const STATUS_FILTERS = ['all', 'Synced', 'Failed', 'Duplicate'];

export default class LeadSuccessConsole extends LightningElement {
    @track logs = [];
    @track selectedLog = null;
    @track statusFilter = 'all';
    @track searchTerm = '';
    @track isDrawerOpen = false;

    totalLeads = 0;
    syncedCount = 0;
    failedCount = 0;
    duplicateCount = 0;
    successRate = 0;

    wiredResult;

    @wire(getDashboardData, { eventName: null, fromDate: null, toDate: null })
    wiredDashboard(result) {
        this.wiredResult = result;
        if (result.data) {
            this.totalLeads = result.data.totalLeads;
            this.syncedCount = result.data.syncedCount;
            this.failedCount = result.data.failedCount;
            this.duplicateCount = result.data.duplicateCount;
            this.successRate = result.data.successRate;
            this.logs = result.data.logs || [];
        } else if (result.error) {
            this.showToast('Error', 'Could not load LeadSuccess sync data.', 'error');
        }
    }

    // --- Filtering ---

    get filteredLogs() {
        const term = this.searchTerm.trim().toLowerCase();
        return this.logs
            .filter((log) => this.statusFilter === 'all' || log.Status__c === this.statusFilter)
            .filter((log) => {
                if (!term) return true;
                const haystack = `${log.CompanyName__c || ''} ${log.ContactName__c || ''} ${log.Email__c || ''}`.toLowerCase();
                return haystack.includes(term);
            })
            .map((log) => ({
                ...log,
                statusBadgeClass: this.badgeClassForStatus(log.Status__c),
                recordTypeBadgeClass: log.RecordType__c === 'Account + Contact' ? 'pill pill--accent' : 'pill pill--neutral',
                canRetry: log.Status__c === 'Failed'
            }));
    }

    badgeClassForStatus(status) {
        if (status === 'Synced') return 'pill pill--success';
        if (status === 'Failed') return 'pill pill--error';
        if (status === 'Duplicate') return 'pill pill--warning';
        return 'pill pill--neutral';
    }

    get statusFilterOptions() {
        return STATUS_FILTERS.map((value) => ({
            value,
            label: value === 'all' ? 'All' : value,
            variant: this.statusFilter === value ? 'brand' : 'neutral'
        }));
    }

    handleFilterClick(event) {
        this.statusFilter = event.currentTarget.dataset.status;
    }

    handleSearchInput(event) {
        this.searchTerm = event.target.value;
    }

    // --- KPI cards ---

    get kpiCards() {
        return [
            { key: 'total', label: 'Total leads', value: this.totalLeads, sub: 'All logged sync attempts', cardClass: 'kpi-card neutral' },
            { key: 'synced', label: 'Synced', value: this.syncedCount, sub: 'Created or matched in Salesforce', cardClass: 'kpi-card success' },
            { key: 'failed', label: 'Failed', value: this.failedCount, sub: 'Needs attention', cardClass: 'kpi-card error' },
            { key: 'duplicate', label: 'Duplicates', value: this.duplicateCount, sub: 'Matched existing records', cardClass: 'kpi-card warning' },
            { key: 'rate', label: 'Success rate', value: `${this.successRate}%`, sub: `${this.syncedCount} of ${this.totalLeads} processed`, cardClass: 'kpi-card accent' }
        ];
    }

    // --- Leads by account (dedup visibility) ---

    get accountBreakdown() {
        const byCompany = new Map();
        this.logs.forEach((log) => {
            const key = (log.CompanyName__c || 'Unknown').trim();
            byCompany.set(key, (byCompany.get(key) || 0) + 1);
        });
        return Array.from(byCompany.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([company, count]) => ({ company, count }));
    }

    get accountBreakdownSummary() {
        const companyCount = this.accountBreakdown.length;
        return `${this.totalLeads} leads → ${companyCount} ${companyCount === 1 ? 'company' : 'companies'}`;
    }

    // --- Deep dive drawer ---

    handleRowClick(event) {
        const logId = event.currentTarget.dataset.id;
        this.selectedLog = this.logs.find((log) => log.Id === logId) || null;
        this.isDrawerOpen = !!this.selectedLog;
    }

    closeDrawer() {
        this.isDrawerOpen = false;
        this.selectedLog = null;
    }

    handleRetryClick(event) {
        event.stopPropagation();
        const logId = event.currentTarget.dataset.id;
        this.retryLog(logId);
    }

    handleDrawerRetry() {
        if (this.selectedLog) this.retryLog(this.selectedLog.Id);
    }

    retryLog(logId) {
        retrySync({ logId })
            .then(() => {
                this.showToast('Retry queued', 'The sync will be retried.', 'success');
                return refreshApex(this.wiredResult);
            })
            .catch((error) => {
                const message = error?.body?.message || 'Retry is not available yet.';
                this.showToast('Retry unavailable', message, 'warning');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
