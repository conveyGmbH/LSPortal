/**
 * Read-only Apex controller for the LeadSuccess Console LWC. Lead_Sync_Log__c
 * rows are written by crm-backend (jsforce) directly, never from this class —
 * this only serves the dashboard's KPI + list queries.
 */
public with sharing class LeadSyncLogController {

    public class DashboardData {
        @AuraEnabled public Integer totalLeads;
        @AuraEnabled public Integer syncedCount;
        @AuraEnabled public Integer failedCount;
        @AuraEnabled public Integer duplicateCount;
        @AuraEnabled public Decimal successRate;
        @AuraEnabled public List<Lead_Sync_Log__c> logs;
    }

    @AuraEnabled(cacheable=true)
    public static DashboardData getDashboardData(String eventName, Date fromDate, Date toDate) {
        DashboardData result = new DashboardData();

        List<String> conditions = new List<String>();
        if (String.isNotBlank(eventName)) {
            conditions.add('EventName__c = :eventName');
        }
        if (fromDate != null) {
            conditions.add('SyncedAt__c >= :fromDate');
        }
        if (toDate != null) {
            DateTime toDateTimeExclusive = DateTime.newInstance(toDate.addDays(1), Time.newInstance(0, 0, 0, 0));
            conditions.add('SyncedAt__c < :toDateTimeExclusive');
        }

        String whereClause = conditions.isEmpty() ? '' : ' WHERE ' + String.join(conditions, ' AND ');

        String query = 'SELECT Id, Name, LS_LeadId__c, Status__c, RecordType__c, ' +
            'ErrorMessage__c, TargetRecordId__c, TargetAccountId__c, CompanyName__c, ' +
            'ContactName__c, Email__c, EventName__c, SyncedAt__c ' +
            'FROM Lead_Sync_Log__c' + whereClause +
            ' ORDER BY SyncedAt__c DESC LIMIT 200';

        result.logs = Database.query(query);

        result.totalLeads = result.logs.size();
        result.syncedCount = 0;
        result.failedCount = 0;
        result.duplicateCount = 0;

        for (Lead_Sync_Log__c logRow : result.logs) {
            if (logRow.Status__c == 'Synced') {
                result.syncedCount++;
            } else if (logRow.Status__c == 'Failed') {
                result.failedCount++;
            } else if (logRow.Status__c == 'Duplicate') {
                result.duplicateCount++;
            }
        }

        Integer processed = result.syncedCount + result.failedCount + result.duplicateCount;
        result.successRate = processed > 0
            ? (Decimal.valueOf(result.syncedCount) / processed * 100).setScale(1)
            : 0;

        return result;
    }

    /**
     * Re-runs the original sync attempt from this log row. Placeholder for now —
     * actually re-posting to crm-backend from Apex needs a Named Credential
     * pointed at the backend, not yet configured. Left as a clear
     * AuraHandledException rather than a silent no-op so the LWC can surface
     * "not available yet" instead of a fake success.
     */
    @AuraEnabled
    public static void retrySync(Id logId) {
        throw new AuraHandledException('Retry from Salesforce is not available yet — retry the transfer from the LeadSuccess Portal instead.');
    }
}
